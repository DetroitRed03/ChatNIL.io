-- ============================================================================
-- Migration Verification Query
-- ============================================================================
-- Verifies that all migrations (015-021) have been successfully applied
-- Run this in Supabase SQL Editor after applying migrations
-- ============================================================================

-- Check 1: Verify all required tables exist
SELECT
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 5 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 5 tables'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')

UNION ALL

-- Check 2: Verify user table has all required columns
SELECT
  'User Columns Check',
  COUNT(*),
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ PASS'
    ELSE '❌ FAIL - Missing columns'
  END
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('company_name', 'hobbies', 'social_media_stats', 'nil_preferences')

UNION ALL

-- Check 3: Verify indexes are created
SELECT
  'Indexes Check',
  COUNT(*),
  CASE
    WHEN COUNT(*) >= 12 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 12+ indexes'
  END
FROM pg_indexes
WHERE tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')

UNION ALL

-- Check 4: Verify RLS is enabled
SELECT
  'RLS Enabled Check',
  COUNT(*),
  CASE
    WHEN COUNT(*) = 5 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 5 tables with RLS'
  END
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')
  AND rowsecurity = true

UNION ALL

-- Check 5: Verify coach role is removed from user_role enum
SELECT
  'Coach Role Removed Check',
  CASE
    WHEN 'coach' = ANY(enum_range(NULL::user_role)::text[]) THEN 0
    ELSE 1
  END,
  CASE
    WHEN 'coach' = ANY(enum_range(NULL::user_role)::text[]) THEN '❌ FAIL - Coach role still exists'
    ELSE '✅ PASS'
  END

UNION ALL

-- Check 6: Verify agency role exists in user_role enum
SELECT
  'Agency Role Check',
  CASE
    WHEN 'agency' = ANY(enum_range(NULL::user_role)::text[]) THEN 1
    ELSE 0
  END,
  CASE
    WHEN 'agency' = ANY(enum_range(NULL::user_role)::text[]) THEN '✅ PASS'
    ELSE '❌ FAIL - Agency role missing'
  END;

-- ============================================================================
-- Detailed Table Information
-- ============================================================================

SELECT
  '========== DETAILED TABLE INFO ==========' as section;

-- Show all created tables with row counts
SELECT
  tablename,
  'Table Created' as status,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count,
  CASE WHEN rowsecurity THEN 'RLS Enabled' ELSE 'No RLS' END as rls_status
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')
ORDER BY tablename;

-- ============================================================================
-- Index Details
-- ============================================================================

SELECT
  '========== INDEX DETAILS ==========' as section;

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')
ORDER BY tablename, indexname;

-- ============================================================================
-- RLS Policy Details
-- ============================================================================

SELECT
  '========== RLS POLICY DETAILS ==========' as section;

SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE WHEN permissive THEN 'Permissive' ELSE 'Restrictive' END as policy_type
FROM pg_policies
WHERE tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')
ORDER BY tablename, policyname;

-- ============================================================================
-- User Role Enum Values
-- ============================================================================

SELECT
  '========== USER ROLES ==========' as section;

SELECT
  unnest(enum_range(NULL::user_role))::text as role
ORDER BY role;

-- ============================================================================
-- Expected Results Summary
-- ============================================================================

SELECT
  '========== EXPECTED RESULTS ==========' as section;

SELECT 'Tables: 5' as expected UNION ALL
SELECT 'User Columns: 4+' UNION ALL
SELECT 'Indexes: 12+' UNION ALL
SELECT 'RLS Enabled: 5' UNION ALL
SELECT 'Coach Role: Removed' UNION ALL
SELECT 'Agency Role: Present';
