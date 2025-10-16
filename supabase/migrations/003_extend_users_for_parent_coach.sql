-- ChatNIL - Extend Users Table for Parent/Coach Features
-- This migration extends the existing users table to support parent and coach specific fields

-- Add new columns to existing users table for parent/coach functionality
ALTER TABLE users ADD COLUMN IF NOT EXISTS connected_athletes UUID[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS dashboard_access_level TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS compliance_settings JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_athletes UUID[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS relationship_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS division TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_connected_athletes ON users USING gin(connected_athletes);
CREATE INDEX IF NOT EXISTS idx_users_managed_athletes ON users USING gin(managed_athletes);
CREATE INDEX IF NOT EXISTS idx_users_dashboard_access_level ON users(dashboard_access_level);
CREATE INDEX IF NOT EXISTS idx_users_relationship_type ON users(relationship_type);

-- Add comments for new fields
COMMENT ON COLUMN users.connected_athletes IS 'Array of athlete UUIDs connected to this parent user';
COMMENT ON COLUMN users.dashboard_access_level IS 'Parent dashboard access level: full, limited, view_only';
COMMENT ON COLUMN users.notification_preferences IS 'JSON preferences for notifications about athlete activities';
COMMENT ON COLUMN users.compliance_settings IS 'JSON settings for compliance and oversight preferences';
COMMENT ON COLUMN users.managed_athletes IS 'Array of athlete UUIDs managed by this coach user';
COMMENT ON COLUMN users.relationship_type IS 'For parents: mother, father, guardian, etc.';
COMMENT ON COLUMN users.title IS 'For coaches: head_coach, assistant_coach, coordinator, etc.';
COMMENT ON COLUMN users.division IS 'For coaches: NCAA Division I, II, III, NAIA, etc.';
COMMENT ON COLUMN users.team_name IS 'For coaches: specific team name if different from school';