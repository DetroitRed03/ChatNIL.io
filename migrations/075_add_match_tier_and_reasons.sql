-- Migration 075: Add missing match_tier and match_reasons columns
-- These columns are required by the matchmaking API but were missing from the original schema

-- Add match_tier column with constraint
ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS match_tier TEXT
    CHECK (match_tier IN ('excellent', 'good', 'potential', 'poor'));

-- Add match_reasons column (array of text)
ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS match_reasons TEXT[];

-- Add index on match_tier for faster filtering
CREATE INDEX IF NOT EXISTS idx_matches_tier
  ON agency_athlete_matches(match_tier);

-- Add index on agency_id and match_tier for common queries
CREATE INDEX IF NOT EXISTS idx_matches_agency_tier
  ON agency_athlete_matches(agency_id, match_tier);

-- Add comments for documentation
COMMENT ON COLUMN agency_athlete_matches.match_tier IS
  'Match quality tier: excellent (75+), good (55-74), potential (35-54), poor (<35)';

COMMENT ON COLUMN agency_athlete_matches.match_reasons IS
  'Array of text reasons explaining why this is a good match (e.g., "Strong engagement rate", "Geographic match")';

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 075 completed successfully';
  RAISE NOTICE 'Added match_tier and match_reasons columns to agency_athlete_matches';
END $$;
