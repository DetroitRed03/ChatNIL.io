# Migration Application Guide - Complete Matchmaking Setup

**Goal**: Apply missing database migrations to enable full matchmaking functionality

---

## Quick Start (Recommended)

### Option 1: Browser-Based Migration Tool

1. **Open the migration tool** in your browser:
   ```
   http://localhost:3000/apply-missing-migrations.html
   ```

2. **Enter your Supabase credentials**:
   - Supabase URL: `https://lqskiijspudfocddhkqs.supabase.co`
   - Service Role Key: (from your `.env.local` file)

3. **Click "Test Connection"**

4. **Click "Apply All Migrations"**

5. **Done!** The tool will create:
   - ✅ `nil_deals` table
   - ⚠️  `state_nil_rules` (requires manual step - see below)

### Option 2: Supabase SQL Editor (Manual)

If the browser tool doesn't work, apply migrations manually:

1. **Go to Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql
   ```

2. **Create NIL Deals Table**:
   - Copy contents of: `migrations/018_nil_deals.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Create State NIL Rules Table**:
   - Copy contents of: `migrations/phase-5-fmv-system/023_state_nil_rules.sql`
   - Paste into SQL Editor
   - Click "Run"

---

## What Gets Created

### 1. `nil_deals` Table

**Purpose**: Track NIL deals between athletes and agencies/brands

**Key Fields**:
```sql
- athlete_id (UUID) - References users.id
- agency_id (UUID) - References users.id
- brand_name (TEXT) - Nike, Gatorade, etc.
- deal_type (ENUM) - sponsorship, endorsement, content_creation, etc.
- status (ENUM) - draft, pending, active, completed, etc.
- compensation_amount (DECIMAL) - Deal value in dollars
- deliverables (JSONB) - What athlete must deliver
- is_public (BOOLEAN) - Show on public profile?
```

**Why Needed**:
- Track Sarah's 3 completed/active deals
- Calculate "past NIL success" factor in matchmaking (10 pts)
- Display deal history on athlete profiles

### 2. `state_nil_rules` Table

**Purpose**: Store compliance rules for all 50 US states

**Key Fields**:
```sql
- state_code (TEXT) - 'CA', 'NY', etc.
- state_name (TEXT) - 'California', 'New York', etc.
- allows_nil (BOOLEAN) - State allows NIL?
- high_school_allowed (BOOLEAN) - HS athletes can participate?
- college_allowed (BOOLEAN) - College athletes can participate?
- prohibited_categories (TEXT[]) - ['alcohol', 'gambling', 'cannabis']
- disclosure_required (BOOLEAN) - Must disclose to school?
```

**Why Needed**:
- Validate deals comply with state law
- Show compliance warnings in UI
- Filter opportunities by state rules
- Geographic compliance scoring in matchmaking

---

## After Migration: Seed Data

Once tables are created, run the seeding script:

```bash
npx tsx scripts/complete-matchmaking-data.ts
```

This will create:

### 1. **5 Active Campaigns**
- Nike Basketball Ambassadors ($5K/athlete)
- TikTok Content Creators ($2.5K/athlete)
- Athletes for Education ($1.5K/athlete)
- Local Business Ambassadors ($1K/athlete)
- Elite Athletes Partnership ($15K/athlete)

### 2. **3 NIL Deals for Sarah**
- Nike - $1,500 (completed)
- Gatorade - $2,000 (completed)
- Local Sporting Goods - $5,000 (active)

### 3. **3+ Agency-Athlete Matches**
- Elite Sports Management → Sarah (85/100)
- Digital Athletes Network → Sarah (78/100)
- Social Impact Sports → Sarah (72/100)

---

## Verification Steps

### 1. Check Tables Exist

In Supabase Dashboard > Table Editor:
- ✅ `nil_deals` should appear in table list
- ✅ `state_nil_rules` should appear in table list

### 2. Run Seed Script

```bash
npx tsx scripts/complete-matchmaking-data.ts
```

**Expected Output**:
```
✅ Created 5/5 campaigns
✅ Created 3/3 NIL deals
✅ Created 3/3 matches
```

### 3. Test API Endpoints

```bash
# Check Sarah's deals
curl http://localhost:3000/api/nil-deals?athlete_id=ca05429a-0f32-4280-8b71-99dc5baee0dc

# Check campaigns
curl http://localhost:3000/api/campaigns

# Check matches
curl http://localhost:3000/api/matches?athlete_id=ca05429a-0f32-4280-8b71-99dc5baee0dc
```

---

## Troubleshooting

### Problem: "Could not find table in schema cache"

**Solution**: Reload PostgREST schema cache

```bash
curl -X POST "https://lqskiijspudfocddhkqs.supabase.co/rest/v1/" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

Or restart your Supabase project in the dashboard.

### Problem: "exec_sql RPC not found"

**Solution**: Use Supabase SQL Editor instead of the browser tool (Option 2 above).

### Problem: "Duplicate object" error

**Solution**: Table already exists! Skip that migration and continue.

### Problem: Foreign key constraint error

**Solution**: Ensure migrations are run in order:
1. First: `018_nil_deals.sql`
2. Second: `023_state_nil_rules.sql`

---

## Schema Alignment Status

### ✅ Tables Created by Migrations

After running these migrations, you'll have:

| Table | Status | Records Expected |
|-------|--------|------------------|
| `nil_deals` | ✅ Created | 3 (Sarah's deals) |
| `state_nil_rules` | ✅ Created | 50 (all US states) |

### ⚠️ Tables Still With Schema Mismatches

These tables exist but have different schemas than expected:

| Table | Issue | Workaround |
|-------|-------|------------|
| `campaigns` | Missing `agency_user_id` | Will need schema update or code adaptation |
| `agency_athlete_matches` | Missing `match_highlights` | Can work without highlights field |

We'll address these in the next iteration if needed.

---

## Complete Flow After Migration

```
1. Apply Migrations ✅
   ↓
2. Seed Data (npx tsx scripts/complete-matchmaking-data.ts)
   ↓
3. Database Now Has:
   - 11 Agencies
   - 5 Active Campaigns
   - 3 NIL Deals (Sarah)
   - 3 Matches (Sarah)
   - 50 State Rules
   ↓
4. Test Features:
   - Campaign Discovery
   - Matchmaking
   - Deal Tracking
   - Compliance Checking
```

---

## Migration Files Reference

### Primary Migrations

1. **`migrations/018_nil_deals.sql`** (1,200 lines)
   - Creates `nil_deals` table
   - Creates ENUM types for deal_type, deal_status, payment_status
   - Sets up RLS policies
   - Creates indexes

2. **`migrations/phase-5-fmv-system/023_state_nil_rules.sql`** (800 lines)
   - Creates `state_nil_rules` table
   - Seeds initial 10 states (KY, CA, FL, TX, NY, etc.)
   - Sets up compliance rules
   - Creates indexes

### Optional Enhancements

If you want to fix the schema mismatches for campaigns and matches, these migrations can help:

3. **`migrations/040_agency_platform.sql`**
   - Has `agency_campaigns` table definition
   - May need adaptation for your current schema

4. **`migrations/019_agency_athlete_matches.sql`**
   - Has complete `agency_athlete_matches` schema
   - Includes `match_highlights` and other fields

---

## Success Criteria

✅ **You'll know migrations worked when**:

1. Tables appear in Supabase Table Editor
2. Seed script runs without "table not found" errors
3. API endpoints return data (not 404s)
4. Sarah's profile shows NIL deals
5. Matchmaking page shows agency matches
6. Campaign discovery page shows active campaigns

---

## Next Steps After Migration

1. **Test Matchmaking**:
   - Visit `/matches` page
   - Should see Sarah matched with 3 agencies
   - Match scores should be 72-85/100

2. **Test Campaign Discovery**:
   - Visit `/campaigns` page
   - Should see 5 active campaigns
   - Filtering by sport/location should work

3. **Test NIL Deals**:
   - Visit `/athletes/sarah-johnson`
   - Should show 3 deals (2 completed, 1 active)
   - Total earnings: $8,500

4. **Test Compliance**:
   - Try creating deal in California
   - Should validate against CA state rules
   - Should warn about prohibited categories

---

**Status**: Ready to Apply
**Estimated Time**: 5-10 minutes
**Risk Level**: Low (migrations are idempotent - safe to re-run)
