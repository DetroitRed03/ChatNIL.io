-- ============================================================================
-- FIX POSTGREST SCHEMA CACHE ISSUE
-- ============================================================================
-- ROOT CAUSE: anon and authenticated roles have NO permissions on tables
-- SOLUTION: Grant necessary permissions so PostgREST can see the schema
-- ============================================================================

-- Step 1: Grant schema access
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Step 2: Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 3: Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON SEQUENCES TO anon, authenticated;

-- Step 4: Grant specific permissions for core tables
-- Users table
GRANT ALL ON public.users TO authenticated;

-- Chat tables (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_sessions') THEN
        GRANT ALL ON public.chat_sessions TO authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages') THEN
        GRANT ALL ON public.chat_messages TO authenticated;
    END IF;
END $$;

-- Step 5: Grant EXECUTE on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 6: Ensure authenticator role can switch
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        GRANT anon TO authenticator;
        GRANT authenticated TO authenticator;
    END IF;
END $$;

-- Step 7: Force schema reload
NOTIFY pgrst, 'reload schema';

-- Step 8: Verification
DO $$
DECLARE
    table_count int;
BEGIN
    SELECT count(*) INTO table_count
    FROM information_schema.table_privileges
    WHERE grantee IN ('anon', 'authenticated')
    AND table_schema = 'public';

    RAISE NOTICE '✅ PostgREST Schema Cache Fix Applied';
    RAISE NOTICE 'Tables visible to PostgREST roles: %', table_count;
    RAISE NOTICE 'Wait 2-3 minutes for cache reload, then test login';
END $$;
