# 🚀 Moving from Mock to Real Supabase Database

## Current Status: Mock Mode ❌

Your app is currently using **fake, in-memory data** that:
- Disappears when you refresh the browser
- Has no real database behind it
- Is NOT production ready

## Issue Identified: Supabase Project Unreachable

The Supabase URL `enbuwffusjhpecyvoewb.supabase.co` cannot be reached, which means:
- Project may not exist or has been deleted
- Project might be paused
- Credentials might be incorrect

## 🛠️ Solution Options

### Option 1: Verify Existing Project (Recommended First)

1. **Check Supabase Dashboard**:
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign in to your account
   - Look for project `enbuwffusjhpecyvoewb`

2. **If Project Exists**:
   - Check if it's paused (and unpause it)
   - Verify the URL in Settings → API
   - Copy the correct URL and API keys

3. **Update Credentials**:
   - Replace values in `.env.local` with correct ones
   - Test connectivity

### Option 2: Create New Supabase Project

If the project doesn't exist or can't be recovered:

1. **Create New Project**:
   ```
   - Go to https://app.supabase.com
   - Click "New Project"
   - Name: "ChatNIL"
   - Choose region (US East recommended)
   - Wait for project creation
   ```

2. **Get New Credentials**:
   ```
   - Go to Settings → API
   - Copy Project URL
   - Copy anon/public key
   - Copy service_role/secret key
   ```

3. **Update Environment Variables**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://[your-new-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-new-anon-key]
   SUPABASE_URL=https://[your-new-project].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=[your-new-service-key]
   ```

## 📋 Database Schema Setup

Once you have a working Supabase project, run these SQL commands:

### 1. Basic Schema Migration
```sql
-- Create user role enum
CREATE TYPE user_role AS ENUM ('athlete', 'parent', 'coach');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  first_name varchar(100),
  last_name varchar(100),
  role user_role NOT NULL DEFAULT 'athlete',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Onboarding Fields Migration
```sql
-- Add onboarding fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

## 🔄 Switch to Real Database Mode

After setting up the database:

1. **Change Environment Variable**:
   ```bash
   # In .env.local, change this line:
   NEXT_PUBLIC_DEV_MODE=real
   ```

2. **Restart Development Server**:
   ```bash
   # Kill current server and restart
   npm run dev
   ```

3. **Look for Console Message**:
   ```
   🚀 Using real Supabase client  # ← Should see this instead of mock
   ```

## ✅ Testing Real Database

Once switched to real mode:

1. **Test Signup**:
   - Go to http://localhost:3000
   - Sign up with athlete role
   - Check browser console for real database logs
   - Verify no more "mock" messages

2. **Check Supabase Dashboard**:
   - Go to Table Editor in Supabase
   - Look for `users` table
   - Confirm new user record appears

3. **Test Data Persistence**:
   - Refresh browser - user should stay logged in
   - Restart dev server - data should persist
   - Complete onboarding - data should save

## 🚨 Important Notes

- **Data Loss**: Mock data will disappear when you switch modes
- **Schema Required**: Database must be set up before switching
- **Credentials**: Must be valid and accessible
- **Testing**: Test thoroughly before production deployment

## 🔧 Quick Switch Commands

**To use mock mode** (current):
```bash
NEXT_PUBLIC_DEV_MODE=mock
```

**To use real database**:
```bash
NEXT_PUBLIC_DEV_MODE=real
```

---

**Next Step**: Choose Option 1 or 2 above to get a working Supabase project, then follow the setup instructions!