-- Migration 006: Create badges table for gamification system
-- This table stores all available badges that users can earn

-- Create badge rarity enum
DO $$ BEGIN
    CREATE TYPE badge_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create badge category enum
DO $$ BEGIN
    CREATE TYPE badge_category AS ENUM ('learning', 'engagement', 'social', 'achievement', 'milestone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Badge information
  name varchar(100) NOT NULL UNIQUE,
  description text NOT NULL,
  icon varchar(255), -- URL or icon identifier

  -- Badge classification
  category badge_category NOT NULL,
  rarity badge_rarity NOT NULL DEFAULT 'common',

  -- Earning criteria (JSON structure for flexible criteria definition)
  criteria jsonb NOT NULL DEFAULT '{}',

  -- Reward information
  points integer NOT NULL DEFAULT 0,

  -- Badge metadata
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Badges are publicly readable but only admins can modify
CREATE POLICY "Everyone can read active badges" ON badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage badges" ON badges
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_badges_display_order ON badges(display_order);
CREATE INDEX IF NOT EXISTS idx_badges_created_at ON badges(created_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_badges_updated_at
    BEFORE UPDATE ON badges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments for documentation
COMMENT ON TABLE badges IS 'Available badges that users can earn through various activities';
COMMENT ON COLUMN badges.criteria IS 'JSON structure defining how to earn this badge (e.g., {"quizzes_completed": 5, "min_score": 80})';
COMMENT ON COLUMN badges.points IS 'Points awarded when this badge is earned';
COMMENT ON COLUMN badges.category IS 'Badge category: learning, engagement, social, achievement, or milestone';
COMMENT ON COLUMN badges.rarity IS 'Badge rarity level: common, uncommon, rare, epic, or legendary';

-- Insert some default NIL-related badges
INSERT INTO badges (name, description, icon, category, rarity, criteria, points, display_order) VALUES
  ('NIL Novice', 'Complete your first NIL education quiz', 'trophy', 'learning', 'common', '{"quizzes_completed": 1}', 10, 1),
  ('Quick Learner', 'Complete 5 NIL education quizzes', 'book', 'learning', 'uncommon', '{"quizzes_completed": 5}', 50, 2),
  ('NIL Scholar', 'Complete 10 NIL education quizzes with 80%+ average', 'graduation-cap', 'learning', 'rare', '{"quizzes_completed": 10, "min_avg_score": 80}', 100, 3),
  ('First Steps', 'Send your first message in the chat', 'message-circle', 'engagement', 'common', '{"messages_sent": 1}', 5, 4),
  ('Conversationalist', 'Send 50 messages in the chat', 'messages', 'engagement', 'uncommon', '{"messages_sent": 50}', 25, 5),
  ('Profile Complete', 'Complete 100% of your profile information', 'user-check', 'achievement', 'uncommon', '{"profile_completion": 100}', 30, 6),
  ('Early Adopter', 'Join ChatNIL in the first month', 'star', 'milestone', 'rare', '{"joined_before": "2025-01-31"}', 75, 7),
  ('Deal Maker', 'Log your first NIL opportunity', 'handshake', 'achievement', 'uncommon', '{"opportunities_logged": 1}', 40, 8),
  ('Social Star', 'Connect with 10 other users', 'users', 'social', 'rare', '{"connections": 10}', 60, 9),
  ('Perfect Score', 'Score 100% on any NIL quiz', 'award', 'achievement', 'epic', '{"perfect_quiz_score": 1}', 150, 10)
ON CONFLICT (name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 006 completed: badges table created successfully!';
    RAISE NOTICE 'Badge system initialized with 10 default badges';
END $$;
