# Sarah Profile Fix - ROOT CAUSE FOUND!

## Problem

Sarah can login but her profile data doesn't display.

## Root Cause

The `/api/profile` endpoint queries the `users` table:

```typescript
const { data: profile } = await supabaseAdmin
  .from('users')  // ❌ WRONG TABLE
  .select('*')
  .eq('id', userId)
```

But we inserted Sarah's profile data into `athlete_profiles` table!

## Solution Options

### Option 1: Query Both Tables (Recommended)

Modify `/app/api/profile/route.ts` to join `users` and `athlete_profiles`:

```typescript
const { data: profile, error } = await supabaseAdmin
  .from('users')
  .select(`
    *,
    athlete_profile:athlete_profiles!user_id(*)
  `)
  .eq('id', userId)
  .single();
```

This returns both user auth data AND athlete profile data.

### Option 2: Insert Data into Users Table Too

Run this in Supabase SQL Editor to copy Sarah's data to the `users` table:

```sql
UPDATE users
SET
  sport = 'Basketball',
  position = 'Guard',
  school = 'UCLA',
  year = 'Junior',
  bio = 'Point guard with exceptional court vision and defensive skills. Two-time All-Pac-12 selection.',
  achievements = ARRAY['All-Pac-12 First Team (2023, 2024)', 'Team Captain', 'Academic All-American', '1,200+ career points'],
  graduation_year = 2026,
  estimated_fmv = 75000,
  profile_completion_score = 85,
  profile_completion_tier = 'platinum'
WHERE id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';
```

## Recommended Fix

Use **Option 1** (join both tables) because:
1. Keeps data in the correct table (`athlete_profiles`)
2. Maintains data integrity
3. Works for all athletes going forward

## Files to Modify

- `/app/api/profile/route.ts` - Line 29-33 (GET endpoint)
- `/app/api/profile/route.ts` - Line 69-77 (PUT endpoint - also needs to update athlete_profiles)

## Quick Test

After applying the fix, Sarah's profile should load with all her stats immediately.
