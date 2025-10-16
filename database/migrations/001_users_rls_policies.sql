-- ================================================
-- RLS Policies for Users Table - Fix 403 Errors
-- ================================================

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role can access all profiles" ON users;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile (for signup)
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Service role can access all profiles (for admin operations)
CREATE POLICY "Service role can access all profiles" ON users
  FOR ALL
  USING (current_setting('role') = 'service_role');

-- ================================================
-- Auto-create User Profile Trigger
-- ================================================

-- Function to create user profile automatically on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (
    id,
    email,
    created_at,
    updated_at,
    onboarding_completed,
    onboarding_completed_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW(),
    false,
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ================================================
-- Additional Indexes for Performance
-- ================================================

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Index on onboarding_completed for faster filtering
CREATE INDEX IF NOT EXISTS users_onboarding_completed_idx ON users(onboarding_completed);

-- Index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- ================================================
-- Comments for Documentation
-- ================================================

COMMENT ON POLICY "Users can view their own profile" ON users IS
'Allows authenticated users to view their own profile data';

COMMENT ON POLICY "Users can insert their own profile" ON users IS
'Allows authenticated users to create their own profile during signup';

COMMENT ON POLICY "Users can update their own profile" ON users IS
'Allows authenticated users to update their own profile data';

COMMENT ON POLICY "Service role can access all profiles" ON users IS
'Allows service role (admin) to access all user profiles for admin operations';

COMMENT ON FUNCTION create_user_profile() IS
'Automatically creates a user profile when a new user signs up via Supabase Auth';

-- ================================================
-- Grant Permissions
-- ================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Grant permissions to service role
GRANT ALL ON users TO service_role;

-- Ensure RLS is enforced for all roles except service_role
ALTER TABLE users FORCE ROW LEVEL SECURITY;