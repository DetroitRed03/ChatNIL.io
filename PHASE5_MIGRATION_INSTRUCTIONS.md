# Phase 5 FMV System - Migration Instructions

## 📋 Overview

This guide will help you apply all Phase 5 FMV (Fair Market Value) migrations to your Supabase database.

**What you'll get:**
- Complete FMV scoring system (0-100 points)
- 5 tier classification (elite, high, medium, developing, emerging)
- State-by-state NIL compliance rules (all 50 states)
- External rankings integration (On3, Rivals, 247Sports, ESPN)
- Institution profiles for schools/universities
- Privacy controls and rate limiting
- 5 test athletes with realistic FMV scores

---

## ⚡ Quick Start (3 Steps)

### Step 1: Apply Migrations via Supabase Dashboard

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql
   - Click "+ New Query"

2. **Copy the consolidated migration file:**
   ```bash
   # The migrations have been consolidated into a single file
   cat migrations/phase-5-consolidated.sql
   ```

3. **Paste and run in SQL Editor:**
   - Copy the entire contents of `migrations/phase-5-consolidated.sql`
   - Paste into the Supabase SQL Editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

### Step 2: Seed Test Data

```bash
npm run seed:phase5
```

Expected output:
```
🌱 Starting Phase 5 FMV System seed...
✅ Created 5 athletes
✅ Created 6 NIL deals
✅ Calculated 5 FMV scores

Test credentials:
  sarah.johnson@test.com / TestPassword123! (FMV: ~92 - Elite)
  marcus.williams@test.com / TestPassword123! (FMV: ~78 - High)
  emma.garcia@test.com / TestPassword123! (FMV: ~62 - Medium)
```

### Step 3: Test the System

1. Login with test credentials
2. Navigate to FMV dashboard
3. View calculated FMV scores
4. Test FMV recalculation
5. View comparable athletes

---

## 📂 Migration Files (In Order)

The consolidated file includes these migrations:

| # | File | Description |
|---|------|-------------|
| 022 | athlete_fmv_data.sql | Core FMV data table with scores and privacy |
| 023 | state_nil_rules.sql | 50-state NIL compliance rules |
| 024 | scraped_athlete_data.sql | External rankings from recruiting services |
| 025 | institution_profiles.sql | School/university profiles |
| 027 | update_user_roles.sql | Add 'school' and 'business' to user roles |

**Optional migrations** (not in consolidated file):
- 026: business_profiles.sql (marked NOT IMPLEMENTED)
- 028: seed_all_state_nil_rules.sql (seeded by 023 already)
- 029: seed_sample_fmv_data.sql (use `npm run seed:phase5` instead)

---

## 🧪 Test Athletes Created by Seed Script

The seed script creates 5 athletes spanning all FMV tiers:

### 1. Sarah Johnson - Elite Tier (Expected: ~92 FMV)
- **Email:** sarah.johnson@test.com
- **Sport:** Basketball (Point Guard)
- **School:** University of Kentucky
- **Social:** 85K Instagram (verified), 40K TikTok (verified)
- **Engagement:** 6.8%
- **NIL Deals:** 3 ($30,500 total) - Nike, Gatorade, Local

### 2. Marcus Williams - High Tier (Expected: ~78 FMV)
- **Email:** marcus.williams@test.com
- **Sport:** Football (Quarterback)
- **School:** University of Texas
- **Social:** 30K Instagram, 15K Twitter
- **Engagement:** 4.5%
- **NIL Deals:** 2 ($3,500 total) - Gatorade, Gym

### 3. Emma Garcia - Medium Tier (Expected: ~62 FMV)
- **Email:** emma.garcia@test.com
- **Sport:** Soccer (Midfielder)
- **School:** UCLA
- **Social:** 6K Instagram, 2.5K TikTok
- **Engagement:** 3.2%
- **NIL Deals:** 1 ($500 total) - Local Pizza

### 4. Jake Miller - Developing Tier (Expected: ~48 FMV)
- **Email:** jake.miller@test.com
- **Sport:** Baseball (Pitcher)
- **School:** University of Florida
- **Social:** 1.5K Instagram, 600 Twitter
- **Engagement:** 2.1%
- **NIL Deals:** None

### 5. Olivia Brown - Emerging Tier (Expected: ~28 FMV)
- **Email:** olivia.brown@test.com
- **Sport:** Volleyball (Outside Hitter)
- **School:** Kentucky Central High School
- **Social:** 650 Instagram
- **Engagement:** 1.8%
- **NIL Deals:** None

**All test passwords:** `TestPassword123!`

---

## 🛠️ Cleanup Test Data

When you're done testing:

```bash
npm run clean:phase5
```

This will remove all test athletes and related data (NIL deals, FMV records, social stats).

---

## 📊 What Gets Created

### Database Tables

1. **athlete_fmv_data** - Core FMV scores
   - fmv_score (0-100 integer)
   - fmv_tier (enum: elite/high/medium/developing/emerging)
   - Category scores: social, athletic, market, brand
   - Deal value estimates (low/mid/high)
   - Improvement suggestions, strengths, weaknesses
   - Score history tracking
   - Privacy controls (is_public_score)
   - Rate limiting (3 calculations per day)

2. **state_nil_rules** - NIL compliance by state
   - allows_nil, high_school_allowed, college_allowed
   - prohibited_categories (alcohol, gambling, etc.)
   - disclosure_required, agent_registration_required
   - rules_summary and rules_url

3. **scraped_athlete_data** - External rankings
   - source (on3, rivals, 247sports, espn)
   - overall_ranking, position_ranking, state_ranking
   - nil_valuation (from recruiting services)

4. **institution_profiles** - School profiles
   - institution_name, institution_type
   - location, athletic_conference
   - custom_branding (colors, logos)
   - QR code for athlete signup

### Database Functions

- `get_athlete_fmv(UUID)` - Get FMV data (respects privacy)
- `can_recalculate_fmv(UUID)` - Check rate limit
- `calculate_fmv_tier()` - Auto-calculate tier from score
- Triggers for updated_at, rate limit reset, tier calculation

### API Routes

- `GET /api/fmv` - Fetch FMV data for current user
- `POST /api/fmv/calculate` - Calculate FMV score
- `POST /api/fmv/recalculate` - Force recalculation
- `GET /api/fmv/comparables` - Get comparable athletes
- `POST /api/fmv/visibility` - Toggle public/private
- `GET /api/fmv/notifications` - Notification settings

---

## ❓ Troubleshooting

### Issue: "Could not find table social_media_stats"

**Solution:** Migrations haven't been applied yet. Follow Step 1 above.

### Issue: "Failed to create athlete - already exists"

**Solution:** Test athletes already exist. Run `npm run clean:phase5` first.

### Issue: "Rate limit exceeded"

**Solution:** You can only calculate FMV 3 times per day. Wait 24 hours or manually reset in database:

```sql
UPDATE athlete_fmv_data
SET calculation_count_today = 0,
    last_calculation_reset_date = CURRENT_DATE - 1
WHERE athlete_id = 'YOUR_USER_ID';
```

### Issue: FMV scores don't match expected values

**Causes:**
- total_followers not calculated (check social_media_stats trigger)
- Missing school state info (affects market score)
- NIL deals not created properly (affects brand score)

**Solution:** Run seed script again with `npm run clean:phase5 && npm run seed:phase5`

---

## 🎯 Testing Checklist

After applying migrations and seeding data:

- [ ] Login as sarah.johnson@test.com
- [ ] Navigate to FMV dashboard
- [ ] Verify FMV score shows ~92 (Elite tier)
- [ ] Check category breakdowns (social, athletic, market, brand)
- [ ] View improvement suggestions
- [ ] Test FMV recalculation (should work 3 times per day)
- [ ] Toggle privacy setting (make score public)
- [ ] View comparable athletes (should show other public scores)
- [ ] Check state NIL compliance rules for Kentucky
- [ ] Test with other athletes (Marcus, Emma, Jake, Olivia)

---

## 📞 Support

If you encounter issues:

1. Check server logs: Look for errors in terminal running `npm run dev`
2. Check Supabase logs: Dashboard → Logs → Postgres Logs
3. Verify migrations applied: Check Table Editor for new tables
4. Check RLS policies: Ensure you're logged in when testing

---

## 🚀 Next Steps After Migration

1. **Customize FMV Calculator:**
   - Edit `lib/fmv/fmv-calculator.ts`
   - Adjust scoring weights if needed
   - Add custom sports or positions

2. **Add FMV UI Components:**
   - Create FMV dashboard page
   - Add FMV badge to athlete profiles
   - Show improvement suggestions UI

3. **Set up Cron Jobs:**
   - Daily FMV recalculation for all athletes
   - Rate limit reset (midnight)
   - Rankings sync from external sources

4. **Deploy to Production:**
   - Ensure migrations are applied to production database
   - Set up environment variables
   - Test with real data
