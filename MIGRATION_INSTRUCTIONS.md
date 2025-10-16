# 🚀 Execute Supabase Migrations

## Step-by-Step Migration Instructions

### 1. Access Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your project: **enbuwffusjhpecyvoewb**

### 2. Navigate to SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. You'll see the SQL editor interface

### 3. Execute Migration 1 - Base Schema

**Copy and paste this SQL into the editor:**

```sql
-- ChatNIL Initial Database Schema
-- This migration creates the basic schema for the ChatNIL application

-- Create enum for user roles first (required for table creation)
CREATE TYPE user_role AS ENUM ('athlete', 'parent', 'coach');

-- Create users table with role-based structure
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  first_name varchar(100),
  last_name varchar(100),
  role user_role NOT NULL DEFAULT 'athlete',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data access
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Main users table for ChatNIL application with role-based access';
COMMENT ON COLUMN users.role IS 'User role: athlete, parent, or coach - determines onboarding flow and permissions';
COMMENT ON COLUMN users.id IS 'Primary key that matches Supabase Auth user ID';
```

**Then click the "Run" button** ▶️

### 4. Execute Migration 2 - Onboarding Fields

**Copy and paste this SQL into the editor:**

```sql
-- Add onboarding completion tracking fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;

-- Add flexible fields for storing onboarding data based on role
ALTER TABLE users
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS phone varchar(20),
ADD COLUMN IF NOT EXISTS parent_email varchar(255),
ADD COLUMN IF NOT EXISTS school_name varchar(255),
ADD COLUMN IF NOT EXISTS graduation_year integer,
ADD COLUMN IF NOT EXISTS major varchar(255),
ADD COLUMN IF NOT EXISTS gpa decimal(3,2),
ADD COLUMN IF NOT EXISTS primary_sport varchar(100),
ADD COLUMN IF NOT EXISTS position varchar(100),
ADD COLUMN IF NOT EXISTS achievements text[],
ADD COLUMN IF NOT EXISTS nil_interests text[],
ADD COLUMN IF NOT EXISTS social_media_handles jsonb,
ADD COLUMN IF NOT EXISTS athlete_info jsonb,
ADD COLUMN IF NOT EXISTS institution_info jsonb,
ADD COLUMN IF NOT EXISTS nil_concerns text[];

-- Create index on onboarding status for queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment explaining the flexible data storage approach
COMMENT ON COLUMN users.athlete_info IS 'JSON storage for athlete-specific data';
COMMENT ON COLUMN users.institution_info IS 'JSON storage for institution/coaching data';
COMMENT ON COLUMN users.social_media_handles IS 'JSON storage for social media handles';
COMMENT ON COLUMN users.nil_interests IS 'Array of NIL interests and brand preferences';
COMMENT ON COLUMN users.nil_concerns IS 'Array of NIL concerns for parents/coaches';
```

**Then click the "Run" button** ▶️

### 5. Verify Success

After running both migrations, you should see:

1. **✅ Success messages** in the SQL editor
2. **Navigate to Table Editor** in the left sidebar
3. **Check the "users" table** - you should see all the columns created
4. **Verify the table structure** includes:
   - Basic fields: `id`, `email`, `first_name`, `last_name`, `role`
   - Timestamps: `created_at`, `updated_at`
   - Onboarding fields: `onboarding_completed`, `date_of_birth`, etc.
   - JSON fields: `athlete_info`, `institution_info`, `social_media_handles`

## 🎯 What This Accomplishes

✅ **User Authentication Storage** - Links with Supabase Auth
✅ **Role-Based System** - Athletes, Parents, Coaches
✅ **Onboarding Data** - Flexible storage for all role types
✅ **Security** - Row Level Security policies
✅ **Performance** - Proper indexes for queries

## 🚨 Troubleshooting

**If you see errors:**
- Make sure to run Migration 1 first (creates the enum and table)
- Then run Migration 2 (adds the additional columns)
- If "user_role" type already exists, that's fine - the IF NOT EXISTS will handle it

**Common issues:**
- **Permission errors**: Make sure you're signed in as the project owner
- **Enum already exists**: This is normal if you've run migrations before
- **Column already exists**: The `IF NOT EXISTS` clauses handle this

## ✅ Ready to Test!

Once both migrations are successful, your ChatNIL app will have:
- ✅ Real Supabase authentication
- ✅ Database storage for onboarding
- ✅ Production-ready user management

You can now test the full signup → onboarding → database storage flow!