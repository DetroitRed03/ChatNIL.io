# Fix Demo Endpoints - Implementation Guide

## Problem
The demo matchmaking endpoints are returning 500 errors because the required database tables don't exist:
- `agency_campaigns`
- `athlete_public_profiles`
- `campaign_athlete_invites`
- `agency_athlete_messages`

## Solution

### Step 1: Create Database Tables

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/hposjqtfbcchhgcavypj/sql/new

2. **Run the Migration SQL**
   - Copy the contents of `/migrations/040_agency_platform_minimal.sql`
   - Paste into the SQL Editor
   - Click "Run"
   - Verify all statements execute successfully

### Step 2: Seed Sample Data

After the tables are created, run this script to populate sample data:

```bash
npx tsx scripts/seed-demo-data.ts
```

This will:
- Create `athlete_public_profiles` for all existing athletes with FMV data
- Create 5-10 sample agency campaigns
- Set up proper test data for matchmaking

### Step 3: Test the Endpoints

Run the diagnostic test:

```bash
npx tsx scripts/test-demo-endpoints.ts
```

Expected results:
- ✅ `/api/demo/fmv/athletes` - Returns list of athletes
- ✅ `/api/demo/matchmaking/campaigns` - Returns list of campaigns
- ✅ `/api/demo/matchmaking/athlete/[id]/campaigns` - Returns matched campaigns

## Why This Happened

The migration 040 (agency platform) was created but never applied to the database. The service role has permissions, but the tables themselves don't exist.

## Files Created/Modified

1. `/migrations/040_agency_platform_minimal.sql` - Creates all required tables
2. `/scripts/seed-demo-data.ts` - Populates sample data
3. `/scripts/test-demo-endpoints.ts` - Verifies endpoints work
4. `/scripts/check-tables-exist.ts` - Diagnostic tool

## Next Steps After Manual Migration

Once you've run the SQL in Step 1, I can:
1. Create the seed data script
2. Populate athlete profiles automatically
3. Generate sample campaigns
4. Test all endpoints
5. Fix any remaining issues in the API handlers
