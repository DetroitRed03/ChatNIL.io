-- Run this query directly in Supabase SQL Editor to verify migrations

-- 1. Check tables
SELECT 'TABLES CHECK' as check_type;
SELECT
  t.tablename,
  t.rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN (
    'nil_deals',
    'agency_athlete_matches',
    'school_administrators',
    'school_account_batches',
    'compliance_consents'
  )
ORDER BY tablename;

-- 2. Check user columns
SELECT 'USER COLUMNS CHECK' as check_type;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('company_name', 'hobbies', 'social_media_stats', 'nil_preferences')
ORDER BY column_name;

-- 3. Check user_role enum
SELECT 'USER ROLE ENUM CHECK' as check_type;
SELECT e.enumlabel as role
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- 4. Check RLS policies count
SELECT 'RLS POLICIES CHECK' as check_type;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
  'nil_deals',
  'agency_athlete_matches',
  'school_administrators',
  'school_account_batches',
  'compliance_consents'
)
GROUP BY tablename
ORDER BY tablename;
