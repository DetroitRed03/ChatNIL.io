-- Add username column to athlete_profiles for direct routing
-- This avoids the complexity of creating user accounts for test data

ALTER TABLE athlete_profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Generate usernames from existing data
-- Format: sport-position-school (e.g., "football-wr-usc")
UPDATE athlete_profiles
SET username = LOWER(
  REGEXP_REPLACE(
    CONCAT(
      COALESCE(sport, 'athlete'),
      '-',
      COALESCE(position, 'player'),
      '-',
      COALESCE(school, 'university')
    ),
    '[^a-z0-9-]', '', 'g'
  )
)
WHERE username IS NULL;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_username
ON athlete_profiles(username);

-- Grant access
GRANT SELECT ON athlete_profiles TO anon, authenticated;
