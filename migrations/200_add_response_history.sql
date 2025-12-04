-- Migration: Add response_history column for reconsider feature
-- Allows athletes to reconsider declined opportunities within 48 hours

-- Add response_history column to agency_athlete_matches
ALTER TABLE agency_athlete_matches
ADD COLUMN IF NOT EXISTS response_history JSONB DEFAULT '[]'::jsonb;

-- Add responded_at column to track when athlete last responded
ALTER TABLE agency_athlete_matches
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Add response_history column to campaign_athletes (invites)
ALTER TABLE campaign_athletes
ADD COLUMN IF NOT EXISTS response_history JSONB DEFAULT '[]'::jsonb;

-- Add responded_at column to campaign_athletes
ALTER TABLE campaign_athletes
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Add comment explaining the response_history structure
COMMENT ON COLUMN agency_athlete_matches.response_history IS
'JSON array tracking response history: [{"status": "declined", "timestamp": "2024-01-01T00:00:00Z", "reason": "optional"}, {"status": "reconsidered", "timestamp": "2024-01-02T00:00:00Z"}]';

COMMENT ON COLUMN campaign_athletes.response_history IS
'JSON array tracking response history: [{"status": "declined", "timestamp": "2024-01-01T00:00:00Z"}, {"status": "reconsidered", "timestamp": "2024-01-02T00:00:00Z"}]';

-- Create index for faster queries on responded_at (for finding reconsider-eligible items)
CREATE INDEX IF NOT EXISTS idx_matches_responded_at ON agency_athlete_matches(responded_at) WHERE status = 'declined';
CREATE INDEX IF NOT EXISTS idx_invites_responded_at ON campaign_athletes(responded_at) WHERE status = 'declined';

-- Grant permissions
GRANT ALL ON agency_athlete_matches TO authenticated;
GRANT ALL ON agency_athlete_matches TO service_role;
GRANT ALL ON campaign_athletes TO authenticated;
GRANT ALL ON campaign_athletes TO service_role;
