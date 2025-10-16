# 🗄️ Final Step: Run Database Setup

## ✅ Your Credentials Are Now Set!
- Project URL: `https://enbuwffusjhpcyoveewb.supabase.co`
- App is now in **PRODUCTION MODE** (real database)
- Environment configured correctly

## 🎯 Final Step: Create Database Schema

### 1. Go to Your Supabase Dashboard
- Open https://app.supabase.com
- Click on your **ChatNIL** project

### 2. Open SQL Editor
- In the left sidebar, click **"SQL Editor"**
- Click **"New Query"**

### 3. Copy and Paste This SQL
```sql
-- ChatNIL Complete Database Schema Setup
-- Run this in your Supabase SQL Editor to set up the complete database

-- Step 1: Create user role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('athlete', 'parent', 'coach');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create profiles table that references Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  -- Primary key that references auth.users(id)
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core identity fields
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
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for secure access
-- Users can only access their own profile data
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Step 6: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add helpful comments for documentation
COMMENT ON TABLE profiles IS 'User profiles table for ChatNIL application with role-based access, references auth.users';
COMMENT ON COLUMN profiles.id IS 'Primary key that references Supabase auth.users(id) - no random UUIDs';
COMMENT ON COLUMN profiles.role IS 'User role: athlete, parent, or coach - determines onboarding flow and permissions';
COMMENT ON COLUMN profiles.athlete_info IS 'JSON storage for athlete-specific data';
COMMENT ON COLUMN profiles.institution_info IS 'JSON storage for institution/coaching data';
COMMENT ON COLUMN profiles.social_media_handles IS 'JSON storage for social media handles';
COMMENT ON COLUMN profiles.nil_interests IS 'Array of NIL interests and brand preferences';
COMMENT ON COLUMN profiles.nil_concerns IS 'Array of NIL concerns for parents/coaches';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Tracks if user has completed initial onboarding flow';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'ChatNIL database schema setup completed successfully!';
    RAISE NOTICE 'Table created: profiles (properly references auth.users)';
    RAISE NOTICE 'RLS enabled with secure policies';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Automatic timestamp updates configured';
    RAISE NOTICE 'Schema follows Supabase best practices!';
END $$;
```

### 4. Run the Query
- Click the **"Run"** button (▶️)
- Wait for it to complete
- You should see success messages

### 5. Verify Success
- Go to **"Table Editor"** in the sidebar
- You should see a **"profiles"** table
- Click on it to see the structure

## 🎉 After Running This:

1. **Refresh your ChatNIL app** at http://localhost:3000
2. **Check browser console** - should see "🚀 PRODUCTION MODE: Using real Supabase database"
3. **Test signup** - create a test account
4. **Check Supabase Table Editor** - you should see your real user data!

## ✅ You'll Know It's Working When:
- Console shows "PRODUCTION MODE" instead of "MOCK MODE"
- Users you create appear in Supabase Table Editor
- Data persists when you refresh the browser
- Onboarding data saves to the database

---

**Run this SQL in your Supabase dashboard, then test your app!** 🚀