-- ============================================================================
-- Migration 017: Remove Coach Role (Fixed Version)
-- ============================================================================
-- Removes the 'coach' role from the system completely
-- This version handles RLS policies correctly during enum migration
-- ============================================================================

-- 1. Check for existing coach users (for reference)
DO $$
DECLARE
  coach_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO coach_count FROM users WHERE role = 'coach';
  RAISE NOTICE 'Found % users with coach role', coach_count;

  IF coach_count > 0 THEN
    RAISE WARNING 'There are % coach users that need to be migrated or removed', coach_count;
  END IF;
END$$;

-- 2. Update any existing coach users to athlete role (if any exist)
UPDATE users SET role = 'athlete' WHERE role = 'coach';

-- 3. Store RLS status and temporarily disable it
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  -- Check if RLS is enabled on users table
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'users';

  IF rls_enabled THEN
    RAISE NOTICE 'Temporarily disabling RLS on users table';
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  END IF;
END$$;

-- 4. Drop all policies on users table (we'll recreate them after)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'users' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    RAISE NOTICE 'Dropped policy: %', pol.policyname;
  END LOOP;
END$$;

-- 5. Remove the coach role from the user_role enum
-- Note: PostgreSQL doesn't support removing values from ENUMs directly
-- We need to create a new enum and migrate

-- Step 1: Convert role column to text temporarily
ALTER TABLE users ALTER COLUMN role TYPE text;

-- Step 2: Drop the old enum
DROP TYPE IF EXISTS user_role CASCADE;

-- Step 3: Create new enum without 'coach'
CREATE TYPE user_role AS ENUM ('athlete', 'parent', 'agency');

-- Step 4: Convert role column back to the new enum
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- 6. Re-enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Recreate essential RLS policies for users table
-- Policy: Users can view their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own record (during signup)
CREATE POLICY users_insert_own ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Athletes can view other athletes for connections
CREATE POLICY users_athletes_view_athletes ON users
  FOR SELECT
  USING (
    role = 'athlete'
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'athlete'
    )
  );

-- Policy: Parents can view their connected athletes
CREATE POLICY users_parents_view_athletes ON users
  FOR SELECT
  USING (
    role = 'athlete'
    AND EXISTS (
      SELECT 1 FROM users p
      WHERE p.id = auth.uid()
      AND p.role = 'parent'
      AND p.metadata->>'connected_athlete_id' = users.id::text
    )
  );

-- Policy: Agencies can view athletes for matching
CREATE POLICY users_agencies_view_athletes ON users
  FOR SELECT
  USING (
    role = 'athlete'
    AND EXISTS (
      SELECT 1 FROM users a
      WHERE a.id = auth.uid()
      AND a.role = 'agency'
    )
  );

-- 8. Verification
DO $$
DECLARE
  has_coach BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Check if coach role still exists in enum
  SELECT 'coach' = ANY(enum_range(NULL::user_role)::text[]) INTO has_coach;

  -- Count policies
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'users';

  IF has_coach THEN
    RAISE EXCEPTION 'Migration failed: coach role still exists in user_role enum';
  ELSE
    RAISE NOTICE 'SUCCESS: coach role removed from user_role enum';
  END IF;

  RAISE NOTICE 'Recreated % RLS policies on users table', policy_count;
  RAISE NOTICE 'Migration 017 completed successfully!';
END$$;

-- Final status message
SELECT
  'Migration 017 completed successfully!' as status,
  'Coach role removed from system' as message,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') as policies_recreated;
