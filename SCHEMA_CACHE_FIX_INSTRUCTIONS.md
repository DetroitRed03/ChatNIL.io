# 🔧 Schema Cache Fix - Manual Steps Required

## Problem

Sarah's profile data was inserted via SQL, but Supabase's PostgREST API cache hasn't refreshed. The REST API returns 0 profiles even though we ran the INSERT successfully.

## Solution: Manual Schema Reload

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql
2. Click "New query"

### Step 2: Reload Schema Cache

Paste and run this SQL:

```sql
NOTIFY pgrst, 'reload schema';
```

### Step 3: Verify Data Exists

After running the NOTIFY command, paste and run this to verify Sarah's data:

```sql
SELECT
  display_name,
  sport,
  school,
  instagram_handle,
  instagram_followers,
  tiktok_handle,
  tiktok_followers,
  twitter_handle,
  twitter_followers,
  total_followers,
  estimated_fmv,
  profile_completion_score,
  profile_completion_tier
FROM athlete_public_profiles
WHERE user_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';
```

### Step 4: If No Data Found

If Step 3 returns no results, the INSERT didn't work. Run this to create Sarah's profile:

```sql
INSERT INTO athlete_public_profiles (
  user_id,
  display_name,
  sport,
  school,
  graduation_year,
  bio,
  is_available_for_partnerships,
  instagram_handle,
  instagram_followers,
  instagram_engagement_rate,
  tiktok_handle,
  tiktok_followers,
  tiktok_engagement_rate,
  twitter_handle,
  twitter_followers,
  total_followers,
  avg_engagement_rate,
  content_categories,
  achievements,
  estimated_fmv,
  profile_completion_score,
  profile_completion_tier,
  created_at,
  updated_at
) VALUES (
  'ca05429a-0f32-4280-8b71-99dc5baee0dc',
  'Sarah Johnson',
  'Basketball',
  'UCLA',
  2026,
  'Point guard with exceptional court vision and defensive skills. Two-time All-Pac-12 selection.',
  true,
  '@sarahjbasketball',
  45000,
  4.8,
  '@sarahjhoops',
  82000,
  6.2,
  '@SJohnson_UCLA',
  15000,
  142000,
  5.5,
  '["Sports", "Fitness", "Lifestyle", "Fashion"]'::jsonb,
  ARRAY['All-Pac-12 First Team (2023, 2024)', 'Team Captain', 'Academic All-American', '1,200+ career points'],
  75000,
  85,
  'platinum',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  sport = EXCLUDED.sport,
  school = EXCLUDED.school,
  updated_at = now();
```

Then run Step 2 (NOTIFY) and Step 3 (SELECT) again.

### Step 5: Test Login

Once Step 3 shows Sarah's data:

1. Go to: http://localhost:3000
2. Click "Sign In"
3. Enter:
   - Email: `sarah.johnson@test.com`
   - Password: `TestPassword123!`
4. Verify all stats are visible in the profile

## Why This Happened

- Supabase's PostgREST API caches the database schema for performance
- When we added new columns via migration #200, the cache didn't automatically refresh
- The `exec_sql` RPC function can't trigger NOTIFY commands properly
- Manual refresh via SQL Editor is required

## Timeline

This should take 2-3 minutes to complete manually in Supabase Dashboard.
