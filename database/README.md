# Database Migrations

This directory contains SQL migration files for the ChatNIL database.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of each migration file
4. Run the SQL queries in order (001, 002, etc.)

### Option 2: Supabase CLI
```bash
# Apply a specific migration
supabase db reset --db-url "your-db-url"
```

## Migration Files

### 001_users_rls_policies.sql
**Purpose**: Fix 403 errors when accessing user profiles
**What it does**:
- Creates proper RLS (Row Level Security) policies for the `users` table
- Allows authenticated users to view/edit their own profiles
- Adds service role access for admin operations
- Creates auto-profile creation trigger on signup
- Adds performance indexes

**Why this is needed**:
Users were getting 403 errors when trying to access their profiles because the `users` table didn't have proper RLS policies configured.

## Verification

After applying the migrations, verify they work:

1. **Check RLS Policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

2. **Test User Profile Access**:
   - Sign up a new user
   - Verify profile is auto-created
   - Verify user can read/update their own profile

3. **Check for 403 Errors**:
   - Go to onboarding flow
   - Check browser console for 403 errors
   - Should be resolved after migration

## Troubleshooting

If you still see 403 errors after applying migrations:

1. **Check if RLS is enabled**:
   ```sql
   SELECT relname, relrowsecurity
   FROM pg_class
   WHERE relname = 'users';
   ```

2. **Verify policies exist**:
   ```sql
   \d+ users
   ```

3. **Check user authentication**:
   - Ensure user is properly logged in
   - Check JWT token is valid
   - Verify auth.uid() returns the correct user ID