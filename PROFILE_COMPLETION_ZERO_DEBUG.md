# Profile Completion Shows 0% - Debug Report

## Issue

User reports: **"the social media stats are seated correctly however, the percentage completion is zero"**

## Investigation Results

### Backend Diagnostic (✅ WORKING)

Running `npx tsx scripts/diagnose-profile-completion.ts` shows:

```
✅ Name: +5 points
✅ Email: +5 points
✅ Phone: +5 points
✅ Bio (94 chars): +5 points
✅ School Name: +5 points
✅ Graduation Year: +5 points
✅ Major/GPA: +5 points
✅ Sport: +7 points
✅ Position: +7 points
✅ Achievements (4 items): +6 points
✅ Social Media (4 platforms): +25 points
✅ NIL Interests (4 items): +5 points
✅ NIL Concerns (2 items): +5 points
❌ Content Samples: 0 points (missing or empty)

TOTAL SCORE: 90/100 (90%)
```

**Backend calculation is CORRECT: 90%**

### API Endpoint Test (✅ WORKING)

```bash
curl "http://localhost:3000/api/profile?userId=ca05429a-0f32-4280-8b71-99dc5baee0dc"
```

Returns correctly formatted data:

```json
{
  "profile": {
    "social_media_stats": {
      "instagram": { "followers": 50000, "engagement_rate": 4.2 },
      "tiktok": { "followers": 75000, "engagement_rate": 4.2 },
      "twitter": { "followers": 12000, "engagement_rate": 4.2 },
      "youtube": { "subscribers": 8500 }
    },
    "sport": "Basketball",
    "primary_sport": "Basketball",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@test.com",
    "phone": "+1 (555) 123-4567",
    ...
  }
}
```

**API is returning correct data with object-format social_media_stats**

### Profile Completion Calculator (✅ UPDATED)

The calculator in [lib/profile-completion.ts:156-176](lib/profile-completion.ts#L156-L176) has been updated to handle both array and object formats:

```typescript
let socialMediaCount = 0;

if (user.social_media_stats) {
  if (Array.isArray(user.social_media_stats)) {
    // Legacy array format
    socialMediaCount = user.social_media_stats.length;
  } else if (typeof user.social_media_stats === 'object') {
    // Current object format - count platforms that have data
    const platforms = ['instagram', 'tiktok', 'twitter', 'youtube'];
    socialMediaCount = platforms.filter(platform => {
      const platformData = user.social_media_stats[platform];
      return platformData && (platformData.followers > 0 || platformData.subscribers > 0);
    }).length;
  }
}
```

**Calculator logic is CORRECT**

## Hypothesis: Frontend Data Flow Issue

Given that:
1. ✅ Backend calculates 90%
2. ✅ API returns correct data
3. ✅ Calculator handles object format
4. ❌ Frontend shows 0%

**The issue must be in how the profile page loads or processes the data.**

## Debugging Steps Added

### 1. Added Logging to Profile Page

In [app/profile/page.tsx:187-200](app/profile/page.tsx#L187-L200):

```typescript
console.log('🔍 Profile data being passed to calculator:', {
  has_social_media_stats: !!data.social_media_stats,
  social_media_stats_type: Array.isArray(data.social_media_stats) ? 'array' : typeof data.social_media_stats,
  social_media_stats_keys: data.social_media_stats ? Object.keys(data.social_media_stats) : 'none',
  social_media_stats_value: data.social_media_stats,
  sport: data.sport || data.primary_sport,
  first_name: data.first_name,
  last_name: data.last_name,
  phone: data.phone,
});
const completion = calculateProfileCompletion(data);
console.log('✅ Completion result:', completion);
```

### 2. Added Logging to Calculator

In [lib/profile-completion.ts:33-40](lib/profile-completion.ts#L33-L40):

```typescript
console.log('🧮 calculateProfileCompletion called with user:', {
  has_social_media_stats: !!user.social_media_stats,
  social_media_stats_type: user.social_media_stats ? (Array.isArray(user.social_media_stats) ? 'array' : typeof user.social_media_stats) : 'undefined',
  social_media_stats: user.social_media_stats,
  sport: user.sport,
  primary_sport: user.primary_sport,
});
```

And in [lib/profile-completion.ts:179-186](lib/profile-completion.ts#L179-L186):

```typescript
console.log('📱 Social media scoring:', {
  socialMediaCount,
  socialMediaScore,
  is_array: Array.isArray(user.social_media_stats),
  is_object: typeof user.social_media_stats === 'object',
  platforms_with_data: user.social_media_stats && typeof user.social_media_stats === 'object' ?
    Object.keys(user.social_media_stats).filter(key => user.social_media_stats[key]?.followers > 0 || user.social_media_stats[key]?.subscribers > 0) : []
});
```

## Next Steps for User

### To Debug:

1. **Open browser to**: http://localhost:3000
2. **Log in as Sarah**: sarah.johnson@test.com
3. **Navigate to Profile page**: http://localhost:3000/profile
4. **Open Browser DevTools Console** (F12 or Cmd+Option+I)
5. **Look for our debug logs**:
   - 🔍 Profile data being passed to calculator
   - 🧮 calculateProfileCompletion called with user
   - 📱 Social media scoring
   - ✅ Completion result

### What to Look For:

**If data is empty:**
```javascript
// BAD - data not loading
{
  has_social_media_stats: false,
  social_media_stats_type: 'undefined',
  first_name: undefined,
  sport: undefined
}
```
→ **Problem**: `fetchOwnProfile()` not returning data

**If data is present but score is 0:**
```javascript
// GOOD - data loaded
{
  has_social_media_stats: true,
  social_media_stats_type: 'object',
  first_name: 'Sarah',
  sport: 'Basketball'
}

// BAD - calculator returns 0
completion: { percentage: 0, score: 0 }
```
→ **Problem**: Calculator logic issue

**If everything looks good:**
```javascript
// GOOD - data loaded
{
  has_social_media_stats: true,
  social_media_stats_type: 'object',
  first_name: 'Sarah'
}

// GOOD - calculator returns 90
completion: { percentage: 90, score: 90 }
```
→ **Problem**: React state not updating, or wrong state variable being displayed

## Possible Root Causes

### 1. Caching Issue
- Browser might be caching old API responses
- **Solution**: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### 2. Wrong API Endpoint
- Profile page might be calling a different endpoint
- **Verify**: Check Network tab for `/api/profile` calls

### 3. Data Transformation Issue
- `fetchOwnProfile()` might be transforming data incorrectly
- **Check**: Console logs will show exact data received

### 4. React State Not Updating
- `setProfileCompletion()` might not be triggering re-render
- **Check**: Console will show correct completion but UI shows 0%

### 5. Multiple Profile APIs
- There might be different profile endpoints returning different data
- **Check**: Look at [app/api/auth/get-profile/route.ts](app/api/auth/get-profile/route.ts) vs [app/api/profile/route.ts](app/api/profile/route.ts)

## Files Modified

1. **[app/profile/page.tsx](app/profile/page.tsx#L187-200)** - Added debug logging
2. **[lib/profile-completion.ts](lib/profile-completion.ts#L33-40)** - Added debug logging
3. **[lib/profile-completion.ts](lib/profile-completion.ts#L179-186)** - Added social media debug logging

## Summary

- ✅ Database has correct data (90% completion)
- ✅ API endpoint returns correct data
- ✅ Calculator logic handles object format
- ❌ Frontend displays 0% (root cause unknown)
- 🔍 Debug logging added to identify where data flow breaks

**Next action**: Check browser console logs when visiting profile page to see where the data flow breaks.
