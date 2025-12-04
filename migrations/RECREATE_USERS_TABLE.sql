-- ============================================================================
-- RECREATE USERS TABLE FOR POSTGREST VISIBILITY
-- ============================================================================
-- Drop and recreate the users table to ensure PostgREST can see it
-- This preserves all data
-- ============================================================================

BEGIN;

-- Step 1: Create backup of users table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        DROP TABLE IF EXISTS users_backup CASCADE;
        CREATE TABLE users_backup AS SELECT * FROM users;
        RAISE NOTICE 'Backed up % rows from users table', (SELECT COUNT(*) FROM users_backup);
    END IF;
END $$;

-- Step 2: Drop existing users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 3: Recreate users table with exact schema
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    user_type text,
    full_name text,
    profile_photo text,
    username text UNIQUE,
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    role text,
    company_name text,
    industry text,
    school_id uuid,
    school_name text,
    school_created boolean DEFAULT false,
    profile_completion_tier text,
    home_completion_required boolean DEFAULT false
);

-- Step 4: Restore data from backup
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_backup') THEN
        INSERT INTO public.users SELECT * FROM users_backup;
        RAISE NOTICE 'Restored % rows to users table', (SELECT COUNT(*) FROM users);
        DROP TABLE users_backup;
    END IF;
END $$;

-- Step 5: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access" ON public.users;
CREATE POLICY "Service role full access"
ON public.users FOR ALL
USING (auth.role() = 'service_role');

-- Step 7: Grant permissions
GRANT SELECT ON public.users TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Step 9: Force PostgREST reload
NOTIFY pgrst, 'reload schema';

-- Step 10: Verify
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users;
    RAISE NOTICE '✅ Users table recreated with % rows', user_count;
    RAISE NOTICE 'Table should now be visible to PostgREST';
END $$;

COMMIT;
