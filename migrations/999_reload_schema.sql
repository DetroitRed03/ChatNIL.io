-- Reload schema cache
-- This forces Supabase PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Also verify users table exists
SELECT tablename FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public';
