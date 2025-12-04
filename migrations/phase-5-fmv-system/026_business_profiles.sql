-- ============================================================================
-- Migration 026: Business Profiles (Simpler than Agency Role)
-- ============================================================================
-- ⚠️ NOT IMPLEMENTED - Database schema only
-- Decision: Local businesses use Agency role instead (October 21, 2025)
-- Reason: Agency role supports all business sizes through flexible budget ranges
-- Status: Table exists but no frontend implementation (onboarding, UI, types)
-- ============================================================================
-- Creates business_profiles table for local businesses and brands
-- Simpler than agency profiles - focused on quick NIL deal creation
-- ============================================================================

-- Create ENUM for business types
CREATE TYPE business_type AS ENUM (
  'local_business',
  'restaurant',
  'retail_store',
  'automotive',
  'fitness_gym',
  'healthcare',
  'real_estate',
  'law_firm',
  'financial_services',
  'technology',
  'entertainment',
  'hospitality',
  'nonprofit',
  'national_brand',
  'startup',
  'other'
);

-- Create ENUM for budget ranges
CREATE TYPE budget_range AS ENUM (
  'under_1k',     -- $0-$999
  '1k_5k',        -- $1,000-$4,999
  '5k_10k',       -- $5,000-$9,999
  '10k_25k',      -- $10,000-$24,999
  '25k_50k',      -- $25,000-$49,999
  '50k_100k',     -- $50,000-$99,999
  '100k_plus'     -- $100,000+
);

-- Create business_profiles table
CREATE TABLE business_profiles (
  -- Primary identification (references users table)
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Basic business information
  business_name TEXT NOT NULL,
  business_type business_type NOT NULL,
  industry TEXT,
  description TEXT,

  -- Contact information
  contact_person_name TEXT,
  contact_person_title TEXT,
  email TEXT,
  phone TEXT,
  website_url TEXT,

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',

  -- Social media (optional for businesses)
  instagram_handle TEXT,
  facebook_page TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,

  -- NIL partnership preferences
  looking_for TEXT[] DEFAULT '{}', -- ['social_media_posts', 'event_appearances', 'brand_ambassadors', 'content_creation']
  preferred_sports TEXT[] DEFAULT '{}', -- ['football', 'basketball', 'baseball']
  budget_range budget_range,
  estimated_monthly_budget DECIMAL(10, 2),

  -- Geographic focus
  geographic_focus TEXT[] DEFAULT '{}', -- State codes: ['KY', 'OH', 'IN']
  local_market_only BOOLEAN NOT NULL DEFAULT true, -- Only work with local athletes

  -- Target athlete criteria
  min_follower_count INTEGER DEFAULT 1000,
  preferred_athlete_level TEXT, -- 'high_school', 'college', 'any'
  preferred_content_types TEXT[] DEFAULT '{}', -- ['instagram_post', 'tiktok_video', 'youtube_video']

  -- Deal templates (for quick creation)
  default_deal_terms JSONB DEFAULT '{}'::jsonb, -- {duration_days, payment_terms, deliverables}

  -- Verification and trust
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_method TEXT, -- 'email', 'phone', 'business_license', 'manual'

  -- Statistics
  total_deals_created INTEGER NOT NULL DEFAULT 0,
  total_deals_completed INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  average_deal_value DECIMAL(10, 2),

  -- Ratings and reviews (for future)
  rating_score DECIMAL(3, 2), -- 0.00-5.00
  total_ratings INTEGER NOT NULL DEFAULT 0,

  -- Account settings
  auto_approve_deals BOOLEAN NOT NULL DEFAULT false,
  requires_contract BOOLEAN NOT NULL DEFAULT true,
  payment_method_on_file BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_business_profiles_name ON business_profiles(business_name);
CREATE INDEX idx_business_profiles_type ON business_profiles(business_type);
CREATE INDEX idx_business_profiles_state ON business_profiles(state);
CREATE INDEX idx_business_profiles_budget ON business_profiles(budget_range);
CREATE INDEX idx_business_profiles_verified ON business_profiles(verified);
CREATE INDEX idx_business_profiles_local ON business_profiles(local_market_only);

-- GIN index for array searches
CREATE INDEX idx_business_profiles_sports ON business_profiles USING GIN (preferred_sports);
CREATE INDEX idx_business_profiles_geo ON business_profiles USING GIN (geographic_focus);
CREATE INDEX idx_business_profiles_looking ON business_profiles USING GIN (looking_for);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Businesses can read and update their own profile
CREATE POLICY "Businesses can manage own profile"
  ON business_profiles
  FOR ALL
  USING (
    id = auth.uid()
  )
  WITH CHECK (
    id = auth.uid()
  );

-- Policy 2: Athletes can view verified business profiles
CREATE POLICY "Athletes can view verified businesses"
  ON business_profiles
  FOR SELECT
  USING (
    verified = true
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'athlete'
    )
  );

-- Policy 3: Public can view basic verified business information
CREATE POLICY "Public can view verified business profiles"
  ON business_profiles
  FOR SELECT
  USING (
    verified = true
  );

-- Policy 4: Service role can manage all businesses
CREATE POLICY "Service role can manage all businesses"
  ON business_profiles
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
CREATE OR REPLACE FUNCTION update_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_business_profiles_updated_at();

-- ============================================================================
-- TRIGGER: Calculate average deal value
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_business_avg_deal_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_deals_completed > 0 AND NEW.total_spent > 0 THEN
    NEW.average_deal_value := NEW.total_spent / NEW.total_deals_completed;
  ELSE
    NEW.average_deal_value := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_business_avg_deal_value
  BEFORE UPDATE OF total_deals_completed, total_spent ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_business_avg_deal_value();

-- ============================================================================
-- HELPER FUNCTION: Get businesses by location/budget
-- ============================================================================
CREATE OR REPLACE FUNCTION find_businesses_for_athlete(
  p_athlete_state TEXT DEFAULT NULL,
  p_athlete_sport TEXT DEFAULT NULL,
  p_min_budget TEXT DEFAULT 'under_1k'
)
RETURNS TABLE (
  business_id UUID,
  business_name TEXT,
  business_type TEXT,
  city TEXT,
  state TEXT,
  budget_range TEXT,
  looking_for TEXT[],
  rating_score DECIMAL,
  total_deals_completed INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.business_name,
    b.business_type::TEXT,
    b.city,
    b.state,
    b.budget_range::TEXT,
    b.looking_for,
    b.rating_score,
    b.total_deals_completed
  FROM business_profiles b
  WHERE
    b.verified = true
    AND (
      b.local_market_only = false
      OR p_athlete_state = ANY(b.geographic_focus)
      OR b.state = p_athlete_state
    )
    AND (
      b.preferred_sports IS NULL
      OR array_length(b.preferred_sports, 1) IS NULL
      OR p_athlete_sport = ANY(b.preferred_sports)
    )
  ORDER BY b.rating_score DESC NULLS LAST, b.total_deals_completed DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get business deal statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION get_business_deal_stats(p_business_id UUID)
RETURNS TABLE (
  total_deals INTEGER,
  active_deals INTEGER,
  completed_deals INTEGER,
  total_spent DECIMAL,
  avg_deal_value DECIMAL,
  completion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.total_deals_created,
    (SELECT COUNT(*)::INTEGER FROM nil_deals WHERE agency_id = p_business_id AND status = 'active'),
    b.total_deals_completed,
    b.total_spent,
    b.average_deal_value,
    CASE
      WHEN b.total_deals_created > 0 THEN
        ROUND((b.total_deals_completed::DECIMAL / b.total_deals_created::DECIMAL) * 100, 2)
      ELSE
        0.00
    END AS completion_rate
  FROM business_profiles b
  WHERE b.id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON business_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION find_businesses_for_athlete(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_deal_stats(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE business_profiles IS 'Stores profile information for businesses (simpler than agencies) interested in NIL deals';
COMMENT ON COLUMN business_profiles.business_type IS 'Type of business: local_business, restaurant, retail_store, national_brand, etc.';
COMMENT ON COLUMN business_profiles.budget_range IS 'Estimated annual NIL budget range';
COMMENT ON COLUMN business_profiles.looking_for IS 'Array of NIL opportunities business is seeking: social_media_posts, event_appearances, etc.';
COMMENT ON COLUMN business_profiles.geographic_focus IS 'Array of state codes where business operates';
COMMENT ON COLUMN business_profiles.local_market_only IS 'Whether business only works with local athletes';
COMMENT ON COLUMN business_profiles.preferred_athlete_level IS 'Preferred athlete level: high_school, college, any';
COMMENT ON COLUMN business_profiles.default_deal_terms IS 'JSON template for quick deal creation with standard terms';
COMMENT ON COLUMN business_profiles.verified IS 'Whether business has been verified (email, phone, or business license)';
