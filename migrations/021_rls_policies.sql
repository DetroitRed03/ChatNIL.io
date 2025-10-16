-- ============================================================================
-- Migration 021: Row Level Security (RLS) Policies
-- ============================================================================
-- Creates RLS policies for all new tables (018-020)
-- Ensures proper data access control and security
-- ============================================================================

-- ============================================================================
-- Table 1: nil_deals RLS Policies
-- ============================================================================

-- Enable RLS on nil_deals
ALTER TABLE nil_deals ENABLE ROW LEVEL SECURITY;

-- Policy: Athletes can view their own deals
CREATE POLICY nil_deals_athlete_select ON nil_deals
  FOR SELECT
  USING (athlete_id = auth.uid());

-- Policy: Agencies can view their own deals
CREATE POLICY nil_deals_agency_select ON nil_deals
  FOR SELECT
  USING (agency_id = auth.uid());

-- Policy: Athletes can insert deals (create draft deals)
CREATE POLICY nil_deals_athlete_insert ON nil_deals
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Policy: Agencies can insert deals
CREATE POLICY nil_deals_agency_insert ON nil_deals
  FOR INSERT
  WITH CHECK (agency_id = auth.uid());

-- Policy: Athletes can update their own deals
CREATE POLICY nil_deals_athlete_update ON nil_deals
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Policy: Agencies can update their own deals
CREATE POLICY nil_deals_agency_update ON nil_deals
  FOR UPDATE
  USING (agency_id = auth.uid())
  WITH CHECK (agency_id = auth.uid());

-- Policy: School admins can view deals for athletes at their school
CREATE POLICY nil_deals_school_admin_select ON nil_deals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
        AND (sa.permissions->>'can_view_athletes')::boolean = TRUE
    )
  );

-- Policy: School admins can update deals for approval
CREATE POLICY nil_deals_school_admin_approve ON nil_deals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
        AND (sa.permissions->>'can_approve_deals')::boolean = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
        AND (sa.permissions->>'can_approve_deals')::boolean = TRUE
    )
  );

-- Policy: Parents can view deals for their connected athletes
CREATE POLICY nil_deals_parent_select ON nil_deals
  FOR SELECT
  USING (
    athlete_id = ANY(
      SELECT unnest(connected_athletes::uuid[])
      FROM users
      WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- ============================================================================
-- Table 2: agency_athlete_matches RLS Policies
-- ============================================================================

-- Enable RLS on agency_athlete_matches
ALTER TABLE agency_athlete_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Agencies can view all their matches
CREATE POLICY matches_agency_select ON agency_athlete_matches
  FOR SELECT
  USING (agency_id = auth.uid());

-- Policy: Athletes can view matches where they are matched
CREATE POLICY matches_athlete_select ON agency_athlete_matches
  FOR SELECT
  USING (athlete_id = auth.uid());

-- Policy: Agencies can insert new matches
CREATE POLICY matches_agency_insert ON agency_athlete_matches
  FOR INSERT
  WITH CHECK (agency_id = auth.uid());

-- Policy: Agencies can update their matches
CREATE POLICY matches_agency_update ON agency_athlete_matches
  FOR UPDATE
  USING (agency_id = auth.uid())
  WITH CHECK (agency_id = auth.uid());

-- Policy: Athletes can update matches (to provide feedback, update notes)
CREATE POLICY matches_athlete_update ON agency_athlete_matches
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Policy: Agencies can delete their saved matches
CREATE POLICY matches_agency_delete ON agency_athlete_matches
  FOR DELETE
  USING (agency_id = auth.uid() AND status IN ('suggested', 'saved'));

-- Policy: School admins can view matches for athletes at their school
CREATE POLICY matches_school_admin_select ON agency_athlete_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
        AND (sa.permissions->>'can_view_analytics')::boolean = TRUE
    )
  );

-- ============================================================================
-- Table 3: school_administrators RLS Policies
-- ============================================================================

-- Enable RLS on school_administrators
ALTER TABLE school_administrators ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view their own record
CREATE POLICY school_admins_self_select ON school_administrators
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Super admins can view all admins at their school
CREATE POLICY school_admins_super_admin_select ON school_administrators
  FOR SELECT
  USING (
    school_name IN (
      SELECT school_name FROM school_administrators
      WHERE user_id = auth.uid()
        AND admin_role = 'super_admin'
        AND is_active = TRUE
    )
  );

-- Policy: Super admins can insert new admins at their school
CREATE POLICY school_admins_super_admin_insert ON school_administrators
  FOR INSERT
  WITH CHECK (
    school_name IN (
      SELECT school_name FROM school_administrators
      WHERE user_id = auth.uid()
        AND admin_role = 'super_admin'
        AND is_active = TRUE
        AND (permissions->>'can_manage_admins')::boolean = TRUE
    )
  );

-- Policy: Super admins can update admins at their school
CREATE POLICY school_admins_super_admin_update ON school_administrators
  FOR UPDATE
  USING (
    school_name IN (
      SELECT school_name FROM school_administrators
      WHERE user_id = auth.uid()
        AND admin_role = 'super_admin'
        AND is_active = TRUE
        AND (permissions->>'can_manage_admins')::boolean = TRUE
    )
  )
  WITH CHECK (
    school_name IN (
      SELECT school_name FROM school_administrators
      WHERE user_id = auth.uid()
        AND admin_role = 'super_admin'
        AND is_active = TRUE
        AND (permissions->>'can_manage_admins')::boolean = TRUE
    )
  );

-- ============================================================================
-- Table 4: school_account_batches RLS Policies
-- ============================================================================

-- Enable RLS on school_account_batches
ALTER TABLE school_account_batches ENABLE ROW LEVEL SECURITY;

-- Policy: Admin who created the batch can view it
CREATE POLICY batches_creator_select ON school_account_batches
  FOR SELECT
  USING (admin_id = auth.uid());

-- Policy: Other admins at same school can view batches
CREATE POLICY batches_school_admin_select ON school_account_batches
  FOR SELECT
  USING (
    school_name IN (
      SELECT school_name FROM school_administrators
      WHERE user_id = auth.uid()
        AND is_active = TRUE
    )
  );

-- Policy: Admins with bulk_create permission can insert batches
CREATE POLICY batches_admin_insert ON school_account_batches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_administrators
      WHERE user_id = auth.uid()
        AND is_active = TRUE
        AND (permissions->>'can_bulk_create')::boolean = TRUE
    )
  );

-- Policy: Creator can update their own batch
CREATE POLICY batches_creator_update ON school_account_batches
  FOR UPDATE
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Policy: Super admins at the school can update any batch
CREATE POLICY batches_super_admin_update ON school_account_batches
  FOR UPDATE
  USING (
    school_name IN (
      SELECT school_name FROM school_administrators
      WHERE user_id = auth.uid()
        AND admin_role = 'super_admin'
        AND is_active = TRUE
    )
  )
  WITH CHECK (
    school_name IN (
      SELECT school_name FROM school_administrators
      WHERE user_id = auth.uid()
        AND admin_role = 'super_admin'
        AND is_active = TRUE
    )
  );

-- ============================================================================
-- Table 5: compliance_consents RLS Policies
-- ============================================================================

-- Enable RLS on compliance_consents
ALTER TABLE compliance_consents ENABLE ROW LEVEL SECURITY;

-- Policy: Athletes can view their own consents
CREATE POLICY consents_athlete_select ON compliance_consents
  FOR SELECT
  USING (athlete_id = auth.uid());

-- Policy: Users involved in a deal can view consents for that deal
CREATE POLICY consents_deal_participant_select ON compliance_consents
  FOR SELECT
  USING (
    deal_id IN (
      SELECT id FROM nil_deals
      WHERE athlete_id = auth.uid() OR agency_id = auth.uid()
    )
  );

-- Policy: Parents can view consents for their connected athletes
CREATE POLICY consents_parent_select ON compliance_consents
  FOR SELECT
  USING (
    athlete_id = ANY(
      SELECT unnest(connected_athletes::uuid[])
      FROM users
      WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- Policy: School admins can view consents for athletes at their school
CREATE POLICY consents_school_admin_select ON compliance_consents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
    )
  );

-- Policy: Athletes can insert their own consents
CREATE POLICY consents_athlete_insert ON compliance_consents
  FOR INSERT
  WITH CHECK (athlete_id = auth.uid());

-- Policy: Parents can insert consents for their connected athletes
CREATE POLICY consents_parent_insert ON compliance_consents
  FOR INSERT
  WITH CHECK (
    athlete_id = ANY(
      SELECT unnest(connected_athletes::uuid[])
      FROM users
      WHERE id = auth.uid() AND role = 'parent'
    )
    AND consent_type = 'parent_consent'
  );

-- Policy: School admins can insert school approvals
CREATE POLICY consents_school_admin_insert ON compliance_consents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
        AND (sa.permissions->>'can_approve_deals')::boolean = TRUE
    )
    AND consent_type = 'school_approval'
  );

-- Policy: Athletes can update their own consents (to revoke, etc.)
CREATE POLICY consents_athlete_update ON compliance_consents
  FOR UPDATE
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Policy: School admins can update consents for verification
CREATE POLICY consents_school_admin_update ON compliance_consents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
        AND (sa.permissions->>'can_approve_deals')::boolean = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_administrators sa
      JOIN users u ON u.id = athlete_id
      WHERE sa.user_id = auth.uid()
        AND sa.is_active = TRUE
        AND u.school_name = sa.school_name
        AND (sa.permissions->>'can_approve_deals')::boolean = TRUE
    )
  );

-- ============================================================================
-- Verification
-- ============================================================================

-- Count RLS policies created
SELECT 'Migration 021 completed successfully!' as status,
       COUNT(*) || ' RLS policies created across 5 tables' as detail
FROM pg_policies
WHERE tablename IN (
  'nil_deals',
  'agency_athlete_matches',
  'school_administrators',
  'school_account_batches',
  'compliance_consents'
);

-- Verify RLS is enabled on all tables
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'nil_deals',
    'agency_athlete_matches',
    'school_administrators',
    'school_account_batches',
    'compliance_consents'
  )
ORDER BY tablename;
