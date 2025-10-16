-- ChatNIL Complete Database Schema Setup
-- Run this in your Supabase SQL Editor to set up the complete database

-- Step 1: Create user role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('athlete', 'parent', 'coach');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create users table with all required fields
CREATE TABLE IF NOT EXISTS users (
  -- Core identity fields
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  first_name varchar(100),
  last_name varchar(100),
  role user_role NOT NULL DEFAULT 'athlete',

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Onboarding tracking
  onboarding_completed boolean DEFAULT false,
  onboarding_completed_at timestamp with time zone,

  -- Personal information
  date_of_birth date,
  phone varchar(20),
  parent_email varchar(255),

  -- Academic/School information
  school_name varchar(255),
  graduation_year integer,
  major varchar(255),
  gpa decimal(3,2),

  -- Athletic information
  primary_sport varchar(100),
  position varchar(100),
  achievements text[],

  -- NIL-specific fields
  nil_interests text[],
  nil_concerns text[],
  social_media_handles jsonb,

  -- Flexible storage for role-specific data
  athlete_info jsonb,
  institution_info jsonb
);

-- Step 3: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for secure access
-- Users can only access their own data
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 6: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add helpful comments for documentation
COMMENT ON TABLE users IS 'Main users table for ChatNIL application with role-based access';
COMMENT ON COLUMN users.id IS 'Primary key that matches Supabase Auth user ID';
COMMENT ON COLUMN users.role IS 'User role: athlete, parent, or coach - determines onboarding flow and permissions';
COMMENT ON COLUMN users.athlete_info IS 'JSON storage for athlete-specific data';
COMMENT ON COLUMN users.institution_info IS 'JSON storage for institution/coaching data';
COMMENT ON COLUMN users.social_media_handles IS 'JSON storage for social media handles';
COMMENT ON COLUMN users.nil_interests IS 'Array of NIL interests and brand preferences';
COMMENT ON COLUMN users.nil_concerns IS 'Array of NIL concerns for parents/coaches';
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks if user has completed initial onboarding flow';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'ChatNIL database schema setup completed successfully!';
    RAISE NOTICE 'Table created: users';
    RAISE NOTICE 'RLS enabled with secure policies';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Automatic timestamp updates configured';
END $$;