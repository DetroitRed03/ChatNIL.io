-- ============================================================================
-- Migration 090: Grant Demo Endpoint Permissions
-- ============================================================================
-- Grants service role access to agency_campaigns and athlete_public_profiles
-- Required for demo matchmaking and FMV endpoints
-- ============================================================================

-- Grant service role full access to agency_campaigns
GRANT ALL ON agency_campaigns TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant service role full access to athlete_public_profiles
GRANT ALL ON athlete_public_profiles TO service_role;

-- Grant service role access to related tables for matchmaking
GRANT ALL ON campaign_athlete_invites TO service_role;
GRANT ALL ON agency_athlete_messages TO service_role;

-- Enable RLS on agency_campaigns if not already enabled
ALTER TABLE agency_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role to bypass RLS
CREATE POLICY "service_role_all_access_agency_campaigns"
ON agency_campaigns
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Enable RLS on athlete_public_profiles if not already enabled
ALTER TABLE athlete_public_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role to bypass RLS
CREATE POLICY "service_role_all_access_athlete_public_profiles"
ON athlete_public_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant anon and authenticated roles read access to these tables for demo purposes
GRANT SELECT ON agency_campaigns TO anon, authenticated;
GRANT SELECT ON athlete_public_profiles TO anon, authenticated;

-- Create public read policy for agency_campaigns (for demo)
CREATE POLICY "public_read_agency_campaigns"
ON agency_campaigns
FOR SELECT
TO anon, authenticated
USING (status IN ('active', 'draft'));

-- Create public read policy for athlete_public_profiles (for demo)
CREATE POLICY "public_read_athlete_public_profiles"
ON athlete_public_profiles
FOR SELECT
TO anon, authenticated
USING (is_available_for_partnerships = true);
