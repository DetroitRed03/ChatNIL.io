-- ============================================================================
-- Migration 019b: RLS Policies for Agency-Athlete Matches Table
-- ============================================================================

-- Grant permissions
GRANT ALL ON agency_athlete_matches TO service_role;
GRANT SELECT, INSERT, UPDATE ON agency_athlete_matches TO authenticated;
GRANT SELECT ON agency_athlete_matches TO anon;

-- Enable RLS
ALTER TABLE agency_athlete_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access
CREATE POLICY "service_role_all_access" ON agency_athlete_matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Agencies can view their own matches
CREATE POLICY "agencies_view_own_matches" ON agency_athlete_matches
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = agency_id
  );

-- Policy: Athletes can view matches they're in
CREATE POLICY "athletes_view_own_matches" ON agency_athlete_matches
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = athlete_id
  );

-- Policy: Agencies can update their own matches
CREATE POLICY "agencies_update_own_matches" ON agency_athlete_matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = agency_id)
  WITH CHECK (auth.uid() = agency_id);

-- Policy: Athletes can update their response fields
CREATE POLICY "athletes_update_own_response" ON agency_athlete_matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

-- Policy: System can insert matches (for matchmaking algorithm)
CREATE POLICY "system_insert_matches" ON agency_athlete_matches
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Verification
SELECT 'RLS policies created successfully!' as status,
       COUNT(*) || ' policies on agency_athlete_matches' as detail
FROM pg_policies
WHERE tablename = 'agency_athlete_matches';
