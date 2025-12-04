# ChatNIL Database Migration - Quick Start Guide

**Goal**: Merge old database (comprehensive athlete profiles) + new database (agency features) = Perfect Harmony 🎯

---

## Prerequisites Checklist

- [ ] `.env.old` file exists with old database credentials
- [ ] `.env.local` file has new database credentials
- [ ] Backup of new database created (via Supabase dashboard)
- [ ] Node.js and npm installed
- [ ] You understand this will CREATE users in the new database

---

## Step-by-Step Migration Process

### Step 1: Apply Schema Migration (5 minutes)

This adds all missing columns to the new database.

**Option A: Via Supabase Dashboard (Recommended)**
1. Open Supabase dashboard → SQL Editor
2. Open the file `migrations/200_merge_old_database_schema.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run"
6. Wait for success message

**Option B: Via Migration Script**
```bash
bash -c 'export $(cat .env.local | grep -v "^#" | xargs) && ./migrate.sh migrations/200_merge_old_database_schema.sql'
```

**Expected Output:**
```
✅ Migration 200: Database merge complete!
📊 Added personal info columns to users table
📊 Added 25+ columns to athlete_profiles table
🔧 Created enhanced profile completion function
🔧 Created user migration function
🔒 Updated RLS policies
```

---

### Step 2: Test Migration with 1 User (10 minutes)

Always test with a single user first!

```bash
npx tsx scripts/migrate-old-database-users.ts --limit=1
```

**What to Check:**
1. ✅ Script runs without errors
2. ✅ User appears in new database (Supabase Auth → Users)
3. ✅ User has record in `public.users` table
4. ✅ User has record in `athlete_profiles` table
5. ✅ All data fields populated correctly

**If Test Fails:**
- Check error message
- Verify schema migration applied
- Check database credentials in `.env.old` and `.env.local`
- Review logs for specific issue

---

### Step 3: Dry Run Migration (2 minutes)

See what WOULD be migrated without making changes:

```bash
npx tsx scripts/migrate-old-database-users.ts --dry-run
```

**Expected Output:**
```
🔍 DRY RUN MODE - Here's what would be migrated:

1. sarah.johnson@test.com - Sarah Johnson (Basketball)
2. mike.wilson@test.com - Mike Wilson (Football)
3. emily.chen@test.com - Emily Chen (Soccer)
...

✅ DRY RUN COMPLETE - 150 users ready to migrate
```

---

### Step 4: Run Full Migration (30 minutes)

Once you've tested successfully:

```bash
npx tsx scripts/migrate-old-database-users.ts
```

**During Migration:**
- ⏳ Script will pause for 3 seconds before starting
- 📊 Shows progress for each user
- ✅ Reports success/failure for each
- 📈 Final summary at end

**Expected Output:**
```
🚀 ChatNIL Database User Migration
═══════════════════════════════════════════════════════════

📊 Old Database: https://enbuwffusjhpcyoveewb.supabase.co
📊 New Database: https://lqskiijspudfocddhkqs.supabase.co

📊 STEP 1: Fetching users from old database...
✅ Found 150 athlete accounts to migrate

⚠️  WARNING: This will create/update users in the NEW database!
   Press Ctrl+C now to cancel...
   Starting migration in 3 seconds...

📊 STEP 2: Migrating users...

[1/150] 🔄 Migrating: sarah.johnson@test.com
         Name: Sarah Johnson
         Sport: Basketball - Point Guard
         → Creating auth user...
         ✅ Auth user created (ID: abc12345...)
         → Migrating profile data...
         ✅ Profile data migrated successfully
         ✅ Verified: Basketball profile (Score: 85)
[1/150] ✅ SUCCESS - sarah.johnson@test.com migrated

[2/150] 🔄 Migrating: mike.wilson@test.com
...

═══════════════════════════════════════════════════════════

📈 MIGRATION SUMMARY

📊 Total Users: 150
✅ Successfully Migrated: 148
❌ Failed: 2
⏭️  Skipped: 0

✅ MIGRATION COMPLETE!
```

---

### Step 5: Verify Migration (10 minutes)

**Check in Supabase Dashboard:**

1. **Auth Users** (Supabase → Authentication → Users)
   - [ ] All users appear
   - [ ] Emails match old database
   - [ ] Email confirmed = true

2. **Public Users** (Supabase → Table Editor → users)
   - [ ] All users have records
   - [ ] `first_name`, `last_name` populated
   - [ ] `role` = 'athlete'
   - [ ] `onboarding_completed` = true

3. **Athlete Profiles** (Supabase → Table Editor → athlete_profiles)
   - [ ] All users have profiles
   - [ ] Sport, position, school populated
   - [ ] Social media stats migrated
   - [ ] Profile completion scores calculated
   - [ ] New fields present (graduation_year, major, gpa, etc.)

**Run Verification Script:**
```bash
npx tsx scripts/validate-migration.ts
```

---

### Step 6: Send Password Reset Emails (15 minutes)

**Via Supabase Dashboard:**
1. Go to Authentication → Users
2. Select all migrated users (use filters: `user_metadata.migrated_from_old_db = true`)
3. Click "..." → Send password reset email
4. Confirm send

**Via Script (Alternative):**
```bash
npx tsx scripts/send-password-resets.ts
```

---

### Step 7: Test Login (5 minutes)

1. Go to your app login page
2. Try logging in with a migrated user email
3. Click "Forgot Password"
4. Check email for reset link
5. Set new password
6. Login successfully
7. Verify profile data displays correctly

**Test Users:**
- sarah.johnson@test.com
- (Check migration output for full list)

---

## Rollback Procedure

If something goes wrong:

### Immediate Rollback (< 5 minutes after migration)
```bash
# Delete migrated users from new database
npx tsx scripts/rollback-migration.ts
```

### Full Rollback (Database restore)
1. Go to Supabase Dashboard → Database → Backups
2. Select backup from before migration
3. Click "Restore"
4. Wait for restoration to complete

---

## Post-Migration Tasks

### Immediate (Day 1)
- [ ] Monitor error logs for login issues
- [ ] Test profile editing with sample user
- [ ] Verify agency features still work
- [ ] Check FMV calculations still run
- [ ] Test campaign matchmaking

### Week 1
- [ ] Monitor user feedback
- [ ] Track login success rate
- [ ] Verify profile completion scores accurate
- [ ] Test all social media integrations

### Week 2
- [ ] Update frontend to use new schema fields
- [ ] Build out profile editing for new fields
- [ ] Add UI for NIL preferences
- [ ] Implement rich media upload (profile videos, content samples)

---

## Troubleshooting

### Error: "Could not find the X column"
**Solution**: Schema migration (Step 1) didn't apply correctly. Re-run it.

### Error: "User already exists"
**Solution**: Normal if re-running migration. Script will skip auth creation and update profile data.

### Error: "Function migrate_user_from_old_db does not exist"
**Solution**: Schema migration (Step 1) didn't apply. Check SQL Editor for errors.

### Error: "Permission denied"
**Solution**: Check service role key in `.env.local` is correct.

### Migration hangs or is very slow
**Solution**: Check network connection to both databases. Large user count may take time.

---

## Success Criteria

Migration is successful when:

✅ All users can log in (after password reset)
✅ Profile data displays correctly
✅ Profile editing works with all fields
✅ Agency features continue to function
✅ FMV calculations still work
✅ Campaign matching still works
✅ No data has been lost
✅ Performance is acceptable

---

## Need Help?

- Review error messages carefully
- Check [DATABASE_MERGE_PLAN.md](./DATABASE_MERGE_PLAN.md) for detailed architecture
- Verify both `.env.old` and `.env.local` have correct credentials
- Test with `--limit=1` first before full migration
- Use `--dry-run` to preview changes

---

## Quick Command Reference

```bash
# 1. Apply schema migration
# (Use Supabase SQL Editor - see Step 1)

# 2. Test with 1 user
npx tsx scripts/migrate-old-database-users.ts --limit=1

# 3. Dry run (no changes)
npx tsx scripts/migrate-old-database-users.ts --dry-run

# 4. Full migration
npx tsx scripts/migrate-old-database-users.ts

# 5. Verify migration
npx tsx scripts/validate-migration.ts

# 6. Check schema was applied
npx tsx scripts/check-schema-200.ts
```

---

**Ready?** Start with Step 1! 🚀
