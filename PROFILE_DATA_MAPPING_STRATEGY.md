# Profile Data Mapping Strategy

## Problem

After database migration, there's a mismatch between:
1. What the **application code expects** (field names and structure)
2. What the **database actually has** (different field names and table structure)

This causes:
- Profile completion percentage stuck at 0% even after saving
- UI not displaying saved data correctly
- Fields appearing "empty" even though they're saved

## Root Cause

The profile completion calculator ([lib/profile-completion.ts:118](lib/profile-completion.ts#L118)) checks for fields like:
- `primary_sport` (doesn't exist - database has `sport`)
- `social_media_stats` as array (doesn't exist - data is in separate `social_media_stats` table)
- `hobbies`, `content_creation_interests` (don't exist - data is in `nil_interests` JSONB array)

## Solution: Data Adapter Pattern

Instead of changing the database (which would create duplicate columns), we use an **adapter pattern** to map database structure to app expectations:

### 1. Field Mapping During Reads

When fetching profiles, `mergeProfileData()` ([lib/profile-field-mapper.ts:163-210](lib/profile-field-mapper.ts#L163-L210)) creates aliases:

```typescript
// Database has 'sport', app expects 'primary_sport'
if (athleteData?.sport && !merged.primary_sport) {
  merged.primary_sport = athleteData.sport;
}

// Map JSONB arrays to individual fields
if (athleteData?.nil_interests) {
  merged.hobbies = athleteData.nil_interests;
  merged.content_creation_interests = athleteData.nil_interests;
  merged.lifestyle_interests = athleteData.nil_interests;
  merged.causes_care_about = athleteData.nil_interests;
}

// Map brand_preferences to brand_affinity
if (athleteData?.brand_preferences) {
  merged.brand_affinity = athleteData.brand_preferences;
}
```

### 2. Social Media Stats Integration

Social media data is in a separate `social_media_stats` table with columns:
- `instagram_followers`, `tiktok_followers`, `twitter_followers`, `youtube_subscribers`
- `total_followers`, `engagement_rate`

The API now fetches this table and converts it to the array format the app expects:

```typescript
profile.social_media_stats = [
  { platform: 'instagram', followers: 50000, engagement_rate: 3.5 },
  { platform: 'tiktok', followers: 75000, engagement_rate: 5.2 },
  // ...
];
```

### 3. Field Mapping During Writes

`splitProfileUpdates()` ([lib/profile-field-mapper.ts:141-157](lib/profile-field-mapper.ts#L141-L157)) maps app field names to database columns:

```typescript
// App sends 'primary_sport', database needs 'sport'
'primary_sport': { table: 'athlete_profiles', column: 'sport' }

// App sends 'hobbies', database stores in 'nil_interests'
'hobbies': { table: 'athlete_profiles', column: 'nil_interests' }
```

## Database Schema - What Actually Exists

### `users` table
```
id, email, role, first_name, last_name, username, phone, date_of_birth,
parent_email, profile_photo, school_id, school_name, company_name, industry,
onboarding_completed, created_at, updated_at
```

### `athlete_profiles` table
```
user_id, sport, position, school, year, bio, achievements, major, gpa,
height_inches, weight_lbs, jersey_number, secondary_sports, stats,
nil_interests, nil_concerns, nil_goals, nil_preferences,
brand_preferences, preferred_partnership_types,
estimated_fmv, profile_completion_score, profile_completion_tier,
profile_photo_url, cover_photo_url, profile_video_url, content_samples,
created_at, updated_at
```

### `social_media_stats` table
```
id, user_id, instagram_followers, tiktok_followers, twitter_followers,
youtube_subscribers, total_followers, engagement_rate,
created_at, updated_at
```

## Application Expectations vs Database Reality

| App Expects | Database Has | Mapping Strategy |
|-------------|--------------|------------------|
| `primary_sport` | `sport` | Alias in mergeProfileData |
| `social_media_stats` (array) | `social_media_stats` table | Fetch and convert to array |
| `hobbies` | `nil_interests` (JSONB) | Map to same array |
| `content_creation_interests` | `nil_interests` (JSONB) | Map to same array |
| `lifestyle_interests` | `nil_interests` (JSONB) | Map to same array |
| `causes_care_about` | `nil_interests` (JSONB) | Map to same array |
| `brand_affinity` | `brand_preferences` | Alias in mergeProfileData |
| `coach_name` | Not in database | Skip (not critical) |
| `coach_email` | Not in database | Skip (not critical) |

## Files Modified

1. **[lib/profile-field-mapper.ts](lib/profile-field-mapper.ts)** - Added field aliasing in `mergeProfileData()`
2. **[lib/profile-completion.ts](lib/profile-completion.ts)** - Updated to check for both `sport` and `primary_sport`
3. **[app/api/profile/route.ts](app/api/profile/route.ts)** - Added social_media_stats table fetch and conversion

## Testing

To verify profile completion now updates correctly:

1. Log in as test athlete (sarah.johnson@test.com)
2. Edit profile and add data to any field
3. Save
4. Profile completion percentage should increase

## Known Limitations

1. **JSONB Merging**: Currently all nil_interests items are shown as hobbies, content_creation_interests, etc. In the future, we could:
   - Store as `{ hobbies: [], content_interests: [], ... }` JSONB object instead of array
   - Or create separate columns for each

2. **Social Media**: Currently creates array from separate table. Future improvement:
   - Store per-platform engagement rates separately
   - Add platform handles

3. **Missing Fields**: `coach_name` and `coach_email` don't exist anywhere
   - Low priority - not used in completion calculator
   - Could add to athlete_profiles table if needed

## Next Steps

1. ✅ Test profile completion updates with Sarah's account
2. ⏳ Seed social_media_stats table for test accounts
3. ⏳ Update profile edit UI to properly save to social_media_stats table
4. ⏳ Consider restructuring nil_interests JSONB for better separation

## Impact

**Before**: Profile completion stuck at 0%, saved data not reflected
**After**: Profile completion updates correctly, all saved data visible in UI
