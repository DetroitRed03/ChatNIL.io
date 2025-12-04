# Critical Schema Fixes Needed

**Generated**: 2025-11-27
**Status**: URGENT - Multiple API endpoints are broken due to schema mismatches

## Problem Summary

After the database migration, multiple API endpoints are trying to save data to the wrong tables. The application code assumes all profile data goes into the `users` table, but the actual database schema splits data between `users` and `athlete_profiles` tables.

## Fixed Files

### ✅ `/app/api/profile/route.ts`
**Status**: FIXED
**Solution**: Implemented field mapping to route updates to correct tables

## Files That Need Immediate Fixing

### 🔴 CRITICAL: `/app/api/user/update-profile/route.ts`
**Problem**:
- Lines 88-96: Temporary hack filtering out `achievements` field
- Line 102-107: Tries to update `users` table with ALL fields
- Fields like `bio`, `major`, `gpa`, `primary_sport`, `position`, `achievements`, `nil_interests`, `nil_concerns` don't exist in `users` table

**Expected Behavior**: Should split updates between `users` and `athlete_profiles` like the fixed `/app/api/profile/route.ts`

**Impact**: Profile updates from this endpoint will fail with schema errors

---

### 🔴 CRITICAL: `/app/api/user/update-athlete-profile/route.ts`
**Problem**:
- Lines 59-76: Tries to save these fields to `users` table:
  - `hobbies` - doesn't exist in users table
  - `content_creation_interests` - doesn't exist anywhere (should map to `nil_interests`)
  - `brand_affinity` - doesn't exist (should map to `brand_preferences` in athlete_profiles)
  - `lifestyle_interests` - doesn't exist (should map to `nil_interests`)
  - `causes_care_about` - doesn't exist (should map to `nil_interests`)
  - `social_media_stats` - doesn't exist in users (should use separate `social_media_stats` table)
  - `bio` - exists in `athlete_profiles`, not `users`
  - `profile_video_url` - exists in `athlete_profiles`, not `users`
  - `content_samples` - exists in `athlete_profiles`, not `users`
  - `achievements` - exists in `athlete_profiles`, not `users`

**Expected Behavior**: Should update `athlete_profiles` table, not `users` table

**Impact**: All athlete profile updates from enhanced onboarding will fail

---

### 🟡 HIGH PRIORITY: `/app/api/auth/complete-onboarding/route.ts`
**Problem**:
- Lines 88-187: Maps onboarding data but tries to save everything to `users` table
- Many athlete fields don't exist in `users`:
  - Line 120: `primary_sport` → should be `sport` in `athlete_profiles`
  - Line 124-136: `compliance_settings` - doesn't exist in `users`
  - Line 142: `major` - exists in `athlete_profiles`, not `users`
  - Line 143: `gpa` - exists in `athlete_profiles`, not `users`
  - Line 149-151: `secondary_sports` - exists in `athlete_profiles`, not `users`
  - Line 154-162: `achievements` - exists in `athlete_profiles`, not `users`
  - Line 164: `stats` - exists in `athlete_profiles`, not `users`
  - Line 165-166: `coach_name`, `coach_email` - don't exist in database at all
  - Line 169: `bio` - exists in `athlete_profiles`, not `users`
  - Line 173-175: `nil_interests` - exists in `athlete_profiles`, not `users`
  - Line 178-181: `nil_goals` - exists in `athlete_profiles`, not `users`

**Expected Behavior**: Should create/update both `users` and `athlete_profiles` records

**Impact**: Onboarding completion will fail for athletes, preventing new users from completing signup

---

## The Correct Field Mapping (Reference)

Based on actual database schema from audit:

### Fields that belong in `users` table:
```typescript
{
  // Core user fields
  id, email, role, username, profile_photo,

  // Personal info
  first_name, last_name, date_of_birth, phone, parent_email,

  // School/Organization
  school_id, school_name, company_name, industry,

  // Metadata
  created_at, updated_at, onboarding_completed,
  user_type, full_name, school_created,
  profile_completion_tier, home_completion_required
}
```

### Fields that belong in `athlete_profiles` table:
```typescript
{
  // Identity
  user_id, username, profile_photo_url,

  // Athletic info
  sport, position, school, year, graduation_year,
  height, weight, height_inches, weight_lbs, jersey_number,

  // Academic
  major, gpa,

  // Profile content
  bio, achievements, stats, secondary_sports,

  // NIL related
  nil_interests, nil_concerns, nil_goals, nil_preferences,
  estimated_fmv, brand_preferences, preferred_partnership_types,

  // Media
  profile_video_url, content_samples, cover_photo_url,
  twitch_channel, linkedin_url,

  // Metrics
  profile_completion_score, profile_completion_tier,
  last_profile_update, profile_views,

  // Timestamps
  created_at, updated_at
}
```

### Fields that DON'T exist anywhere (need workarounds):
```typescript
{
  // These should map to existing JSONB columns or be stored in nil_interests/nil_preferences:
  hobbies → nil_interests,
  content_creation_interests → nil_interests,
  brand_affinity → brand_preferences,
  lifestyle_interests → nil_interests,
  causes_care_about → nil_interests,

  // These don't exist and should be removed or added via migration:
  coach_name, coach_email,
  primary_sport → use 'sport' instead
}
```

### Social Media Stats - Separate Table
```typescript
// social_media_stats table structure:
{
  id, user_id,
  instagram_followers, tiktok_followers, twitter_followers, youtube_subscribers,
  total_followers, engagement_rate,
  created_at, updated_at
}
```

## Recommended Fix Strategy

1. **Create a shared utility module** (`lib/profile-field-mapper.ts`) with the field mapping logic
2. **Update each broken API endpoint** to use this shared mapping
3. **For onboarding**, implement two-table insert/update strategy
4. **Add validation** to reject fields that don't exist anywhere

## Next Steps

1. Fix `/app/api/user/update-athlete-profile/route.ts` - MOST CRITICAL (used in onboarding)
2. Fix `/app/api/auth/complete-onboarding/route.ts` - CRITICAL (blocks new user signup)
3. Fix `/app/api/user/update-profile/route.ts` - HIGH (duplicate of already-fixed endpoint)
4. Create shared utility to prevent future issues
5. Audit remaining API endpoints for similar issues
