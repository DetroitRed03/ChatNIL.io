-- ============================================================================
-- Migration 024: Scraped Athlete Data (External Rankings)
-- ============================================================================
-- Creates table for storing external rankings data from recruiting services
-- Sources: On3, Rivals, 247Sports, ESPN
-- ============================================================================

-- Create ENUM for data sources
CREATE TYPE ranking_source AS ENUM (
  'on3',
  'rivals',
  '247sports',
  'espn',
  'maxpreps',
  'other'
);

-- Create scraped_athlete_data table
CREATE TABLE scraped_athlete_data (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source information
  source ranking_source NOT NULL,
  source_athlete_id TEXT, -- External ID from source
  source_url TEXT,

  -- Athlete identification
  athlete_name TEXT NOT NULL,
  sport TEXT,
  position TEXT,
  school_name TEXT,
  state TEXT,
  graduation_year INTEGER,

  -- Rankings
  overall_ranking INTEGER,
  position_ranking INTEGER,
  state_ranking INTEGER,
  composite_rating DECIMAL(3, 2), -- e.g., 0.95 for 4-star recruits

  -- NIL value estimation (from source)
  estimated_nil_value DECIMAL(12, 2), -- Some services provide this

  -- Star rating (recruiting services)
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),

  -- Verification and matching
  verified BOOLEAN NOT NULL DEFAULT false, -- Human reviewed
  matched_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Linked to our users table
  match_confidence DECIMAL(3, 2), -- 0.00-1.00 confidence in match

  -- Raw data storage
  raw_data JSONB, -- Full scraped content for reference

  -- Metadata
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_scraped_athlete_name ON scraped_athlete_data(athlete_name);
CREATE INDEX idx_scraped_athlete_sport ON scraped_athlete_data(sport);
CREATE INDEX idx_scraped_athlete_matched ON scraped_athlete_data(matched_user_id);
CREATE INDEX idx_scraped_athlete_source ON scraped_athlete_data(source);
CREATE INDEX idx_scraped_athlete_verified ON scraped_athlete_data(verified);
CREATE INDEX idx_scraped_athlete_rankings ON scraped_athlete_data(overall_ranking) WHERE overall_ranking IS NOT NULL;

-- Composite index for matching queries
CREATE INDEX idx_scraped_athlete_matching ON scraped_athlete_data(
  athlete_name, sport, school_name, graduation_year
);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE scraped_athlete_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Athletes can view their own matched data
CREATE POLICY "Athletes can view own scraped data"
  ON scraped_athlete_data
  FOR SELECT
  USING (
    matched_user_id = auth.uid()
  );

-- Policy 2: Public can view verified scraped data (for research/comparison)
CREATE POLICY "Public can view verified scraped data"
  ON scraped_athlete_data
  FOR SELECT
  USING (
    verified = true
  );

-- Policy 3: Service role can manage all scraped data (for cron jobs)
CREATE POLICY "Service role can manage scraped data"
  ON scraped_athlete_data
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ============================================================================
-- HELPER FUNCTION: Find scraped data for athlete
-- ============================================================================
CREATE OR REPLACE FUNCTION get_athlete_external_rankings(p_athlete_id UUID)
RETURNS TABLE (
  source TEXT,
  overall_ranking INTEGER,
  position_ranking INTEGER,
  state_ranking INTEGER,
  star_rating INTEGER,
  estimated_nil_value DECIMAL,
  scraped_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.source::TEXT,
    s.overall_ranking,
    s.position_ranking,
    s.state_ranking,
    s.star_rating,
    s.estimated_nil_value,
    s.scraped_at
  FROM scraped_athlete_data s
  WHERE s.matched_user_id = p_athlete_id
    AND s.verified = true
  ORDER BY s.scraped_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Match scraped data to user
-- ============================================================================
CREATE OR REPLACE FUNCTION match_scraped_athlete_to_user(
  p_scraped_id UUID,
  p_user_id UUID,
  p_confidence DECIMAL DEFAULT 1.0
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE scraped_athlete_data
  SET
    matched_user_id = p_user_id,
    match_confidence = p_confidence,
    verified = true,
    last_updated = NOW()
  WHERE id = p_scraped_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Search for potential matches
-- ============================================================================
CREATE OR REPLACE FUNCTION find_potential_athlete_matches(
  p_athlete_name TEXT,
  p_sport TEXT DEFAULT NULL,
  p_school_name TEXT DEFAULT NULL,
  p_graduation_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
  scraped_id UUID,
  athlete_name TEXT,
  sport TEXT,
  school_name TEXT,
  source TEXT,
  overall_ranking INTEGER,
  match_score INTEGER -- Simple scoring: name match + sport match + school match
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.athlete_name,
    s.sport,
    s.school_name,
    s.source::TEXT,
    s.overall_ranking,
    (
      -- Calculate simple match score
      CASE WHEN LOWER(s.athlete_name) = LOWER(p_athlete_name) THEN 100 ELSE 0 END +
      CASE WHEN LOWER(s.sport) = LOWER(p_sport) THEN 50 ELSE 0 END +
      CASE WHEN LOWER(s.school_name) LIKE '%' || LOWER(p_school_name) || '%' THEN 30 ELSE 0 END +
      CASE WHEN s.graduation_year = p_graduation_year THEN 20 ELSE 0 END
    ) AS match_score
  FROM scraped_athlete_data s
  WHERE
    s.matched_user_id IS NULL
    AND s.athlete_name ILIKE '%' || p_athlete_name || '%'
  ORDER BY match_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON scraped_athlete_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_athlete_external_rankings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_potential_athlete_matches(TEXT, TEXT, TEXT, INTEGER) TO authenticated;

-- Service role needs full access
GRANT ALL ON scraped_athlete_data TO service_role;
GRANT EXECUTE ON FUNCTION match_scraped_athlete_to_user(UUID, UUID, DECIMAL) TO service_role;

-- ============================================================================
-- TRIGGER: Update last_updated timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_scraped_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scraped_data_updated_at
  BEFORE UPDATE ON scraped_athlete_data
  FOR EACH ROW
  EXECUTE FUNCTION update_scraped_data_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE scraped_athlete_data IS 'Stores external athlete rankings and data from recruiting services (On3, Rivals, 247Sports, ESPN)';
COMMENT ON COLUMN scraped_athlete_data.source IS 'Recruiting service source: on3, rivals, 247sports, espn, etc.';
COMMENT ON COLUMN scraped_athlete_data.matched_user_id IS 'If successfully matched to a user in our system, their user ID';
COMMENT ON COLUMN scraped_athlete_data.match_confidence IS 'Confidence score (0.00-1.00) in the match between scraped data and user';
COMMENT ON COLUMN scraped_athlete_data.verified IS 'Whether this scraped data has been human-reviewed and verified';
COMMENT ON COLUMN scraped_athlete_data.composite_rating IS 'Composite rating from 0.00-1.00 (recruiting services use this for star ratings)';
COMMENT ON COLUMN scraped_athlete_data.estimated_nil_value IS 'External estimate of athlete NIL value if provided by source';
COMMENT ON COLUMN scraped_athlete_data.raw_data IS 'Full JSON of scraped content for reference and debugging';
