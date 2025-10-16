-- Simplified RLS Policies for Users Table
-- This script creates clean, minimal RLS policies that should work reliably

-- Step 1: Clean slate - drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to create initial profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Step 2: Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simplified, reliable policies

-- Policy 1: Allow users to read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow service role to do everything (for API routes)
CREATE POLICY "service_role_all_access" ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Note: No INSERT policy for regular users - all profile creation goes through API

-- Step 4: Create debug view to check RLS status
CREATE OR REPLACE VIEW rls_debug AS
SELECT
  'users' as table_name,
  pg_class.relrowsecurity as rls_enabled,
  count(pg_policy.*) as policy_count
FROM pg_class
LEFT JOIN pg_policy ON pg_policy.polrelid = pg_class.oid
WHERE pg_class.relname = 'users'
GROUP BY pg_class.relname, pg_class.relrowsecurity;

-- Step 5: Grant necessary permissions
GRANT SELECT ON rls_debug TO authenticated;
GRANT SELECT ON rls_debug TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Simplified RLS policies applied successfully!';
    RAISE NOTICE '📋 Active policies:';
    RAISE NOTICE '   1. users_select_own - Users can read their own profile';
    RAISE NOTICE '   2. users_update_own - Users can update their own profile';
    RAISE NOTICE '   3. service_role_all_access - API routes have full access';
    RAISE NOTICE '🔒 Profile creation is now handled via secure API routes only';
    RAISE NOTICE '🔧 Debug with: SELECT * FROM rls_debug;';
    RAISE NOTICE '🚀 This should resolve all permission issues!';
END $$;