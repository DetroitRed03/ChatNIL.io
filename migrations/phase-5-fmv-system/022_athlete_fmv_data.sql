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
