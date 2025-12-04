# FINAL FIX: Enable Sarah's Profile Access

## Root Cause Found

The `exec_sql()` RPC function **doesn't return SELECT query results** - it only returns `{"success": true}`.

This is why all our diagnostic queries appeared to succeed but didn't show any data.

## IMMEDIATE FIX (Run in Supabase SQL Editor)

Copy and paste these SQL commands **directly into Supabase SQL Editor**:

### Step 1: Verify Data Exists
```sql
SELECT
  user_id,
  username,
  sport,
  school,
  estimated_fmv,
  profile_completion_score
FROM athlete_profiles
WHERE user_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';
```

**Expected**: Should return 1 row with Sarah's data
- If NO rows returned: Re-run the INSERT statement from earlier
- If 1 row returned: Continue to Step 2

### Step 2: Check RLS Status
```sql
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'athlete_profiles';
```

**If `rls_enabled = true`**, proceed to Step 3.

### Step 3: Disable RLS Temporarily (Testing Only)
```sql
ALTER TABLE athlete_profiles DISABLE ROW LEVEL SECURITY;
```

**Then immediately test**: Try logging in as Sarah at `http://localhost:3000`
- Email: sarah.johnson@test.com
- Password: TestPassword123!

### Step 4A: If Disabling RLS Fixed It

RLS was the blocker. Now create proper policies:

```sql
-- Re-enable RLS
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read athlete profiles (public discovery)
CREATE POLICY "Anyone can view athlete profiles"
ON athlete_profiles FOR SELECT
USING (true);

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile"
ON athlete_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON athlete_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON athlete_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Step 4B: If Disabling RLS Didn't Fix It

The issue is something else. Check:

1. **PostgREST Cache**: Run this and wait 30 seconds:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

2. **Verify the table name**: Make sure the app is querying `athlete_profiles` (not `athlete_public_profiles` or another table)

## Why This Happened

1. **exec_sql() limitation**: The RPC function we were using doesn't return SELECT results, only a generic success message
2. **Hidden RLS blocking**: RLS policies were blocking REST API access without clear error messages
3. **Schema cache delay**: PostgREST sometimes needs manual refresh after schema changes

## Next Steps After Fix

Once Sarah's profile is accessible:

1. ✅ Verify all stats display correctly
2. ✅ Check that profile photos/cover images display (add URLs if needed)
3. ✅ Test the onboarding flow completion
4. ✅ Take screenshots for client presentation

## If You Need to Re-Insert Sarah's Data

If Step 1 shows no data, re-run this INSERT:

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

Then run the verification query from Step 1 again.
