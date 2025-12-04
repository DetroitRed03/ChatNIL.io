-- ============================================================================
-- CREATE MISSING TABLES FOR MATCHMAKING SYSTEM
-- ============================================================================
-- This creates the nil_deals and state_nil_rules tables that are missing
-- ============================================================================

-- 1. CREATE NIL DEALS TABLE
-- ============================================================================

-- Drop and recreate ENUMs if they exist
DO $$ BEGIN
    CREATE TYPE deal_type AS ENUM (
      'sponsorship', 'endorsement', 'appearance', 'content_creation',
      'social_media', 'merchandise', 'licensing', 'event', 'brand_ambassador', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM (
      'draft', 'pending', 'active', 'completed', 'cancelled', 'expired', 'on_hold'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create nil_deals table
CREATE TABLE IF NOT EXISTS nil_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Deal basics
  brand_name TEXT,
  deal_title TEXT,
  description TEXT,
  deal_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',

  -- Financial
  compensation_amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',

  -- Timeline
  deal_date DATE,
  start_date DATE,
  end_date DATE,

  -- Deliverables
  deliverables JSONB DEFAULT '[]'::jsonb,

  -- Visibility
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for nil_deals
CREATE INDEX IF NOT EXISTS idx_nil_deals_athlete ON nil_deals(athlete_id);
CREATE INDEX IF NOT EXISTS idx_nil_deals_agency ON nil_deals(agency_id);
CREATE INDEX IF NOT EXISTS idx_nil_deals_status ON nil_deals(status);
CREATE INDEX IF NOT EXISTS idx_nil_deals_public ON nil_deals(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE nil_deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nil_deals
DROP POLICY IF EXISTS "Athletes can view own deals" ON nil_deals;
CREATE POLICY "Athletes can view own deals" ON nil_deals
  FOR SELECT USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Agencies can view their deals" ON nil_deals;
CREATE POLICY "Agencies can view their deals" ON nil_deals
  FOR SELECT USING (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Public can view public deals" ON nil_deals;
CREATE POLICY "Public can view public deals" ON nil_deals
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Service role can manage all deals" ON nil_deals;
CREATE POLICY "Service role can manage all deals" ON nil_deals
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

DROP POLICY IF EXISTS "Athletes can insert own deals" ON nil_deals;
CREATE POLICY "Athletes can insert own deals" ON nil_deals
  FOR INSERT WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can update own deals" ON nil_deals;
CREATE POLICY "Athletes can update own deals" ON nil_deals
  FOR UPDATE USING (auth.uid() = athlete_id);

-- 2. CREATE STATE NIL RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS state_nil_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- State identification
  state_code TEXT NOT NULL UNIQUE,
  state_name TEXT NOT NULL,

  -- Basic rules
  allows_nil BOOLEAN DEFAULT true,
  high_school_allowed BOOLEAN DEFAULT false,
  college_allowed BOOLEAN DEFAULT true,

  -- Prohibited categories
  prohibited_categories TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Requirements
  disclosure_required BOOLEAN DEFAULT false,
  school_notification_required BOOLEAN DEFAULT false,
  legal_representation_required BOOLEAN DEFAULT false,

  -- Financial rules
  max_deal_value DECIMAL(12, 2),
  requires_financial_literacy BOOLEAN DEFAULT false,

  -- Additional details
  notes TEXT,
  effective_date DATE,
  legislation_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for state_nil_rules
CREATE INDEX IF NOT EXISTS idx_state_nil_rules_state_code ON state_nil_rules(state_code);
CREATE INDEX IF NOT EXISTS idx_state_nil_rules_allows_nil ON state_nil_rules(allows_nil);

-- Enable RLS (public readable)
ALTER TABLE state_nil_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for state_nil_rules
DROP POLICY IF EXISTS "State NIL rules are publicly readable" ON state_nil_rules;
CREATE POLICY "State NIL rules are publicly readable" ON state_nil_rules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage state rules" ON state_nil_rules;
CREATE POLICY "Service role can manage state rules" ON state_nil_rules
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- 3. SEED INITIAL STATE RULES (Top 10 States)
-- ============================================================================

INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, prohibited_categories, disclosure_required, notes)
VALUES
  ('CA', 'California', true, false, true, ARRAY['alcohol', 'tobacco', 'cannabis', 'gambling']::TEXT[], true, 'First state to pass NIL legislation'),
  ('FL', 'Florida', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], false, 'Very athlete-friendly NIL rules'),
  ('TX', 'Texas', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Active NIL market'),
  ('NY', 'New York', true, false, true, ARRAY['alcohol', 'tobacco', 'cannabis', 'gambling']::TEXT[], true, 'Requires disclosure to school'),
  ('IL', 'Illinois', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Standard NIL rules'),
  ('KY', 'Kentucky', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Basketball-focused market'),
  ('OH', 'Ohio', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], false, 'Athlete-friendly state'),
  ('GA', 'Georgia', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Active NIL ecosystem'),
  ('NC', 'North Carolina', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Standard regulations'),
  ('MI', 'Michigan', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Active NIL market')
ON CONFLICT (state_code) DO NOTHING;

-- Verification
SELECT
  'Tables created successfully!' as status,
  (SELECT COUNT(*) FROM nil_deals) as nil_deals_count,
  (SELECT COUNT(*) FROM state_nil_rules) as state_rules_count;
