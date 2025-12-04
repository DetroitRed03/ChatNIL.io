# Fix Sarah's Profile Access - IMMEDIATE ACTION REQUIRED

## Problem
Sarah's profile data is in the database but the REST API cannot access it. This is **99% certain to be an RLS (Row Level Security) issue**.

## SOLUTION (Run these in Supabase SQL Editor)

### Step 1: Check if data exists
```sql
SELECT COUNT(*) FROM athlete_profiles WHERE user_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';
```

**Expected**: Should return `1`
- If it returns `0`, the INSERT didn't work and we need to re-run it
- If it returns `1`, proceed to Step 2

### Step 2: Disable RLS temporarily (for testing)
```sql
ALTER TABLE athlete_profiles DISABLE ROW LEVEL SECURITY;
```

Wait 5 seconds, then try to log in as Sarah at `http://localhost:3000`

**Credentials**: sarah.johnson@test.com / TestPassword123!

### Step 3: Verify it works
If Sarah's profile now displays correctly, **RLS was the blocker**.

### Step 4: Create proper RLS policies
Once we confirm RLS was the issue, we need to create proper policies:

```sql
-- Re-enable RLS
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view their own athlete profile"
ON athlete_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own athlete profile"
ON athlete_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own athlete profile"
ON athlete_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow public read access to athlete profiles (for discovery)
CREATE POLICY "Public profiles are viewable by everyone"
ON athlete_profiles FOR SELECT
USING (true);
```

## Alternative: If Step 2 doesn't fix it

If disabling RLS doesn't fix the issue, the problem might be:

1. **PostgREST cache still stale** - Run this in SQL Editor:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   Then wait 30 seconds before testing.

2. **Data actually didn't persist** - Re-run the INSERT:
   ```sql
   INSERT INTO athlete_profiles (
     user_id, username, sport, position, school, year, bio,
     achievements, graduation_year, estimated_fmv,
     profile_completion_score, profile_completion_tier,
     created_at, updated_at
   ) VALUES (
     'ca05429a-0f32-4280-8b71-99dc5baee0dc',
     'sarah-johnson',
     'Basketball',
     'Guard',
     'UCLA',
     'Junior',
     'Point guard with exceptional court vision and defensive skills. Two-time All-Pac-12 selection.',
     ARRAY['All-Pac-12 First Team (2023, 2024)', 'Team Captain', 'Academic All-American', '1,200+ career points'],
     2026,
     75000,
     85,
     'platinum',
     now(),
     now()
   )
   ON CONFLICT (user_id) DO UPDATE SET
     username = EXCLUDED.username,
     sport = EXCLUDED.sport,
     position = EXCLUDED.position,
     school = EXCLUDED.school,
     year = EXCLUDED.year,
     bio = EXCLUDED.bio,
     achievements = EXCLUDED.achievements,
     graduation_year = EXCLUDED.graduation_year,
     estimated_fmv = EXCLUDED.estimated_fmv,
     profile_completion_score = EXCLUDED.profile_completion_score,
     profile_completion_tier = EXCLUDED.profile_completion_tier,
     updated_at = now();
   ```

## Why this is happening

The `exec_sql` RPC function we've been using returns generic success messages without showing actual query results. This made it appear like operations were succeeding when they weren't actually executing properly.

The most reliable way forward is to:
1. Use Supabase SQL Editor directly for all diagnostic queries
2. Disable RLS temporarily to test
3. Once confirmed working, create proper RLS policies
4. Re-enable RLS with the new policies
