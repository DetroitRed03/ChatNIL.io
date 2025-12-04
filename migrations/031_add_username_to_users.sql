-- Migration: Add username column to users table
-- This enables public profile URLs at /athletes/[username]

-- Add username column (nullable initially to avoid breaking existing users)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add constraint to ensure usernames are lowercase and alphanumeric with hyphens/underscores only
ALTER TABLE users
ADD CONSTRAINT username_format
CHECK (username ~ '^[a-z0-9_-]+$');

-- Set default usernames for existing test accounts based on first_name and last_name
-- Example: Sarah Johnson -> sarah-johnson
UPDATE users
SET username = LOWER(CONCAT(
  REPLACE(first_name, ' ', '-'),
  '-',
  REPLACE(last_name, ' ', '-')
))
WHERE username IS NULL
AND first_name IS NOT NULL
AND last_name IS NOT NULL
AND role = 'athlete';

-- Add comment for documentation
COMMENT ON COLUMN users.username IS 'Unique username for public profile URLs. Format: lowercase alphanumeric with hyphens/underscores only.';
