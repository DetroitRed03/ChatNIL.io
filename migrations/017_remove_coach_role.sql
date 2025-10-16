-- ============================================================================
-- Migration 017: Remove Coach Role
-- ============================================================================
-- Removes the 'coach' role from the system completely
-- ============================================================================

-- 1. Check for existing coach users (for reference)
-- This is just a SELECT to see if there are any coaches
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

-- 2. Update any existing coach users to athlete role (optional - comment out if you want to delete them instead)
-- UPDATE users SET role = 'athlete' WHERE role = 'coach';

-- 3. Remove the coach role from the user_role enum
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

-- 4. Verification
SELECT 'Migration 017 completed successfully!' as status;
