-- Migration 007: Create user_badges table to track earned badges
-- This is a junction table connecting users with their earned badges

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

  -- Earning details
  earned_at timestamp with time zone DEFAULT now(),
  progress jsonb DEFAULT '{}', -- Track progress toward badge if applicable

  -- Display preferences
  is_displayed boolean DEFAULT false, -- Whether user displays this badge on their profile
  display_order integer DEFAULT 0,

  -- Metadata
  notes text, -- Optional notes about how/when earned
  awarded_by uuid REFERENCES users(id), -- If manually awarded by admin/coach

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Unique constraint: user can only earn each badge once
  UNIQUE(user_id, badge_id)
);

-- Enable Row Level Security
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view displayed badges of other users
CREATE POLICY "Users can view displayed badges of others" ON user_badges
  FOR SELECT USING (is_displayed = true);

-- Users can update their own badge display preferences
CREATE POLICY "Users can update own badge display" ON user_badges
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only system/service role can insert new badges (earned through backend logic)
CREATE POLICY "Service role can award badges" ON user_badges
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Service role can manage all user badges
CREATE POLICY "Service role can manage user badges" ON user_badges
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_displayed ON user_badges(is_displayed);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_displayed ON user_badges(user_id, is_displayed);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_badges_updated_at
    BEFORE UPDATE ON user_badges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments for documentation
COMMENT ON TABLE user_badges IS 'Junction table tracking which badges each user has earned';
COMMENT ON COLUMN user_badges.progress IS 'JSON tracking progress toward earning this badge (if in progress)';
COMMENT ON COLUMN user_badges.is_displayed IS 'Whether this badge is displayed on user profile';
COMMENT ON COLUMN user_badges.awarded_by IS 'User ID of admin/coach who manually awarded this badge (if applicable)';

-- Create helper function to award a badge to a user
CREATE OR REPLACE FUNCTION award_badge_to_user(
  p_user_id uuid,
  p_badge_id uuid,
  p_awarded_by uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_user_badge_id uuid;
BEGIN
  -- Insert the badge award (will fail if already earned due to unique constraint)
  INSERT INTO user_badges (user_id, badge_id, awarded_by, notes)
  VALUES (p_user_id, p_badge_id, p_awarded_by, p_notes)
  ON CONFLICT (user_id, badge_id) DO NOTHING
  RETURNING id INTO v_user_badge_id;

  RETURN v_user_badge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get user's badge count
CREATE OR REPLACE FUNCTION get_user_badge_count(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM user_badges
  WHERE user_id = p_user_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get user's total points from badges
CREATE OR REPLACE FUNCTION get_user_badge_points(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_total_points integer;
BEGIN
  SELECT COALESCE(SUM(b.points), 0)
  INTO v_total_points
  FROM user_badges ub
  JOIN badges b ON ub.badge_id = b.id
  WHERE ub.user_id = p_user_id;

  RETURN v_total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for functions
COMMENT ON FUNCTION award_badge_to_user IS 'Awards a badge to a user, returns user_badge_id or NULL if already earned';
COMMENT ON FUNCTION get_user_badge_count IS 'Returns the total number of badges earned by a user';
COMMENT ON FUNCTION get_user_badge_points IS 'Returns the total points from all badges earned by a user';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 007 completed: user_badges table created successfully!';
    RAISE NOTICE 'Helper functions created: award_badge_to_user, get_user_badge_count, get_user_badge_points';
END $$;
