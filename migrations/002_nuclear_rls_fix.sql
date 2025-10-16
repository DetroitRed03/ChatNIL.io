-- Migration: Nuclear RLS Fix - Disable RLS and Grant All Permissions
-- Created: 2025-09-25T22:30:00.000Z
-- Version: 002

-- WARNING: This migration disables ALL security restrictions for debugging
-- This is the nuclear option to isolate permission issues

-- Step 1: Remove ALL existing RLS policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "service_role_all_access" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to create initial profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Step 2: DISABLE Row Level Security entirely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant EXPLICIT permissions to all roles
GRANT ALL PRIVILEGES ON TABLE users TO service_role;
GRANT ALL PRIVILEGES ON TABLE users TO postgres;
GRANT ALL PRIVILEGES ON TABLE users TO authenticated;
GRANT ALL PRIVILEGES ON TABLE users TO anon;

-- Step 4: Grant sequence permissions if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 5: Create test function for service role access verification
CREATE OR REPLACE FUNCTION test_service_role_access()
RETURNS TABLE(
  test_result text,
  current_role text,
  can_read boolean,
  can_write boolean,
  error_message text
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  test_id uuid;
  read_success boolean := false;
  write_success boolean := false;
  error_msg text := null;
BEGIN
  -- Generate a test UUID
  test_id := gen_random_uuid();

  -- Test READ access
  BEGIN
    PERFORM 1 FROM users LIMIT 1;
    read_success := true;
  EXCEPTION WHEN OTHERS THEN
    read_success := false;
    error_msg := SQLERRM;
  END;

  -- Test WRITE access (insert and delete)
  BEGIN
    INSERT INTO users (id, email, first_name, last_name, role)
    VALUES (test_id, 'test@test.com', 'Test', 'User', 'athlete');
    DELETE FROM users WHERE id = test_id;
    write_success := true;
  EXCEPTION WHEN OTHERS THEN
    write_success := false;
    error_msg := COALESCE(error_msg || ' | ', '') || SQLERRM;
    -- Try to clean up if insert succeeded but delete failed
    BEGIN
      DELETE FROM users WHERE id = test_id;
    EXCEPTION WHEN OTHERS THEN
      null; -- ignore cleanup errors
    END;
  END;

  RETURN QUERY SELECT
    'Service role access test completed' as test_result,
    current_user as current_role,
    read_success as can_read,
    write_success as can_write,
    error_msg as error_message;
END;
$$;

-- Step 6: Grant execute permission on test function
GRANT EXECUTE ON FUNCTION test_service_role_access() TO service_role;
GRANT EXECUTE ON FUNCTION test_service_role_access() TO postgres;
GRANT EXECUTE ON FUNCTION test_service_role_access() TO authenticated;
GRANT EXECUTE ON FUNCTION test_service_role_access() TO anon;

-- Step 7: Create debug view for table permissions
CREATE OR REPLACE VIEW table_permissions_debug AS
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'users'
ORDER BY grantee, privilege_type;

-- Grant access to debug view
GRANT SELECT ON table_permissions_debug TO service_role;
GRANT SELECT ON table_permissions_debug TO postgres;
GRANT SELECT ON table_permissions_debug TO authenticated;
GRANT SELECT ON table_permissions_debug TO anon;