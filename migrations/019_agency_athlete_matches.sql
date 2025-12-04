-- ============================================================================
-- Migration 019: Agency-Athlete Matches Table
-- ============================================================================
-- Creates the agency_athlete_matches table to store matchmaking results
-- Tracks match scores, recommendations, and contact status
-- Includes indexes for search and filtering
-- ============================================================================

-- Create ENUM for match status
CREATE TYPE match_status AS ENUM (
  'suggested',      -- System suggested this match
  'saved',          -- Agency saved for later
  'contacted',      -- Agency reached out
  'interested',     -- Athlete expressed interest
  'in_discussion',  -- Actively negotiating
  'partnered',      -- Deal created
  'rejected',       -- Either party rejected
  'expired'         -- Match suggestion expired
);

-- Create agency_athlete_matches table
CREATE TABLE agency_athlete_matches (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship fields
  agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Match scoring (0-100)
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),

  -- Detailed score breakdown
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "brand_values": 18,      -- out of 20
  --   "interests": 17,         -- out of 20
  --   "campaign_fit": 14,      -- out of 15
  --   "budget": 13,            -- out of 15
  --   "geography": 8,          -- out of 10
  --   "demographics": 9,       -- out of 10
  --   "engagement": 9          -- out of 10
  -- }

  -- Match reasoning and insights
  match_reason TEXT,  -- AI-generated explanation of why this is a good match
  match_highlights JSONB DEFAULT '[]'::jsonb,  -- Key selling points
  -- Example: [
  --   "Strong alignment on sustainability values",
  --   "Target demographic overlap: 85%",
  --   "High engagement rate in relevant content"
  -- ]

  -- Status and workflow
  status match_status DEFAULT 'suggested' NOT NULL,

  -- Communication tracking
  contacted_at TIMESTAMPTZ,
  contacted_by UUID REFERENCES users(id),  -- Which user initiated contact
  contact_method TEXT,  -- 'platform_message', 'email', 'phone', etc.

  -- Response tracking
  athlete_response_at TIMESTAMPTZ,
  athlete_response_status TEXT,  -- 'interested', 'not_interested', 'more_info_needed'

  agency_notes TEXT,  -- Private notes for agency
  athlete_notes TEXT,  -- Private notes for athlete

  -- Deal conversion tracking
  deal_id UUID REFERENCES nil_deals(id) ON DELETE SET NULL,  -- If a deal was created from this match
  deal_created_at TIMESTAMPTZ,

  -- Match quality feedback
  agency_feedback_rating INTEGER CHECK (agency_feedback_rating >= 1 AND agency_feedback_rating <= 5),
  athlete_feedback_rating INTEGER CHECK (athlete_feedback_rating >= 1 AND athlete_feedback_rating <= 5),
  feedback_comments TEXT,

  -- Algorithm metadata
  algorithm_version TEXT,  -- Track which version of matching algorithm was used
  match_factors_used JSONB,  -- Which factors were considered in this match
  athlete_profile_snapshot JSONB,  -- Snapshot of athlete profile at match time
  agency_criteria_snapshot JSONB,  -- Snapshot of agency criteria at match time

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,  -- When this match suggestion expires

  -- Constraints
  CONSTRAINT unique_agency_athlete_match UNIQUE(agency_id, athlete_id),
  CONSTRAINT athlete_not_agency CHECK (athlete_id != agency_id)
);

-- Create indexes for performance
CREATE INDEX idx_matches_agency_id ON agency_athlete_matches(agency_id);
CREATE INDEX idx_matches_athlete_id ON agency_athlete_matches(athlete_id);
CREATE INDEX idx_matches_status ON agency_athlete_matches(status);
CREATE INDEX idx_matches_score ON agency_athlete_matches(match_score DESC);
CREATE INDEX idx_matches_created_at ON agency_athlete_matches(created_at DESC);
CREATE INDEX idx_matches_deal_id ON agency_athlete_matches(deal_id) WHERE deal_id IS NOT NULL;

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_matches_score_breakdown ON agency_athlete_matches USING gin(score_breakdown);
CREATE INDEX idx_matches_highlights ON agency_athlete_matches USING gin(match_highlights);

-- Create composite indexes for common queries
CREATE INDEX idx_matches_agency_status ON agency_athlete_matches(agency_id, status);
CREATE INDEX idx_matches_athlete_status ON agency_athlete_matches(athlete_id, status);
CREATE INDEX idx_matches_agency_score ON agency_athlete_matches(agency_id, match_score DESC);

-- Index for filtering active matches by status
CREATE INDEX idx_matches_active ON agency_athlete_matches(status, match_score DESC)
WHERE status IN ('suggested', 'saved', 'contacted', 'interested', 'in_discussion');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON agency_athlete_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- Create function to auto-track status changes
CREATE OR REPLACE FUNCTION track_match_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Set contacted_at when status changes to contacted
  IF NEW.status = 'contacted' AND OLD.status != 'contacted' THEN
    NEW.contacted_at := NOW();
  END IF;

  -- Set deal_created_at when deal_id is set
  IF NEW.deal_id IS NOT NULL AND OLD.deal_id IS NULL THEN
    NEW.deal_created_at := NOW();
    NEW.status := 'partnered';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status tracking
CREATE TRIGGER track_match_status
  BEFORE UPDATE ON agency_athlete_matches
  FOR EACH ROW
  EXECUTE FUNCTION track_match_status_changes();

-- Create function to generate match highlights from score breakdown
CREATE OR REPLACE FUNCTION generate_match_highlights()
RETURNS TRIGGER AS $$
DECLARE
  highlights JSONB;
  factor_name TEXT;
  factor_score NUMERIC;
  max_score NUMERIC;
  percentage NUMERIC;
BEGIN
  highlights := '[]'::jsonb;

  -- Brand values match
  IF (NEW.score_breakdown->>'brand_values')::NUMERIC >= 16 THEN
    highlights := highlights || jsonb_build_array('Strong brand values alignment');
  END IF;

  -- Interests alignment
  IF (NEW.score_breakdown->>'interests')::NUMERIC >= 16 THEN
    highlights := highlights || jsonb_build_array('Excellent interests overlap');
  END IF;

  -- Campaign fit
  IF (NEW.score_breakdown->>'campaign_fit')::NUMERIC >= 12 THEN
    highlights := highlights || jsonb_build_array('Great fit for campaign type');
  END IF;

  -- Budget compatibility
  IF (NEW.score_breakdown->>'budget')::NUMERIC >= 12 THEN
    highlights := highlights || jsonb_build_array('Budget requirements align');
  END IF;

  -- Geography match
  IF (NEW.score_breakdown->>'geography')::NUMERIC >= 8 THEN
    highlights := highlights || jsonb_build_array('Geographic market match');
  END IF;

  -- Engagement quality
  IF (NEW.score_breakdown->>'engagement')::NUMERIC >= 8 THEN
    highlights := highlights || jsonb_build_array('High audience engagement');
  END IF;

  -- Only set if not manually overridden
  IF NEW.match_highlights = '[]'::jsonb THEN
    NEW.match_highlights := highlights;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating highlights
CREATE TRIGGER generate_highlights
  BEFORE INSERT ON agency_athlete_matches
  FOR EACH ROW
  EXECUTE FUNCTION generate_match_highlights();

-- Add comments for documentation
COMMENT ON TABLE agency_athlete_matches IS 'Stores matchmaking results and recommendations between agencies and athletes';
COMMENT ON COLUMN agency_athlete_matches.match_score IS 'Overall match score from 0-100 calculated by matchmaking algorithm';
COMMENT ON COLUMN agency_athlete_matches.score_breakdown IS 'JSONB object with individual factor scores (brand_values, interests, etc.)';
COMMENT ON COLUMN agency_athlete_matches.match_highlights IS 'JSONB array of key reasons why this is a good match';
COMMENT ON COLUMN agency_athlete_matches.athlete_profile_snapshot IS 'Snapshot of athlete profile at the time of match creation';

-- Verification
SELECT 'Migration 019 completed successfully!' as status,
       'Created agency_athlete_matches table with ' || COUNT(*) || ' indexes' as detail
FROM pg_indexes
WHERE tablename = 'agency_athlete_matches';
