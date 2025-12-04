-- ============================================================================
-- Migration 022: Athlete FMV (Fair Market Value) Data Table
-- ============================================================================
-- Creates the athlete_fmv_data table to store calculated NIL valuations
-- Includes privacy controls, rate limiting, and notification tracking
-- ============================================================================

-- Create ENUM for FMV tier
CREATE TYPE fmv_tier AS ENUM (
  'elite',        -- 90-100 points
  'high',         -- 75-89 points
  'medium',       -- 55-74 points
  'developing',   -- 35-54 points
  'emerging'      -- 0-34 points
);

-- Create athlete_fmv_data table
CREATE TABLE athlete_fmv_data (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Overall FMV score (0-100)
  fmv_score INTEGER NOT NULL CHECK (fmv_score >= 0 AND fmv_score <= 100),
  fmv_tier fmv_tier NOT NULL,

  -- Category breakdowns
  social_score INTEGER NOT NULL DEFAULT 0 CHECK (social_score >= 0 AND social_score <= 30),
  athletic_score INTEGER NOT NULL DEFAULT 0 CHECK (athletic_score >= 0 AND athletic_score <= 30),
  market_score INTEGER NOT NULL DEFAULT 0 CHECK (market_score >= 0 AND market_score <= 20),
  brand_score INTEGER NOT NULL DEFAULT 0 CHECK (brand_score >= 0 AND brand_score <= 20),

  -- Deal value estimates (in USD)
  estimated_deal_value_low DECIMAL(10, 2),
  estimated_deal_value_mid DECIMAL(10, 2),
  estimated_deal_value_high DECIMAL(10, 2),

  -- Detailed analysis (JSONB arrays)
  improvement_suggestions JSONB DEFAULT '[]'::jsonb, -- [{area, current, target, action, impact, priority}]
  strengths JSONB DEFAULT '[]'::jsonb, -- [string array]
  weaknesses JSONB DEFAULT '[]'::jsonb, -- [string array]
  score_history JSONB DEFAULT '[]'::jsonb, -- [{date, score, tier}]

  -- Comparable athletes (only public scores)
  comparable_athletes UUID[] DEFAULT '{}',

  -- Rankings
  percentile_rank INTEGER CHECK (percentile_rank >= 0 AND percentile_rank <= 100),
  rank_in_sport INTEGER,
  total_athletes_in_sport INTEGER,

  -- Privacy controls
  is_public_score BOOLEAN NOT NULL DEFAULT false, -- Private by default

  -- Rate limiting fields
  last_calculation_date TIMESTAMPTZ,
  next_calculation_date TIMESTAMPTZ,
  calculation_count_today INTEGER NOT NULL DEFAULT 0,
  last_calculation_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Notification tracking
  last_notified_score INTEGER, -- Last score when notification was sent
  last_notification_date TIMESTAMPTZ,

  -- Metadata
  calculation_version TEXT NOT NULL DEFAULT 'v1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one record per athlete
  UNIQUE(athlete_id)
);

-- Create indexes for performance
CREATE INDEX idx_athlete_fmv_athlete_id ON athlete_fmv_data(athlete_id);
CREATE INDEX idx_athlete_fmv_score ON athlete_fmv_data(fmv_score DESC);
CREATE INDEX idx_athlete_fmv_tier ON athlete_fmv_data(fmv_tier);
CREATE INDEX idx_athlete_fmv_public ON athlete_fmv_data(is_public_score) WHERE is_public_score = true;
CREATE INDEX idx_athlete_fmv_next_calc ON athlete_fmv_data(next_calculation_date) WHERE next_calculation_date IS NOT NULL;

-- Create composite index for comparable athlete queries
CREATE INDEX idx_athlete_fmv_comparables ON athlete_fmv_data(fmv_score, is_public_score) WHERE is_public_score = true;

-- ============================================================================
-- TRIGGER: Auto-calculate FMV tier based on score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_fmv_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine tier based on score ranges
  IF NEW.fmv_score >= 90 THEN
    NEW.fmv_tier := 'elite';
  ELSIF NEW.fmv_score >= 75 THEN
    NEW.fmv_tier := 'high';
  ELSIF NEW.fmv_score >= 55 THEN
    NEW.fmv_tier := 'medium';
  ELSIF NEW.fmv_score >= 35 THEN
    NEW.fmv_tier := 'developing';
  ELSE
    NEW.fmv_tier := 'emerging';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_fmv_tier
  BEFORE INSERT OR UPDATE OF fmv_score ON athlete_fmv_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_fmv_tier();

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_athlete_fmv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_athlete_fmv_updated_at
  BEFORE UPDATE ON athlete_fmv_data
  FOR EACH ROW
  EXECUTE FUNCTION update_athlete_fmv_updated_at();

-- ============================================================================
-- TRIGGER: Reset rate limit counter daily
-- ============================================================================
CREATE OR REPLACE FUNCTION reset_fmv_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- If the last reset was on a different day, reset the counter
  IF NEW.last_calculation_reset_date < CURRENT_DATE THEN
    NEW.calculation_count_today := 0;
    NEW.last_calculation_reset_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_fmv_rate_limit
  BEFORE UPDATE ON athlete_fmv_data
  FOR EACH ROW
  EXECUTE FUNCTION reset_fmv_rate_limit();

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE athlete_fmv_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Athletes can read their own FMV data
CREATE POLICY "Athletes can view own FMV data"
  ON athlete_fmv_data
  FOR SELECT
  USING (
    auth.uid() = athlete_id
  );

-- Policy 2: Athletes can update their own FMV data (privacy toggle, etc.)
CREATE POLICY "Athletes can update own FMV data"
  ON athlete_fmv_data
  FOR UPDATE
  USING (
    auth.uid() = athlete_id
  )
  WITH CHECK (
    auth.uid() = athlete_id
  );

-- Policy 3: Public can read FMV data if athlete has made it public
CREATE POLICY "Public can view public FMV scores"
  ON athlete_fmv_data
  FOR SELECT
  USING (
    is_public_score = true
  );

-- Policy 4: Service role can do anything (for system calculations)
CREATE POLICY "Service role can manage all FMV data"
  ON athlete_fmv_data
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ============================================================================
-- HELPER FUNCTION: Get athlete's FMV data (respects privacy)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_athlete_fmv(p_athlete_id UUID)
RETURNS TABLE (
  fmv_score INTEGER,
  fmv_tier TEXT,
  social_score INTEGER,
  athletic_score INTEGER,
  market_score INTEGER,
  brand_score INTEGER,
  is_public BOOLEAN,
  percentile_rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.fmv_score,
    f.fmv_tier::TEXT,
    f.social_score,
    f.athletic_score,
    f.market_score,
    f.brand_score,
    f.is_public_score,
    f.percentile_rank
  FROM athlete_fmv_data f
  WHERE f.athlete_id = p_athlete_id
    AND (f.athlete_id = auth.uid() OR f.is_public_score = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if athlete can recalculate (rate limit)
-- ============================================================================
CREATE OR REPLACE FUNCTION can_recalculate_fmv(p_athlete_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_reset_date DATE;
BEGIN
  -- Get current rate limit state
  SELECT calculation_count_today, last_calculation_reset_date
  INTO v_count, v_reset_date
  FROM athlete_fmv_data
  WHERE athlete_id = p_athlete_id;

  -- If no record exists, allow calculation
  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;

  -- If reset date is old, reset counter (this shouldn't happen due to trigger)
  IF v_reset_date < CURRENT_DATE THEN
    RETURN TRUE;
  END IF;

  -- Check if under limit (3 per day)
  RETURN v_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON athlete_fmv_data TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_athlete_fmv(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_recalculate_fmv(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE athlete_fmv_data IS 'Stores calculated Fair Market Value (FMV) scores for athletes with privacy controls and rate limiting';
COMMENT ON COLUMN athlete_fmv_data.fmv_score IS 'Overall FMV score from 0-100 based on social, athletic, market, and brand factors';
COMMENT ON COLUMN athlete_fmv_data.is_public_score IS 'Privacy control: if false, only athlete can see their score; if true, score is public';
COMMENT ON COLUMN athlete_fmv_data.calculation_count_today IS 'Number of manual recalculations today (max 3 per day)';
COMMENT ON COLUMN athlete_fmv_data.last_notified_score IS 'Last score when notification was sent (used to detect 5+ point increases)';
COMMENT ON COLUMN athlete_fmv_data.comparable_athletes IS 'Array of athlete IDs with similar scores who have made their scores public';
-- ============================================================================
-- Migration 023: State NIL Rules & Compliance
-- ============================================================================
-- Creates the state_nil_rules table for tracking state-by-state NIL regulations
-- Includes seed data for initial 10 states with active NIL programs
-- ============================================================================

-- Create state_nil_rules table
CREATE TABLE state_nil_rules (
  -- Primary identification
  state_code TEXT PRIMARY KEY CHECK (LENGTH(state_code) = 2), -- 'KY', 'CA', etc.
  state_name TEXT NOT NULL,

  -- General NIL permission flags
  allows_nil BOOLEAN NOT NULL DEFAULT true,
  high_school_allowed BOOLEAN NOT NULL DEFAULT false,
  college_allowed BOOLEAN NOT NULL DEFAULT true,
  school_approval_required BOOLEAN NOT NULL DEFAULT false,

  -- Prohibited categories
  prohibited_categories TEXT[] DEFAULT '{}', -- ['alcohol', 'gambling', 'cannabis', etc.]

  -- Additional requirements
  disclosure_required BOOLEAN NOT NULL DEFAULT false,
  agent_registration_required BOOLEAN NOT NULL DEFAULT false,
  financial_literacy_required BOOLEAN NOT NULL DEFAULT false,

  -- Documentation
  rules_summary TEXT,
  rules_url TEXT,
  effective_date DATE,

  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_state_nil_allows ON state_nil_rules(allows_nil);
CREATE INDEX idx_state_nil_hs_allowed ON state_nil_rules(high_school_allowed);

-- ============================================================================
-- SEED DATA: Initial 10 States
-- ============================================================================

-- Kentucky - Progressive NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'KY', 'Kentucky', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  'Kentucky allows NIL deals for both high school and college athletes. Athletes must disclose deals to their school. Prohibited: alcohol, gambling, cannabis.',
  'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=52521'
);

-- California - Most progressive NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'CA', 'California', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'adult_content'], true,
  'California was the first state to pass NIL legislation (SB 206). Allows deals for HS and college athletes. Prohibited: alcohol, gambling, cannabis, adult content.',
  'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201920200SB206'
);

-- Texas - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'TX', 'Texas', true, false, true,
  true, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], true,
  'Texas allows NIL for college athletes only. High school athletes are prohibited. School approval required for deals. Prohibited: alcohol, gambling, cannabis, tobacco.',
  'https://capitol.texas.gov/tlodocs/87R/billtext/html/SB01385I.htm'
);

-- Florida - Progressive NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  financial_literacy_required,
  rules_summary, rules_url
) VALUES (
  'FL', 'Florida', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  true,
  'Florida allows NIL for HS and college athletes. Athletes must complete financial literacy course. Prohibited: alcohol, gambling, cannabis.',
  'http://laws.flrules.org/2020/240'
);

-- New York - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'NY', 'New York', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_content'], true,
  'New York allows NIL deals for both HS and college athletes. Broad prohibited categories including alcohol, gambling, cannabis, tobacco, and adult content.',
  'https://www.nysenate.gov/legislation/bills/2021/S5891'
);

-- Ohio - Midwest NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  agent_registration_required,
  rules_summary, rules_url
) VALUES (
  'OH', 'Ohio', true, false, true,
  true, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  true,
  'Ohio allows NIL for college athletes only. School approval required. Agents must register with the state. Prohibited: alcohol, gambling, cannabis.',
  'https://codes.ohio.gov/ohio-revised-code/section-3345.68'
);

-- Indiana - Midwest NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'IN', 'Indiana', true, false, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis'], false,
  'Indiana allows NIL for college athletes only. High school athletes prohibited. No school approval required. Prohibited: alcohol, gambling, cannabis.',
  'https://iga.in.gov/legislative/2021/bills/senate/4'
);

-- Tennessee - SEC state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'TN', 'Tennessee', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], true,
  'Tennessee allows NIL for HS and college athletes. Athletes must disclose deals. Prohibited: alcohol, gambling, cannabis, tobacco.',
  'https://wapp.capitol.tn.gov/apps/BillInfo/Default.aspx?BillNumber=SB1628'
);

-- Illinois - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'IL', 'Illinois', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'adult_content'], true,
  'Illinois allows NIL for HS and college athletes. Disclosure required. Prohibited: alcohol, gambling, cannabis, adult content.',
  'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=4214'
);

-- Pennsylvania - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'PA', 'Pennsylvania', true, false, true,
  true, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  'Pennsylvania allows NIL for college athletes only. School approval required. Prohibited: alcohol, gambling, cannabis.',
  'https://www.legis.state.pa.us/cfdocs/billinfo/billinfo.cfm?syear=2021&sind=0&body=S&type=B&bn=381'
);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE state_nil_rules ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read state NIL rules (public information)
CREATE POLICY "Anyone can view state NIL rules"
  ON state_nil_rules
  FOR SELECT
  USING (true);

-- Policy 2: Only service role can update state rules (admin only)
CREATE POLICY "Service role can manage state rules"
  ON state_nil_rules
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ============================================================================
-- HELPER FUNCTION: Get state rules by state code
-- ============================================================================
CREATE OR REPLACE FUNCTION get_state_nil_rules(p_state_code TEXT)
RETURNS TABLE (
  state_name TEXT,
  allows_nil BOOLEAN,
  high_school_allowed BOOLEAN,
  college_allowed BOOLEAN,
  school_approval_required BOOLEAN,
  prohibited_categories TEXT[],
  disclosure_required BOOLEAN,
  agent_registration_required BOOLEAN,
  financial_literacy_required BOOLEAN,
  rules_summary TEXT,
  rules_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.state_name,
    s.allows_nil,
    s.high_school_allowed,
    s.college_allowed,
    s.school_approval_required,
    s.prohibited_categories,
    s.disclosure_required,
    s.agent_registration_required,
    s.financial_literacy_required,
    s.rules_summary,
    s.rules_url
  FROM state_nil_rules s
  WHERE s.state_code = UPPER(p_state_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if deal category is allowed in state
-- ============================================================================
CREATE OR REPLACE FUNCTION is_deal_category_allowed(
  p_state_code TEXT,
  p_category TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prohibited TEXT[];
BEGIN
  -- Get prohibited categories for state
  SELECT prohibited_categories INTO v_prohibited
  FROM state_nil_rules
  WHERE state_code = UPPER(p_state_code);

  -- If state not found, default to allowed
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  -- Check if category is in prohibited list
  RETURN NOT (p_category = ANY(v_prohibited));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON state_nil_rules TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_state_nil_rules(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_deal_category_allowed(TEXT, TEXT) TO authenticated, anon;

-- ============================================================================
-- TRIGGER: Update last_updated timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_state_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_state_rules_updated_at
  BEFORE UPDATE ON state_nil_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_state_rules_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE state_nil_rules IS 'Stores state-by-state NIL compliance rules and regulations';
COMMENT ON COLUMN state_nil_rules.prohibited_categories IS 'Array of deal categories prohibited in this state (e.g., alcohol, gambling, cannabis)';
COMMENT ON COLUMN state_nil_rules.high_school_allowed IS 'Whether high school athletes can participate in NIL deals in this state';
COMMENT ON COLUMN state_nil_rules.school_approval_required IS 'Whether athletes must get school approval before signing NIL deals';
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
-- ============================================================================
-- Migration 025: Institution Profiles (Schools/Universities)
-- ============================================================================
-- Creates institution_profiles table for schools and universities
-- Supports custom branding, QR codes, and FERPA-compliant athlete management
-- ============================================================================

-- Create ENUM for institution types
CREATE TYPE institution_type AS ENUM (
  'high_school',
  'community_college',
  'junior_college',
  'college',
  'university',
  'prep_school',
  'academy'
);

-- Create institution_profiles table
CREATE TABLE institution_profiles (
  -- Primary identification (references users table)
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Basic institution information
  institution_name TEXT NOT NULL,
  institution_type institution_type NOT NULL,

  -- Official identifiers
  nces_id TEXT UNIQUE, -- National Center for Education Statistics ID
  state_code TEXT, -- 'KY', 'CA', etc.
  county TEXT,
  district TEXT,

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',

  -- Contact information
  phone TEXT,
  website_url TEXT,
  athletic_department_email TEXT,
  athletic_director_name TEXT,
  compliance_officer_email TEXT,

  -- Branding and customization
  custom_url_slug TEXT UNIQUE, -- e.g., 'kentucky-central-hs'
  logo_url TEXT,
  primary_color TEXT, -- Hex color code
  secondary_color TEXT,
  custom_splash_page JSONB DEFAULT '{}'::jsonb, -- {logo_url, primary_color, welcome_message, background_image}

  -- QR code for athlete recruitment
  qr_code_url TEXT, -- Link to downloadable QR code
  athlete_signup_url TEXT, -- Custom signup URL with institution pre-filled

  -- Compliance and settings
  ferpa_compliant BOOLEAN NOT NULL DEFAULT true, -- Always true for school-created accounts
  requires_approval_for_nil_deals BOOLEAN NOT NULL DEFAULT false,
  automatic_athlete_association BOOLEAN NOT NULL DEFAULT true, -- Auto-link athletes who sign up with school email domain

  -- Email domains (for automatic athlete association)
  email_domains TEXT[] DEFAULT '{}', -- ['@school.edu', '@students.school.edu']

  -- Statistics
  total_athletes INTEGER NOT NULL DEFAULT 0,
  total_active_nil_deals INTEGER NOT NULL DEFAULT 0,
  total_nil_value DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

  -- Features and permissions
  can_create_bulk_accounts BOOLEAN NOT NULL DEFAULT true,
  can_view_athlete_analytics BOOLEAN NOT NULL DEFAULT true,
  can_approve_nil_deals BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  verified BOOLEAN NOT NULL DEFAULT false, -- Email/identity verified
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_institution_profiles_name ON institution_profiles(institution_name);
CREATE INDEX idx_institution_profiles_type ON institution_profiles(institution_type);
CREATE INDEX idx_institution_profiles_state ON institution_profiles(state_code);
CREATE INDEX idx_institution_profiles_nces ON institution_profiles(nces_id);
CREATE INDEX idx_institution_profiles_slug ON institution_profiles(custom_url_slug);
CREATE INDEX idx_institution_profiles_verified ON institution_profiles(verified);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Institutions can read and update their own profile
CREATE POLICY "Institutions can manage own profile"
  ON institution_profiles
  FOR ALL
  USING (
    id = auth.uid()
  )
  WITH CHECK (
    id = auth.uid()
  );

-- Policy 2: Public can read basic institution information
CREATE POLICY "Public can view institution profiles"
  ON institution_profiles
  FOR SELECT
  USING (true);

-- Policy 3: Service role can manage all institutions
CREATE POLICY "Service role can manage all institutions"
  ON institution_profiles
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_institution_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_institution_profiles_updated_at
  BEFORE UPDATE ON institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_profiles_updated_at();

-- ============================================================================
-- TRIGGER: Generate custom URL slug if not provided
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_institution_slug()
RETURNS TRIGGER AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 0;
BEGIN
  -- If slug not provided, generate one
  IF NEW.custom_url_slug IS NULL OR NEW.custom_url_slug = '' THEN
    -- Create base slug from institution name
    v_slug := LOWER(REGEXP_REPLACE(NEW.institution_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := TRIM(BOTH '-' FROM v_slug);

    -- Check if slug exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM institution_profiles WHERE custom_url_slug = v_slug) LOOP
      v_counter := v_counter + 1;
      v_slug := v_slug || '-' || v_counter::TEXT;
    END LOOP;

    NEW.custom_url_slug := v_slug;
  END IF;

  -- Generate athlete signup URL
  IF NEW.athlete_signup_url IS NULL OR NEW.athlete_signup_url = '' THEN
    NEW.athlete_signup_url := 'https://chatnil.io/signup/institution/' || NEW.custom_url_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_institution_slug
  BEFORE INSERT OR UPDATE OF institution_name, custom_url_slug ON institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_institution_slug();

-- ============================================================================
-- HELPER FUNCTION: Get institution by slug
-- ============================================================================
CREATE OR REPLACE FUNCTION get_institution_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  institution_name TEXT,
  institution_type TEXT,
  state_code TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  website_url TEXT,
  athlete_signup_url TEXT,
  total_athletes INTEGER,
  verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.institution_name,
    i.institution_type::TEXT,
    i.state_code,
    i.logo_url,
    i.primary_color,
    i.secondary_color,
    i.website_url,
    i.athlete_signup_url,
    i.total_athletes,
    i.verified
  FROM institution_profiles i
  WHERE i.custom_url_slug = p_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get athletes associated with institution
-- ============================================================================
CREATE OR REPLACE FUNCTION get_institution_athletes(p_institution_id UUID)
RETURNS TABLE (
  athlete_id UUID,
  athlete_name TEXT,
  sport TEXT,
  graduation_year INTEGER,
  total_followers INTEGER,
  active_nil_deals INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    CONCAT(u.first_name, ' ', u.last_name) AS athlete_name,
    u.primary_sport,
    u.graduation_year,
    u.total_followers,
    (SELECT COUNT(*)::INTEGER FROM nil_deals WHERE athlete_id = u.id AND status = 'active') AS active_nil_deals
  FROM users u
  WHERE
    u.role = 'athlete'
    AND u.school_name = (SELECT institution_name FROM institution_profiles WHERE id = p_institution_id)
  ORDER BY u.last_name, u.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if email belongs to institution
-- ============================================================================
CREATE OR REPLACE FUNCTION check_email_belongs_to_institution(
  p_email TEXT,
  p_institution_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_domains TEXT[];
  v_domain TEXT;
BEGIN
  -- Get institution email domains
  SELECT email_domains INTO v_domains
  FROM institution_profiles
  WHERE id = p_institution_id;

  -- If no domains configured, return false
  IF v_domains IS NULL OR array_length(v_domains, 1) IS NULL THEN
    RETURN false;
  END IF;

  -- Extract domain from email
  v_domain := '@' || split_part(p_email, '@', 2);

  -- Check if domain is in institution's list
  RETURN v_domain = ANY(v_domains);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON institution_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_institution_by_slug(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_institution_athletes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_belongs_to_institution(TEXT, UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE institution_profiles IS 'Stores profile information for schools and universities on the platform';
COMMENT ON COLUMN institution_profiles.nces_id IS 'National Center for Education Statistics ID - official school identifier';
COMMENT ON COLUMN institution_profiles.custom_url_slug IS 'Unique URL slug for institution (e.g., kentucky-central-hs)';
COMMENT ON COLUMN institution_profiles.custom_splash_page IS 'JSON configuration for custom branded landing page';
COMMENT ON COLUMN institution_profiles.qr_code_url IS 'URL to downloadable QR code for athlete recruitment';
COMMENT ON COLUMN institution_profiles.ferpa_compliant IS 'Whether institution follows FERPA regulations for student data';
COMMENT ON COLUMN institution_profiles.email_domains IS 'Array of email domains belonging to this institution for auto-association';
COMMENT ON COLUMN institution_profiles.automatic_athlete_association IS 'Whether to automatically link athletes who sign up with institution email domain';
-- ============================================================================
-- Migration 027: Update User Roles (Add School & Business)
-- ============================================================================
-- Adds 'school' and 'business' roles to the users table
-- Maintains backward compatibility with existing athlete, parent, agency roles
-- ============================================================================

-- First, let's see what roles currently exist in the database
-- This migration will add 'agency', 'school', and 'business' to user_role ENUM

-- Step 1: Add new values to existing user_role ENUM (if it exists)
DO $$
BEGIN
  -- Check if user_role type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Add 'agency' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agency' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
      ALTER TYPE user_role ADD VALUE 'agency';
      RAISE NOTICE 'Added "agency" to user_role ENUM';
    ELSE
      RAISE NOTICE '"agency" already exists in user_role ENUM';
    END IF;

    -- Add 'school' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'school' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
      ALTER TYPE user_role ADD VALUE 'school';
      RAISE NOTICE 'Added "school" to user_role ENUM';
    ELSE
      RAISE NOTICE '"school" already exists in user_role ENUM';
    END IF;

    -- Add 'business' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'business' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
      ALTER TYPE user_role ADD VALUE 'business';
      RAISE NOTICE 'Added "business" to user_role ENUM';
    ELSE
      RAISE NOTICE '"business" already exists in user_role ENUM';
    END IF;
  ELSE
    RAISE NOTICE 'user_role ENUM type does not exist - skipping ENUM update';
  END IF;
END $$;

-- Step 2: Drop existing CHECK constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: ONLY add CHECK constraint if using ENUM type
-- If role column is ENUM type, the type constraint is sufficient
-- If role column is TEXT, add CHECK constraint
DO $$
BEGIN
  -- Check if role column is TEXT type (not ENUM)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'role'
      AND data_type = 'text'
  ) THEN
    -- Role is TEXT, add CHECK constraint
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('athlete', 'parent', 'agency', 'school', 'business'));
    RAISE NOTICE 'Added CHECK constraint for TEXT-based role column';
  ELSE
    RAISE NOTICE 'Role column is ENUM type - no CHECK constraint needed (ENUM provides type safety)';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS (Only add if constraint exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'users'::regclass
    AND conname = 'users_role_check'
  ) THEN
    COMMENT ON CONSTRAINT users_role_check ON users IS 'Allowed user roles: athlete, parent, agency, school (institutions), business (local businesses/brands)';
  ELSE
    RAISE NOTICE 'No CHECK constraint to comment on (ENUM-based roles)';
  END IF;
END $$;

-- ============================================================================
-- Note: This migration handles both ENUM-based and TEXT-based role columns
-- ============================================================================
