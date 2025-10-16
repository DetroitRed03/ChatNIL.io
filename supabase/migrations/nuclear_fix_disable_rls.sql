-- Nuclear Option: Disable RLS and Grant All Permissions
-- This script removes ALL security restrictions to isolate the root cause
-- WARNING: This is for debugging only - re-enable security after testing

-- Step 1: Remove ALL existing policies (clean slate)
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "service_role_all_access" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to create initial profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Step 2: DISABLE RLS entirely (nuclear option)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant EXPLICIT permissions to service role
GRANT ALL PRIVILEGES ON TABLE users TO service_role;
GRANT ALL PRIVILEGES ON TABLE users TO postgres;
GRANT ALL PRIVILEGES ON TABLE users TO authenticated;
GRANT ALL PRIVILEGES ON TABLE users TO anon;

-- Step 4: Grant sequence permissions (for auto-incrementing fields)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 5: Create a simple test function to verify service role access
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

-- Step 7: Create debug view for table permissions
CREATE OR REPLACE VIEW table_permissions_debug AS
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'users'
ORDER BY grantee, privilege_type;

GRANT SELECT ON table_permissions_debug TO service_role;
GRANT SELECT ON table_permissions_debug TO postgres;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🚨 NUCLEAR OPTION APPLIED - ALL SECURITY DISABLED!';
    RAISE NOTICE '⚠️  RLS is now COMPLETELY DISABLED on users table';
    RAISE NOTICE '🔓 ALL roles have FULL access to users table';
    RAISE NOTICE '🧪 Test with: SELECT * FROM test_service_role_access();';
    RAISE NOTICE '📊 Check permissions: SELECT * FROM table_permissions_debug;';
    RAISE NOTICE '⚡ This should work - if not, it is a service role key issue!';
    RAISE NOTICE '🔒 IMPORTANT: Re-enable security after testing!';
END $$;