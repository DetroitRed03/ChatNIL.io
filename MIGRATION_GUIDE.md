# 🚀 ChatNIL Migration Guide - New Supabase Instance

**Status:** ✅ `.env.local` updated with new credentials
**New URL:** https://lqskiijspudfocddkhqs.supabase.co

---

## 📋 Quick Migration (30 minutes)

### Step 1: Apply Core Schema (5 min)

**Go to:** [Supabase SQL Editor](https://supabase.com/dashboard/project/lqskiijspudfocddkhqs/sql/new)

**Run this consolidated SQL:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create exec_sql helper function
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

### Step 2: Run Migration Script (10 min)

```bash
npx tsx scripts/migrate-to-new-supabase.ts
```

This will apply all 10+ core migrations automatically.

### Step 3: Seed Test Data (10 min)

```bash
npx tsx scripts/seed-complete-platform.ts
```

This creates:
- Test users (athletes, agencies, parents)
- NIL deals and campaigns
- Athlete-agency matches
- FMV data
- Quiz questions
- Badges

### Step 4: Enable Realtime (2 min)

1. Go to [Database → Replication](https://supabase.com/dashboard/project/lqskiijspudfocddkhqs/database/replication)
2. Enable for these tables:
   - `agency_athlete_messages`
   - `chat_messages`
   - `chat_sessions`

### Step 5: Restart & Test (3 min)

```bash
# Restart dev server
# Press Ctrl+C in terminal, then:
npm run dev

# Open browser
open http://localhost:3000
```

---

## 🎯 What Gets Migrated

### Database Schema:
- ✅ Users & authentication
- ✅ Athlete profiles
- ✅ Agency profiles
- ✅ Matches & matchmaking
- ✅ Messages (agency-athlete)
- ✅ Chat system (AI chat)
- ✅ NIL deals
- ✅ FMV calculations
- ✅ Badges & gamification
- ✅ Quiz system
- ✅ School compliance
- ✅ Dashboard views

### Functions & Views:
- ✅ conversation_summaries view
- ✅ mark_messages_read() function
- ✅ get_unread_count() function
- ✅ FMV calculation functions
- ✅ Profile completion functions

### RLS Policies:
- ✅ All tables secured
- ✅ Row-level security enabled

---

## 🧪 Test Accounts (After Seeding)

**Athlete:**
- Email: sarah.johnson@test.com
- Password: testpassword123
- Profile: Complete athlete profile with FMV data

**Agency:**
- Email: nike@test.com
- Password: testpassword123
- Profile: Complete agency with campaigns

---

## ⚠️ If Migration Script Fails

**Fallback: Manual Migration**

Copy each migration file from `migrations/` folder and run in SQL Editor:

1. `019_agency_athlete_matches.sql`
2. `027_school_system.sql`
3. `031_add_username_to_users.sql`
4. `040_agency_platform.sql`
5. `050_enhance_chat_attachments.sql`
6. `070_add_profile_cover_photos.sql`
7. `075_add_match_tier_and_reasons.sql`
8. `080_auto_calculate_social_stats.sql`
9. `090_dashboard_infrastructure.sql`

Then run messaging migration:
```bash
npx tsx scripts/run-migration-100-direct.ts
```

---

## 📊 Verification Checklist

After migration, verify:

- [ ] Can create new user account
- [ ] Athletes can complete onboarding
- [ ] Agencies can create campaigns
- [ ] Matchmaking generates matches
- [ ] Messaging works (real-time)
- [ ] AI chat works
- [ ] FMV scores display
- [ ] Badges show up
- [ ] Quizzes load

---

## 🆘 Troubleshooting

**Problem:** Migration script fails
**Solution:** Use manual migration (see above)

**Problem:** Tables already exist errors
**Solution:** Safe to ignore - means table was already created

**Problem:** RLS policy errors
**Solution:** Drop and recreate policies in SQL Editor

**Problem:** Realtime not working
**Solution:** Ensure tables are enabled in Replication settings

---

## 📞 Support

If you encounter issues:
1. Check migration logs for specific errors
2. Verify all environment variables are correct
3. Ensure Supabase project is fully initialized
4. Try manual migration as fallback

---

**Ready to start?** Run: `npx tsx scripts/migrate-to-new-supabase.ts`
