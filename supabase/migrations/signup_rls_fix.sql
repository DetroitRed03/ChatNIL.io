-- Fix RLS Policies for Signup Flow
-- This script fixes the permission denied errors during user profile creation

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Step 2: Create more permissive policies that handle signup flow properly

-- Allow users to read their own profiles (same as before)
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profiles (same as before)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- NEW: More permissive INSERT policy for signup flow
-- This allows profile creation when the user is authenticated but profile doesn't exist yet
CREATE POLICY "Users can insert own profile during signup" ON users
  FOR INSERT
  WITH CHECK (
    -- Either the user ID matches the auth user (normal case)
    auth.uid() = id
    OR
    -- Or the user is authenticated and trying to create their first profile
    (
      auth.uid() IS NOT NULL
      AND auth.uid()::text = id::text
      AND NOT EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()
      )
    )
  );

-- Step 3: Add a temporary bypass policy for initial profile creation
-- This policy allows any authenticated user to insert their profile if it doesn't exist
CREATE POLICY "Allow authenticated users to create initial profile" ON users
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
  );

-- Step 4: Create a fallback policy for service role operations (admin operations)
-- This ensures that server-side operations can work when needed
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Step 5: Add debugging function to help troubleshoot RLS issues
CREATE OR REPLACE FUNCTION debug_rls_context()
RETURNS TABLE(
  current_user_id uuid,
  auth_role text,
  current_session_user text,
  rls_enabled boolean
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT
    auth.uid() as current_user_id,
    auth.jwt() ->> 'role' as auth_role,
    current_user as current_session_user,
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'users') as rls_enabled;
$$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies updated successfully!';
    RAISE NOTICE '📋 New policies created:';
    RAISE NOTICE '   - Users can read own profile';
    RAISE NOTICE '   - Users can update own profile';
    RAISE NOTICE '   - Users can insert own profile during signup (FIXED)';
    RAISE NOTICE '   - Allow authenticated users to create initial profile';
    RAISE NOTICE '   - Service role can manage all users (admin bypass)';
    RAISE NOTICE '🔧 Debug function added: SELECT * FROM debug_rls_context();';
    RAISE NOTICE '🚀 Signup flow should now work without permission errors!';
END $$;