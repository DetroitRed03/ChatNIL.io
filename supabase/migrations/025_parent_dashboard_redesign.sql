-- Migration 025: Parent Dashboard Redesign
-- Adds tables for co-parent invites, notification preferences, and action items

-- Add full_name to users if not exists (CRITICAL FIX for username display issue)
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Update existing users to have full_name from first_name + last_name
UPDATE users
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL AND first_name IS NOT NULL;

-- Co-parent invites table
CREATE TABLE IF NOT EXISTS coparent_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255) NOT NULL,
  invitee_name VARCHAR(255),
  relationship VARCHAR(50) DEFAULT 'parent',
  status VARCHAR(20) DEFAULT 'pending',
  invite_token UUID UNIQUE DEFAULT gen_random_uuid(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent notification preferences
CREATE TABLE IF NOT EXISTS parent_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weekly_summary BOOLEAN DEFAULT true,
  chapter_complete BOOLEAN DEFAULT true,
  badge_earned BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  inactivity_alert BOOLEAN DEFAULT true,
  inactivity_threshold_days INT DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Parent action items (things that need attention)
CREATE TABLE IF NOT EXISTS parent_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  -- types: 'review_deal', 'approve_activity', 'inactivity_warning', 'milestone_reached'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'normal',
  -- priority: 'low', 'normal', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'pending',
  -- status: 'pending', 'completed', 'dismissed'
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Child activity log for parent visibility
CREATE TABLE IF NOT EXISTS child_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  -- types: 'chapter_started', 'chapter_completed', 'question_answered', 'badge_earned',
  -- 'streak_milestone', 'daily_challenge', 'login', 'profile_updated', 'parent_approved'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_parent_action_items_parent ON parent_action_items(parent_id, status);
CREATE INDEX IF NOT EXISTS idx_parent_action_items_priority ON parent_action_items(priority, status);
CREATE INDEX IF NOT EXISTS idx_parent_notification_prefs ON parent_notification_preferences(parent_id);
CREATE INDEX IF NOT EXISTS idx_coparent_invites_inviter ON coparent_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_coparent_invites_token ON coparent_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_child_activity_log_child ON child_activity_log(child_id);
CREATE INDEX IF NOT EXISTS idx_child_activity_log_created ON child_activity_log(created_at DESC);

-- Disable RLS for simplicity (accessed via authenticated API routes)
ALTER TABLE coparent_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE parent_notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE parent_action_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE child_activity_log DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE coparent_invites IS 'Tracks invitations for co-parents to access child progress';
COMMENT ON TABLE parent_notification_preferences IS 'Parent notification settings per child';
COMMENT ON TABLE parent_action_items IS 'Action items requiring parent attention';
COMMENT ON TABLE child_activity_log IS 'Activity log visible to parents';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 025 completed: Parent dashboard tables created successfully!';
END $$;
