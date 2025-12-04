-- ============================================================================
-- Migration 027: Update User Roles (Add School & Business)
-- ============================================================================
-- Adds 'school' and 'business' roles to the users table
-- Maintains backward compatibility with existing athlete, parent, agency roles
-- ============================================================================

-- First, let's see what roles currently exist in the database
-- This migration will add 'agency', 'school', and 'business' to user_role ENUM

-- Step 1: Add new values to existing user_role ENUM (if it exists)
DO $$
BEGIN
  -- Check if user_role type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Add 'agency' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'agency' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
      ALTER TYPE user_role ADD VALUE 'agency';
      RAISE NOTICE 'Added "agency" to user_role ENUM';
    ELSE
      RAISE NOTICE '"agency" already exists in user_role ENUM';
    END IF;

    -- Add 'school' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'school' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
      ALTER TYPE user_role ADD VALUE 'school';
      RAISE NOTICE 'Added "school" to user_role ENUM';
    ELSE
      RAISE NOTICE '"school" already exists in user_role ENUM';
    END IF;

    -- Add 'business' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'business' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
      ALTER TYPE user_role ADD VALUE 'business';
      RAISE NOTICE 'Added "business" to user_role ENUM';
    ELSE
      RAISE NOTICE '"business" already exists in user_role ENUM';
    END IF;
  ELSE
    RAISE NOTICE 'user_role ENUM type does not exist - skipping ENUM update';
  END IF;
END $$;

-- Step 2: Drop existing CHECK constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: ONLY add CHECK constraint if using ENUM type
-- If role column is ENUM type, the type constraint is sufficient
-- If role column is TEXT, add CHECK constraint
DO $$
BEGIN
  -- Check if role column is TEXT type (not ENUM)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'role'
      AND data_type = 'text'
  ) THEN
    -- Role is TEXT, add CHECK constraint
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('athlete', 'parent', 'agency', 'school', 'business'));
    RAISE NOTICE 'Added CHECK constraint for TEXT-based role column';
  ELSE
    RAISE NOTICE 'Role column is ENUM type - no CHECK constraint needed (ENUM provides type safety)';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS (Only add if constraint exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'users'::regclass
    AND conname = 'users_role_check'
  ) THEN
    COMMENT ON CONSTRAINT users_role_check ON users IS 'Allowed user roles: athlete, parent, agency, school (institutions), business (local businesses/brands)';
  ELSE
    RAISE NOTICE 'No CHECK constraint to comment on (ENUM-based roles)';
  END IF;
END $$;

-- ============================================================================
-- Note: This migration handles both ENUM-based and TEXT-based role columns
-- ============================================================================
