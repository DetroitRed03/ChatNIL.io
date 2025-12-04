# RLS Policies Check

The REST API is still returning 0 profiles even after running `NOTIFY pgrst, 'reload schema';`

This suggests one of three issues:

1. **RLS Policies are blocking access** - The table might have Row Level Security enabled with policies that prevent the service role from reading
2. **The data wasn't actually inserted** - The INSERT might have failed silently
3. **Wrong table name** - We might be querying a different table than where we inserted

## Please run these queries in Supabase SQL Editor:

### 1. Check if data exists:
```sql
SELECT COUNT(*) as total_profiles FROM athlete_profiles;
```

### 2. Check Sarah's specific data:
```sql
SELECT * FROM athlete_profiles
WHERE user_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';
```

### 3. Check RLS status:
```sql
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'athlete_profiles';
```

### 4. If RLS is enabled, check policies:
```sql
SELECT
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'athlete_profiles';
```

### 5. Temporarily disable RLS (for testing):
```sql
ALTER TABLE athlete_profiles DISABLE ROW LEVEL SECURITY;
```

After running query #5, wait 5 seconds and then try accessing Sarah's profile in the browser again.

If that works, we know RLS was the blocker and we need to create proper policies.
