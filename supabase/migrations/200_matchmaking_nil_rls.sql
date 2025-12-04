-- ============================================================================
-- Migration 200: Matchmaking & NIL Deals Schema Fixes + RLS Policies
-- ============================================================================
-- Purpose: Fix schema issues, add RLS policies for security
-- Tables affected: agency_athlete_matches, nil_deals
-- ============================================================================

-- ============================================================================
-- PART A: Fix agency_athlete_matches Schema
-- ============================================================================

-- 1. Rename 'tier' to 'match_tier' for consistency with codebase
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'agency_athlete_matches' AND column_name = 'tier') THEN
    ALTER TABLE agency_athlete_matches RENAME COLUMN tier TO match_tier;
    RAISE NOTICE 'Renamed tier -> match_tier';
  ELSE
    RAISE NOTICE 'Column match_tier already exists or tier does not exist';
  END IF;
END $$;

-- 2. Add additional columns for better tracking (if not exist)
ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}'::jsonb;

ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;

ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS athlete_response_at TIMESTAMPTZ;

ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS athlete_response_status TEXT;

ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES nil_deals(id) ON DELETE SET NULL;

ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS deal_created_at TIMESTAMPTZ;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_agency_score
  ON agency_athlete_matches(agency_id, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_matches_athlete_score
  ON agency_athlete_matches(athlete_id, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_matches_status
  ON agency_athlete_matches(status);

CREATE INDEX IF NOT EXISTS idx_matches_tier
  ON agency_athlete_matches(match_tier);

CREATE INDEX IF NOT EXISTS idx_matches_deal_id
  ON agency_athlete_matches(deal_id) WHERE deal_id IS NOT NULL;

-- ============================================================================
-- PART B: RLS Policies for agency_athlete_matches
-- ============================================================================

-- Enable RLS
ALTER TABLE agency_athlete_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "agencies_view_own_matches" ON agency_athlete_matches;
DROP POLICY IF EXISTS "athletes_view_own_matches" ON agency_athlete_matches;
DROP POLICY IF EXISTS "agencies_update_own_matches" ON agency_athlete_matches;
DROP POLICY IF EXISTS "athletes_respond_to_matches" ON agency_athlete_matches;
DROP POLICY IF EXISTS "service_role_full_access_matches" ON agency_athlete_matches;

-- Policy 1: Agencies can view matches where they are the agency
-- Uses users table since agency_id references users.id
CREATE POLICY "agencies_view_own_matches"
  ON agency_athlete_matches
  FOR SELECT
  TO authenticated
  USING (agency_id = auth.uid());

-- Policy 2: Athletes can view matches where they are the athlete
CREATE POLICY "athletes_view_own_matches"
  ON agency_athlete_matches
  FOR SELECT
  TO authenticated
  USING (athlete_id = auth.uid());

-- Policy 3: Agencies can update their matches (status changes, contact info)
CREATE POLICY "agencies_update_own_matches"
  ON agency_athlete_matches
  FOR UPDATE
  TO authenticated
  USING (agency_id = auth.uid())
  WITH CHECK (agency_id = auth.uid());

-- Policy 4: Athletes can update matches (respond to contact)
CREATE POLICY "athletes_respond_to_matches"
  ON agency_athlete_matches
  FOR UPDATE
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Policy 5: Service role has full access (for matchmaking engine)
CREATE POLICY "service_role_full_access_matches"
  ON agency_athlete_matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- PART C: RLS Policies for nil_deals
-- ============================================================================

-- Enable RLS
ALTER TABLE nil_deals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "agencies_view_own_deals" ON nil_deals;
DROP POLICY IF EXISTS "athletes_view_own_deals" ON nil_deals;
DROP POLICY IF EXISTS "agencies_create_deals" ON nil_deals;
DROP POLICY IF EXISTS "agencies_update_own_deals" ON nil_deals;
DROP POLICY IF EXISTS "athletes_update_own_deals" ON nil_deals;
DROP POLICY IF EXISTS "service_role_full_access_deals" ON nil_deals;
DROP POLICY IF EXISTS "no_delete_deals" ON nil_deals;

-- Policy 1: Agencies can view their own deals
CREATE POLICY "agencies_view_own_deals"
  ON nil_deals
  FOR SELECT
  TO authenticated
  USING (agency_id = auth.uid());

-- Policy 2: Athletes can view their own deals
CREATE POLICY "athletes_view_own_deals"
  ON nil_deals
  FOR SELECT
  TO authenticated
  USING (athlete_id = auth.uid());

-- Policy 3: Agencies can create deals (must be their agency_id)
CREATE POLICY "agencies_create_deals"
  ON nil_deals
  FOR INSERT
  TO authenticated
  WITH CHECK (agency_id = auth.uid());

-- Policy 4: Agencies can update their own deals
CREATE POLICY "agencies_update_own_deals"
  ON nil_deals
  FOR UPDATE
  TO authenticated
  USING (agency_id = auth.uid())
  WITH CHECK (agency_id = auth.uid());

-- Policy 5: Athletes can update their own deals (for approvals)
CREATE POLICY "athletes_update_own_deals"
  ON nil_deals
  FOR UPDATE
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Policy 6: Service role has full access
CREATE POLICY "service_role_full_access_deals"
  ON nil_deals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- NO DELETE policy for authenticated users (soft delete only via status update)
-- Deletes only allowed via service_role

-- ============================================================================
-- PART D: Add nil_deals indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_deals_athlete
  ON nil_deals(athlete_id, status);

CREATE INDEX IF NOT EXISTS idx_deals_agency
  ON nil_deals(agency_id, status);

CREATE INDEX IF NOT EXISTS idx_deals_status
  ON nil_deals(status);

CREATE INDEX IF NOT EXISTS idx_deals_dates
  ON nil_deals(start_date, end_date);

-- ============================================================================
-- PART E: Create helper views
-- ============================================================================

-- View: Active opportunities for athletes (simplified match view)
DROP VIEW IF EXISTS athlete_opportunities;
CREATE OR REPLACE VIEW athlete_opportunities AS
SELECT
  m.id,
  m.agency_id,
  m.athlete_id,
  m.match_score,
  m.match_tier,
  m.match_reasons,
  m.status,
  m.contacted_at,
  m.created_at,
  m.deal_id,
  u.first_name as agency_first_name,
  u.last_name as agency_last_name,
  u.company_name as agency_name,
  u.email as agency_email,
  CASE
    WHEN m.status IN ('rejected', 'expired') THEN 'inactive'
    ELSE 'active'
  END as opportunity_status
FROM agency_athlete_matches m
JOIN users u ON u.id = m.agency_id
WHERE m.status NOT IN ('rejected', 'expired');

-- Grant access to view
GRANT SELECT ON athlete_opportunities TO authenticated;

-- View: Match-to-Deal pipeline for tracking conversion
DROP VIEW IF EXISTS match_deal_pipeline;
CREATE OR REPLACE VIEW match_deal_pipeline AS
SELECT
  m.id as match_id,
  m.agency_id,
  m.athlete_id,
  m.match_score,
  m.match_tier,
  m.status as match_status,
  m.contacted_at,
  m.deal_id,
  m.deal_created_at,
  d.deal_title,
  d.status as deal_status,
  d.compensation_amount,
  d.start_date,
  d.end_date,
  ag.company_name as agency_name,
  ag.first_name as agency_first_name,
  ag.last_name as agency_last_name,
  at.first_name as athlete_first_name,
  at.last_name as athlete_last_name,
  ap.sport as athlete_sport,
  ap.school as athlete_school
FROM agency_athlete_matches m
JOIN users ag ON ag.id = m.agency_id
JOIN users at ON at.id = m.athlete_id
LEFT JOIN athlete_profiles ap ON ap.user_id = m.athlete_id
LEFT JOIN nil_deals d ON d.id = m.deal_id;

-- Grant access to view
GRANT SELECT ON match_deal_pipeline TO authenticated;

-- ============================================================================
-- PART F: Grant permissions
-- ============================================================================

-- Ensure authenticated users can access the tables
GRANT SELECT, INSERT, UPDATE ON agency_athlete_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE ON nil_deals TO authenticated;

-- Service role gets full access
GRANT ALL ON agency_athlete_matches TO service_role;
GRANT ALL ON nil_deals TO service_role;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration 200: Matchmaking & NIL Deals RLS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Schema changes applied:';
  RAISE NOTICE '  - Renamed tier -> match_tier (if existed)';
  RAISE NOTICE '  - Added tracking columns to agency_athlete_matches';
  RAISE NOTICE '  - Added indexes for performance';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies created:';
  RAISE NOTICE '  agency_athlete_matches:';
  RAISE NOTICE '    - agencies_view_own_matches';
  RAISE NOTICE '    - athletes_view_own_matches';
  RAISE NOTICE '    - agencies_update_own_matches';
  RAISE NOTICE '    - athletes_respond_to_matches';
  RAISE NOTICE '    - service_role_full_access_matches';
  RAISE NOTICE '';
  RAISE NOTICE '  nil_deals:';
  RAISE NOTICE '    - agencies_view_own_deals';
  RAISE NOTICE '    - athletes_view_own_deals';
  RAISE NOTICE '    - agencies_create_deals';
  RAISE NOTICE '    - agencies_update_own_deals';
  RAISE NOTICE '    - athletes_update_own_deals';
  RAISE NOTICE '    - service_role_full_access_deals';
  RAISE NOTICE '';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  - athlete_opportunities';
  RAISE NOTICE '  - match_deal_pipeline';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE '============================================';
END $$;
