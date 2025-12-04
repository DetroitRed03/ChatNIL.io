-- ============================================================================
-- COMPLETE MATCHMAKING SYSTEM SETUP - FINAL WORKING VERSION
-- ============================================================================
-- This matches the ACTUAL database schema, not the migration files
-- ============================================================================

-- ===========================================================================
-- PART 1: CREATE MISSING TABLES (nil_deals, state_nil_rules)
-- ===========================================================================

-- Create ENUMs for nil_deals
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
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES users(id) ON DELETE SET NULL,
  brand_name TEXT,
  deal_title TEXT,
  description TEXT,
  deal_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  compensation_amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  deal_date DATE,
  start_date DATE,
  end_date DATE,
  deliverables JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nil_deals_athlete ON nil_deals(athlete_id);
CREATE INDEX IF NOT EXISTS idx_nil_deals_agency ON nil_deals(agency_id);
CREATE INDEX IF NOT EXISTS idx_nil_deals_status ON nil_deals(status);

ALTER TABLE nil_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Athletes can view own deals" ON nil_deals;
CREATE POLICY "Athletes can view own deals" ON nil_deals
  FOR SELECT USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Public can view public deals" ON nil_deals;
CREATE POLICY "Public can view public deals" ON nil_deals
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Service role full access" ON nil_deals;
CREATE POLICY "Service role full access" ON nil_deals
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Create state_nil_rules table
CREATE TABLE IF NOT EXISTS state_nil_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL UNIQUE,
  state_name TEXT NOT NULL,
  allows_nil BOOLEAN DEFAULT true,
  high_school_allowed BOOLEAN DEFAULT false,
  college_allowed BOOLEAN DEFAULT true,
  prohibited_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  disclosure_required BOOLEAN DEFAULT false,
  school_notification_required BOOLEAN DEFAULT false,
  notes TEXT,
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_state_nil_rules_state_code ON state_nil_rules(state_code);

ALTER TABLE state_nil_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "State rules publicly readable" ON state_nil_rules;
CREATE POLICY "State rules publicly readable" ON state_nil_rules
  FOR SELECT USING (true);

-- Seed state rules
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, prohibited_categories, disclosure_required, notes)
VALUES
  ('CA', 'California', true, false, true, ARRAY['alcohol', 'tobacco', 'cannabis', 'gambling']::TEXT[], true, 'First state to pass NIL legislation'),
  ('FL', 'Florida', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], false, 'Very athlete-friendly'),
  ('TX', 'Texas', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Active NIL market'),
  ('NY', 'New York', true, false, true, ARRAY['alcohol', 'tobacco', 'cannabis', 'gambling']::TEXT[], true, 'Requires disclosure'),
  ('IL', 'Illinois', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Standard rules'),
  ('KY', 'Kentucky', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Basketball-focused'),
  ('OH', 'Ohio', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], false, 'Athlete-friendly'),
  ('GA', 'Georgia', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Active ecosystem'),
  ('NC', 'North Carolina', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Standard regulations'),
  ('MI', 'Michigan', true, false, true, ARRAY['alcohol', 'tobacco', 'gambling']::TEXT[], true, 'Active market')
ON CONFLICT (state_code) DO NOTHING;

-- ===========================================================================
-- PART 2: INSERT DATA (Using ACTUAL table schema)
-- ===========================================================================

-- Insert NIL Deals for Sarah Johnson
INSERT INTO nil_deals (
  athlete_id,
  brand_name,
  deal_type,
  status,
  compensation_amount,
  deal_date,
  description,
  is_public
)
VALUES
  (
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    'Nike',
    'social_media',
    'completed',
    1500,
    '2024-06-15',
    'Instagram post promoting Nike Basketball shoes with behind-the-scenes training content',
    true
  ),
  (
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    'Gatorade',
    'content_creation',
    'completed',
    2000,
    '2024-07-20',
    'TikTok video series featuring hydration tips and game-day preparation',
    true
  ),
  (
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    'Local Sporting Goods Store',
    'brand_ambassador',
    'active',
    5000,
    '2024-08-01',
    'Monthly brand ambassador with in-store appearances, social media posts, and community events',
    true
  )
ON CONFLICT DO NOTHING;

-- Insert Campaigns (using ACTUAL schema: agency_id, name, budget)
INSERT INTO agency_campaigns (
  agency_id,
  name,
  description,
  budget,
  target_sports,
  start_date,
  end_date,
  status
)
VALUES
  (
    '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
    'College Basketball Ambassadors 2024',
    'Nike - Seeking D1 basketball athletes for social media partnerships.',
    10000000,
    ARRAY['Basketball']::text[],
    '2024-09-01',
    '2025-05-31',
    'active'
  ),
  (
    '6adbdd57-e355-4a99-9911-038726067533',
    'TikTok Content Creators - Sports Edition',
    'Gatorade - Looking for athletic TikTok creators with high engagement.',
    5000000,
    ARRAY['Basketball', 'Volleyball', 'Soccer', 'Track']::text[],
    '2024-08-01',
    '2025-03-31',
    'active'
  ),
  (
    'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6',
    'Athletes for Education',
    'Scholars United - Mission-driven campaign supporting educational access.',
    3000000,
    ARRAY['Basketball', 'Soccer', 'Track', 'Volleyball']::text[],
    '2024-09-15',
    '2025-06-30',
    'active'
  ),
  (
    'a6d72510-8ec1-4821-99b8-3b08b37ec58c',
    'Local Business Ambassadors - Kentucky',
    'Kentucky Small Business Coalition - Support local businesses through athlete partnerships.',
    2000000,
    ARRAY['Basketball', 'Football', 'Baseball', 'Volleyball']::text[],
    '2024-10-01',
    '2025-04-30',
    'active'
  ),
  (
    '471b4543-940f-4ade-8097-dae36e33365f',
    'Elite Athletes Partnership Program',
    'Premium Brand Collective - Exclusive partnerships for top-tier athletes with national reach.',
    30000000,
    ARRAY['Basketball', 'Football']::text[],
    '2024-11-01',
    '2025-10-31',
    'active'
  )
ON CONFLICT DO NOTHING;

-- Insert Agency-Athlete Matches (using ACTUAL schema: match_reasons, tier)
INSERT INTO agency_athlete_matches (
  agency_id,
  athlete_id,
  match_score,
  tier,
  match_reasons,
  status
)
VALUES
  (
    '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    85,
    'high',
    ARRAY['Perfect match for basketball partnerships', 'Strong social presence: 145.8K followers, 4.7% engagement', 'D1 UCLA athlete with leadership experience']::TEXT[],
    'suggested'
  ),
  (
    '6adbdd57-e355-4a99-9911-038726067533',
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    78,
    'high',
    ARRAY['Excellent fit for digital campaigns', 'Outstanding TikTok presence: 82.1K followers', 'High engagement above platform average', 'California market alignment']::TEXT[],
    'suggested'
  ),
  (
    'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6',
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    72,
    'medium',
    ARRAY['Great candidate for mission-driven campaigns', 'Academic All-American status', 'Demonstrates commitment beyond athletics']::TEXT[],
    'suggested'
  )
ON CONFLICT DO NOTHING;

-- ===========================================================================
-- VERIFICATION
-- ===========================================================================

SELECT
  'Setup complete!' as status,
  (SELECT COUNT(*) FROM nil_deals WHERE athlete_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc') as sarah_nil_deals,
  (SELECT COUNT(*) FROM agency_campaigns WHERE status = 'active') as active_campaigns,
  (SELECT COUNT(*) FROM agency_athlete_matches WHERE athlete_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc') as sarah_matches,
  (SELECT COUNT(*) FROM state_nil_rules) as state_rules;
