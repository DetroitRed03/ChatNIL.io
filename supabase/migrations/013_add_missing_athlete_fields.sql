-- Migration: Add missing athlete profile fields
-- Description: Adds columns for secondary_sports, school_level, coach info, nil_goals, stats, and bio
-- Created: 2025-10-02

-- Add missing athlete profile columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS secondary_sports TEXT[],
  ADD COLUMN IF NOT EXISTS school_level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS coach_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS coach_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nil_goals TEXT[],
  ADD COLUMN IF NOT EXISTS stats JSONB,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_school_level ON users(school_level);
CREATE INDEX IF NOT EXISTS idx_users_secondary_sports ON users USING gin(secondary_sports);
CREATE INDEX IF NOT EXISTS idx_users_nil_goals ON users USING gin(nil_goals);

-- Add comments for documentation
COMMENT ON COLUMN users.secondary_sports IS 'Additional sports the athlete participates in';
COMMENT ON COLUMN users.school_level IS 'Education level: high_school, college_freshman, college_sophomore, college_junior, college_senior, graduate';
COMMENT ON COLUMN users.coach_name IS 'Name of primary coach or advisor';
COMMENT ON COLUMN users.coach_email IS 'Contact email for primary coach';
COMMENT ON COLUMN users.nil_goals IS 'Athlete NIL goals and objectives';
COMMENT ON COLUMN users.stats IS 'Athletic performance statistics as JSON object';
COMMENT ON COLUMN users.bio IS 'Athlete biographical information and personal story';
