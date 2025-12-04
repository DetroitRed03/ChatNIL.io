-- ============================================================================
-- DIAGNOSTIC: Check current user_role setup before running migration 027
-- ============================================================================
-- Run this FIRST to understand your current database state
-- Then run migration 027
-- ============================================================================

-- 1. Check if user_role ENUM type exists
SELECT
  'ENUM Type Exists: ' || CASE
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role')
    THEN 'YES'
    ELSE 'NO'
  END as enum_check;

-- 2. If ENUM exists, show all current values
SELECT
  'Current ENUM Values:' as info,
  enumlabel as role_value,
  enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- 3. Check the data type of the role column
SELECT
  'Role Column Type:' as info,
  column_name,
  data_type,
  udt_name,
  CASE
    WHEN udt_name = 'user_role' THEN 'ENUM (user_role)'
    WHEN data_type = 'text' THEN 'TEXT'
    WHEN data_type = 'character varying' THEN 'VARCHAR'
    ELSE data_type
  END as actual_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'role';

-- 4. Show all distinct role values currently in the users table
SELECT
  'Actual role values in users table:' as info,
  role,
  COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;

-- 5. Check for existing CHECK constraints on role column
SELECT
  'Existing CHECK constraints:' as info,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================
--
-- SCENARIO A: user_role ENUM exists with only 'athlete' and 'parent'
--   - Migration will ADD 'agency', 'school', 'business' to ENUM
--   - No CHECK constraint needed (ENUM provides type safety)
--
-- SCENARIO B: role column is TEXT with CHECK constraint
--   - Migration will update CHECK constraint to include all 5 roles
--
-- SCENARIO C: role column has values NOT in ('athlete', 'parent', 'agency', 'school', 'business')
--   - Migration will FAIL - you need to clean up invalid roles first
--   - Run: UPDATE users SET role = 'athlete' WHERE role NOT IN ('athlete', 'parent', 'agency', 'school', 'business');
--
-- ============================================================================
