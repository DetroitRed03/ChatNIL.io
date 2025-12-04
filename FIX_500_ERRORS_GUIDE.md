# Fix 500 Internal Server Errors - Complete Guide

## Problem Summary

The demo matchmaking endpoints are returning 500 errors:
1. `/api/demo/matchmaking/campaigns` - Returns "permission denied for table agency_campaigns"
2. `/api/demo/matchmaking/athlete/[athleteId]/campaigns` - Cannot access required tables
3. `/api/demo/fmv/athletes` - Works but needs improvement

**Root Cause**: The agency platform database tables (`agency_campaigns`, `athlete_public_profiles`, etc.) were never created in the database, even though migration files exist.

## Diagnostic Results

Running `npx tsx scripts/test-demo-endpoints.ts` showed:
- ❌ `agency_campaigns` table doesn't exist
- ❌ `athlete_public_profiles` table doesn't exist
- ✅ `athlete_fmv_data` table exists (157 rows)
- ✅ `users` table exists (163 users, 157 athletes)
- ✅ `social_media_stats` table exists (185 rows)

## Solution - 3 Steps

### Step 1: Create Database Tables (MANUAL - 2 minutes)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/hposjqtfbcchhgcavypj/sql/new

2. **Copy the Migration SQL**
   - Open file: `/Users/verrelbricejr./ChatNIL.io/migrations/040_agency_platform_minimal.sql`
   - Copy the entire contents (all ~200 lines)

3. **Execute in SQL Editor**
   - Paste the SQL into the Supabase SQL Editor
   - Click the "Run" button
   - Wait for "Success. No rows returned" message

4. **Verify Tables Were Created**
   ```bash
   npx tsx scripts/check-tables-exist.ts
   ```

   You should now see:
   ```
   ✅ agency_campaigns: 0 rows
   ✅ athlete_public_profiles: 0 rows
   ✅ campaign_athlete_invites: 0 rows
   ✅ agency_athlete_messages: 0 rows
   ```

### Step 2: Seed Demo Data (AUTOMATED - 30 seconds)

Once the tables exist, populate them with sample data:

```bash
npx tsx scripts/seed-demo-data.ts
```

This script will:
- Create `athlete_public_profiles` for all 157 existing athletes
- Create 6 sample agency campaigns (Nike, Gatorade, Adidas, etc.)
- Set proper test data for matchmaking

Expected output:
```
✅ Created 157 athlete public profiles
✅ Created 6 sample campaigns
   - Nike Basketball Showcase (Nike)
   - Gatorade Performance Series (Gatorade)
   - Adidas Soccer Spotlight (Adidas)
   - Under Armour Volleyball Campaign (Under Armour)
   - Lululemon Wellness Initiative (Lululemon)
   - Powerade Elite Athletes (Powerade)
```

### Step 3: Test All Endpoints (VERIFICATION - 15 seconds)

Verify everything works:

```bash
npx tsx scripts/test-demo-endpoints.ts
```

Expected results:
```
✅ API returned 200 for /api/demo/fmv/athletes
   Found 157 athletes

✅ API returned 200 for /api/demo/matchmaking/campaigns
   Found 6 campaigns

✅ API returned 200 for /api/demo/matchmaking/athlete/[id]/campaigns
   Found X matched campaigns for athlete
```

## What Was Fixed

### 1. Database Schema
- Created `athlete_public_profiles` table (stores public athlete data)
- Created `agency_campaigns` table (stores campaign data)
- Created `campaign_athlete_invites` table (tracks invites)
- Created `agency_athlete_messages` table (messaging system)
- Added proper indexes for performance
- Enabled RLS with appropriate policies
- Granted service role full access

### 2. API Endpoint Improvements
- **Fixed `/app/api/demo/fmv/athletes/route.ts`**:
  - Changed from `!inner` join to left join
  - Now includes all athletes (not just those with FMV data)
  - Better handling of missing FMV data
  - Returns default values (fmv_score: 0, fmv_tier: 'emerging') when FMV data is missing

### 3. Data Seeding
- **Created `/scripts/seed-demo-data.ts`**:
  - Automatically creates public profiles for all athletes
  - Generates realistic campaign data with proper targeting
  - Sets appropriate budget ranges ($1,500 - $4,000 per athlete)
  - Configures proper deliverables (posts, stories, videos)

## Files Created/Modified

### New Migration Files
- `/migrations/040_agency_platform_minimal.sql` - Creates all required tables

### New Scripts
- `/scripts/check-tables-exist.ts` - Diagnostic tool to check table existence
- `/scripts/seed-demo-data.ts` - Populates sample data
- `/scripts/test-demo-endpoints.ts` - Comprehensive endpoint testing

### Modified API Routes
- `/app/api/demo/fmv/athletes/route.ts` - Fixed to handle missing FMV data

### Documentation
- `/FIX_500_ERRORS_GUIDE.md` - This file
- `/FIX_DEMO_ENDPOINTS.md` - Detailed technical documentation

## Troubleshooting

### If Step 1 Fails
- **Error: "relation already exists"**
  - Tables already created, safe to continue to Step 2

- **Error: "permission denied"**
  - You need to be logged in as the project owner
  - Try running in the Supabase SQL Editor (logged in)

### If Step 2 Fails
- **Error: "permission denied for table"**
  - Run Step 1 first to create tables
  - Verify with `npx tsx scripts/check-tables-exist.ts`

- **Error: "duplicate key value"**
  - Profiles already created, safe to ignore
  - Script will show how many were successfully created

### If Step 3 Shows Errors
- **500 Error on `/api/demo/matchmaking/campaigns`**
  - Tables don't exist - run Step 1

- **Empty results**
  - No sample data - run Step 2

- **Network errors**
  - Dev server not running - start with `npm run dev`

## Next Steps

After completing all 3 steps:

1. **Visit the Demo Pages**
   - Go to matchmaking demo page
   - Select an athlete from the dropdown (should now be populated)
   - See campaign matches appear

2. **Test Matchmaking**
   - The matchmaking engine will calculate compatibility scores
   - Shows strengths and concerns for each match
   - Provides recommended offer amounts based on FMV

3. **Additional Development**
   - Add more sample campaigns as needed
   - Customize campaign targeting criteria
   - Adjust matchmaking scoring weights

## Technical Details

### Database Schema Design
- **athlete_public_profiles**: Separate from private user data, designed for public display
- **agency_campaigns**: Rich targeting fields (sports, states, school levels, follower counts)
- **RLS Policies**: Public can read active campaigns, service role has full access
- **Indexes**: Optimized for common queries (sport, slug, user_id lookups)

### API Architecture
- **Service Role Client**: Bypasses RLS for admin operations
- **Error Handling**: Comprehensive with detailed error messages
- **Data Transformation**: Clean JSON responses matching frontend interfaces

### Matchmaking Algorithm
- Uses `/lib/campaign-matchmaking.ts` scoring system
- Evaluates 7 compatibility factors (brand values, interests, campaign fit, budget, geography, demographics, engagement)
- Returns match percentage (0-100), strengths, concerns, and recommended offers

## Support

If you encounter issues:
1. Check the diagnostic output from `test-demo-endpoints.ts`
2. Verify tables exist with `check-tables-exist.ts`
3. Check server logs for detailed error messages
4. Ensure environment variables are set (SUPABASE_SERVICE_ROLE_KEY)
