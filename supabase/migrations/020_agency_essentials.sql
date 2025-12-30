-- Migration: 020_agency_essentials.sql
-- Agency Essentials: Onboarding, Profiles, Search, and Matching
-- Created: 2025-12-29

-- ============================================================================
-- AGENCY PROFILES TABLE
-- Extends users table for agency-specific data
-- ============================================================================

CREATE TABLE IF NOT EXISTS agency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Company Information
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT NOT NULL,
  description TEXT,
  tagline TEXT,

  -- Company Details
  company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  founded_year INTEGER,
  headquarters_city TEXT,
  headquarters_state TEXT,

  -- Contact Information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Social Links
  linkedin_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,

  -- Onboarding Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_step INTEGER DEFAULT 0,

  -- Profile Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_agency_user UNIQUE (user_id)
);

-- ============================================================================
-- AGENCY BRAND VALUES TABLE
-- Links agencies to core_traits with priority weighting
-- ============================================================================

CREATE TABLE IF NOT EXISTS agency_brand_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_profile_id UUID NOT NULL REFERENCES agency_profiles(id) ON DELETE CASCADE,
  trait_id UUID NOT NULL REFERENCES core_traits(id) ON DELETE CASCADE,

  -- Priority: 1 = highest priority, 5 = lowest
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),

  -- Importance weight for matching (0.0-1.0)
  importance_weight DECIMAL(3,2) DEFAULT 1.00 CHECK (importance_weight BETWEEN 0.00 AND 1.00),

  -- Notes on why this value matters
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_agency_trait UNIQUE (agency_profile_id, trait_id)
);

-- ============================================================================
-- AGENCY TARGET CRITERIA TABLE
-- Stores what agencies are looking for in athletes
-- ============================================================================

CREATE TABLE IF NOT EXISTS agency_target_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_profile_id UUID NOT NULL REFERENCES agency_profiles(id) ON DELETE CASCADE,

  -- Sports Interest
  target_sports TEXT[] DEFAULT '{}',

  -- Follower Requirements
  min_followers INTEGER DEFAULT 0,
  max_followers INTEGER,

  -- Geographic Targeting
  target_states TEXT[] DEFAULT '{}',
  target_regions TEXT[] DEFAULT '{}',

  -- School Level Targeting
  target_school_levels TEXT[] DEFAULT '{}',

  -- FMV Targeting
  min_fmv DECIMAL(12,2),
  max_fmv DECIMAL(12,2),

  -- Engagement Requirements
  min_engagement_rate DECIMAL(5,2),

  -- Archetype Preferences
  preferred_archetypes UUID[] DEFAULT '{}',

  -- Additional Preferences (flexible JSONB)
  additional_criteria JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_agency_criteria UNIQUE (agency_profile_id)
);

-- ============================================================================
-- INTERACTION STATUS ENUM
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE interaction_status AS ENUM (
    'suggested',
    'viewed',
    'saved',
    'contacted',
    'interested',
    'in_discussion',
    'deal_proposed',
    'declined',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- AGENCY-ATHLETE INTERACTIONS TABLE
-- Tracks all interactions between agencies and athletes
-- ============================================================================

CREATE TABLE IF NOT EXISTS agency_athlete_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_profile_id UUID NOT NULL REFERENCES agency_profiles(id) ON DELETE CASCADE,
  athlete_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Current Status
  status interaction_status DEFAULT 'suggested',

  -- Match Information (cached)
  match_score DECIMAL(5,2),
  trait_alignment_score DECIMAL(5,2),
  criteria_match_score DECIMAL(5,2),

  -- Interaction History
  first_viewed_at TIMESTAMPTZ,
  first_contacted_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,

  -- Agency Notes
  agency_notes TEXT,

  -- Match Breakdown (for UI)
  match_breakdown JSONB DEFAULT '{}',

  -- Tracking
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_agency_athlete UNIQUE (agency_profile_id, athlete_user_id)
);

-- ============================================================================
-- INDUSTRY OPTIONS TABLE
-- Reference table for consistent industry options
-- ============================================================================

CREATE TABLE IF NOT EXISTS industry_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Seed industry options
INSERT INTO industry_options (name, display_name, icon, sort_order) VALUES
  ('apparel', 'Apparel & Fashion', 'shirt', 1),
  ('sports_equipment', 'Sports Equipment', 'dumbbell', 2),
  ('food_beverage', 'Food & Beverage', 'utensils', 3),
  ('technology', 'Technology', 'laptop', 4),
  ('automotive', 'Automotive', 'car', 5),
  ('finance', 'Finance & Banking', 'landmark', 6),
  ('health_fitness', 'Health & Fitness', 'heart-pulse', 7),
  ('entertainment', 'Entertainment & Media', 'tv', 8),
  ('gaming', 'Gaming & Esports', 'gamepad-2', 9),
  ('travel', 'Travel & Hospitality', 'plane', 10),
  ('education', 'Education', 'graduation-cap', 11),
  ('real_estate', 'Real Estate', 'building', 12),
  ('retail', 'Retail', 'shopping-bag', 13),
  ('crypto_web3', 'Crypto & Web3', 'bitcoin', 14),
  ('other', 'Other', 'briefcase', 99)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Agency Profiles
CREATE INDEX IF NOT EXISTS idx_agency_profiles_user_id ON agency_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_profiles_slug ON agency_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_agency_profiles_industry ON agency_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_agency_profiles_active ON agency_profiles(is_active) WHERE is_active = TRUE;

-- Agency Brand Values
CREATE INDEX IF NOT EXISTS idx_agency_brand_values_agency ON agency_brand_values(agency_profile_id);
CREATE INDEX IF NOT EXISTS idx_agency_brand_values_trait ON agency_brand_values(trait_id);
CREATE INDEX IF NOT EXISTS idx_agency_brand_values_priority ON agency_brand_values(agency_profile_id, priority);

-- Agency Target Criteria
CREATE INDEX IF NOT EXISTS idx_agency_target_criteria_agency ON agency_target_criteria(agency_profile_id);
CREATE INDEX IF NOT EXISTS idx_agency_target_criteria_sports ON agency_target_criteria USING GIN(target_sports);
CREATE INDEX IF NOT EXISTS idx_agency_target_criteria_states ON agency_target_criteria USING GIN(target_states);
CREATE INDEX IF NOT EXISTS idx_agency_target_criteria_levels ON agency_target_criteria USING GIN(target_school_levels);

-- Agency-Athlete Interactions
CREATE INDEX IF NOT EXISTS idx_interactions_agency ON agency_athlete_interactions(agency_profile_id);
CREATE INDEX IF NOT EXISTS idx_interactions_athlete ON agency_athlete_interactions(athlete_user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_status ON agency_athlete_interactions(status);
CREATE INDEX IF NOT EXISTS idx_interactions_match_score ON agency_athlete_interactions(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_agency_status ON agency_athlete_interactions(agency_profile_id, status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate slug from company name
CREATE OR REPLACE FUNCTION generate_agency_slug(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM agency_profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_agency_profiles_updated_at ON agency_profiles;
CREATE TRIGGER update_agency_profiles_updated_at
  BEFORE UPDATE ON agency_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_brand_values_updated_at ON agency_brand_values;
CREATE TRIGGER update_agency_brand_values_updated_at
  BEFORE UPDATE ON agency_brand_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_target_criteria_updated_at ON agency_target_criteria;
CREATE TRIGGER update_agency_target_criteria_updated_at
  BEFORE UPDATE ON agency_target_criteria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interactions_updated_at ON agency_athlete_interactions;
CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON agency_athlete_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_brand_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_target_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_athlete_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_options ENABLE ROW LEVEL SECURITY;

-- Agency Profiles: Owners can read/write, others can read active profiles
DROP POLICY IF EXISTS agency_profiles_owner ON agency_profiles;
CREATE POLICY agency_profiles_owner ON agency_profiles
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS agency_profiles_public_read ON agency_profiles;
CREATE POLICY agency_profiles_public_read ON agency_profiles
  FOR SELECT USING (is_active = TRUE);

-- Brand Values: Only agency owners can manage
DROP POLICY IF EXISTS agency_brand_values_owner ON agency_brand_values;
CREATE POLICY agency_brand_values_owner ON agency_brand_values
  FOR ALL USING (
    agency_profile_id IN (
      SELECT id FROM agency_profiles WHERE user_id = auth.uid()
    )
  );

-- Target Criteria: Only agency owners can manage
DROP POLICY IF EXISTS agency_target_criteria_owner ON agency_target_criteria;
CREATE POLICY agency_target_criteria_owner ON agency_target_criteria
  FOR ALL USING (
    agency_profile_id IN (
      SELECT id FROM agency_profiles WHERE user_id = auth.uid()
    )
  );

-- Interactions: Agencies see their interactions, athletes see interactions about them
DROP POLICY IF EXISTS interactions_agency_owner ON agency_athlete_interactions;
CREATE POLICY interactions_agency_owner ON agency_athlete_interactions
  FOR ALL USING (
    agency_profile_id IN (
      SELECT id FROM agency_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS interactions_athlete_read ON agency_athlete_interactions;
CREATE POLICY interactions_athlete_read ON agency_athlete_interactions
  FOR SELECT USING (athlete_user_id = auth.uid());

-- Industry Options: Everyone can read
DROP POLICY IF EXISTS industry_options_read ON industry_options;
CREATE POLICY industry_options_read ON industry_options
  FOR SELECT USING (true);

-- ============================================================================
-- GRANT SERVICE ROLE ACCESS
-- ============================================================================

GRANT ALL ON agency_profiles TO service_role;
GRANT ALL ON agency_brand_values TO service_role;
GRANT ALL ON agency_target_criteria TO service_role;
GRANT ALL ON agency_athlete_interactions TO service_role;
GRANT ALL ON industry_options TO service_role;
