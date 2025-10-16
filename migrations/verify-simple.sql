-- ============================================================================
-- Simple Migration Verification Query
-- ============================================================================
-- Verifies that all migrations (015-021) have been successfully applied
-- ============================================================================

-- Check 1: Verify all required tables exist
SELECT
  'Tables Check' as check_name,
  COUNT(*) as actual_count,
  5 as expected_count,
  CASE WHEN COUNT(*) = 5 THEN true ELSE false END as passed
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents');

-- Check 2: Verify user table has all required columns
SELECT
  'User Columns Check' as check_name,
  COUNT(*) as actual_count,
  4 as expected_count,
  CASE WHEN COUNT(*) >= 4 THEN true ELSE false END as passed
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('company_name', 'hobbies', 'social_media_stats', 'nil_preferences');

-- Check 3: Verify indexes are created
SELECT
  'Indexes Check' as check_name,
  COUNT(*) as actual_count,
  12 as expected_count,
  CASE WHEN COUNT(*) >= 12 THEN true ELSE false END as passed
FROM pg_indexes
WHERE tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents');

-- Check 4: Verify RLS is enabled
SELECT
  'RLS Enabled Check' as check_name,
  COUNT(*) as actual_count,
  5 as expected_count,
  CASE WHEN COUNT(*) = 5 THEN true ELSE false END as passed
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')
  AND rowsecurity = true;

-- Check 5: Verify coach role is removed from user_role enum
SELECT
  'Coach Role Removed Check' as check_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'coach'
    ) THEN 0
    ELSE 1
  END as actual_count,
  1 as expected_count,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'coach'
    ) THEN false
    ELSE true
  END as passed;

-- Check 6: Verify agency role exists in user_role enum
SELECT
  'Agency Role Check' as check_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'agency'
    ) THEN 1
    ELSE 0
  END as actual_count,
  1 as expected_count,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'agency'
    ) THEN true
    ELSE false
  END as passed;

-- ============================================================================
-- Detailed Table Information
-- ============================================================================

SELECT
  '--- DETAILED TABLE INFO ---' as section,
  null as table_name,
  null::bigint as row_count,
  null::bigint as index_count,
  null as rls_status;

-- Show all created tables with row counts
SELECT
  'Table Info' as section,
  t.tablename as table_name,
  (SELECT COUNT(*) FROM pg_class c WHERE c.relname = t.tablename AND c.relkind = 'r') as row_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count,
  CASE WHEN t.rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')
ORDER BY tablename;

-- ============================================================================
-- User Role Enum Values
-- ============================================================================

SELECT
  '--- USER ROLES ---' as section,
  null as role;

SELECT
  'User Roles' as section,
  e.enumlabel as role
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;
