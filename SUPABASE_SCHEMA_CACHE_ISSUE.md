# Supabase Schema Cache Issue

## Current Status

✅ **What's Working:**
- Authentication is successful (user can log in)
- NEW database is connected (`lqskiijspudfocddhkqs`)
- `public.users` table exists in the database
- Brand accounts created (Nike, Gatorade, Local Business)

❌ **What's Not Working:**
- Supabase PostgREST API can't find the `public.users` table
- Error: `"Could not find the table 'public.users' in the schema cache"`
- This prevents the profile from loading after login

## Root Cause

Supabase's PostgREST service caches the database schema. When we created the `users` table, Post REST didn't update its cache. The `NOTIFY pgrst, 'reload schema'` command should trigger a refresh, but it's not working for the hosted Supabase instance.

## Solutions

### Solution 1: Manual Dashboard Reload (RECOMMENDED)

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/lqskiijspudfocddhkqs
2. Click "Database" in the left sidebar
3. Look for a "Reload Schema" or "Refresh" button
4. OR: Go to "API Settings" and click "Refresh" next to "Schema Cache"

This forces PostgREST to reload the schema immediately.

### Solution 2: Wait (Less Reliable)

PostgREST may automatically reload the cache after a few minutes. This is not guaranteed.

### Solution 3: Restart Supabase Project (Nuclear Option)

1. Go to https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/settings/general
2. Click "Pause project"
3. Wait for it to pause
4. Click "Resume project"

This will definitely reload the schema but causes downtime.

### Solution 4: Use Direct SQL Queries (Temporary Workaround)

Instead of using the REST API (`supabase.from('users')`), we could modify the code to use direct SQL queries via RPC functions. This bypasses PostgREST entirely.

## What We've Tried

✅ Ran `NOTIFY pgrst, 'reload schema'` via SQL
✅ Verified table exists in database
✅ Reloaded migration system multiple times
✅ Cleared all caches and restarted dev server
✅ Used correct database credentials

## Next Steps

**Immediately try Solution 1** (Manual dashboard reload) - this is the most reliable way to fix schema cache issues on Supabase's hosted platform.

Once the schema cache is refreshed, logging in with Nike should work perfectly:
- Email: `nike.agency@test.com`
- Password: `TestPassword123!`

## Technical Details

### Tables Created
- ✅ `public.users` - Main user profiles table
- ✅ `public.agencies` - Agency-specific data
- ✅ `public.agency_athlete_matches` - Matchmaking system
- ✅ `auth.users` - Supabase auth (built-in)

### Brand Accounts Created
| Brand | Email | User ID |
|-------|-------|---------|
| Nike | nike.agency@test.com | 3f270e9b-cc2b-48a0-b82e-52fdf1094879 |
| Gatorade | gatorade.agency@test.com | 6adbdd57-e355-4a99-9911-038726067533 |
| Local Business | localbusiness.agency@test.com | c6c392f8-682c-45e8-8daf-fcc0b44b8cd6 |

All accounts use password: `TestPassword123!`

## Verification Command

After refreshing the schema cache, run this to verify it works:

```bash
bash -c 'export $(cat .env.local | grep -v "^#" | xargs) && npx tsx scripts/test-users-table.ts'
```

Should show:
```
✅ Users table accessible!
📊 Found 3 users:
  - nike.agency@test.com (agency)
  - gatorade.agency@test.com (agency)
  - localbusiness.agency@test.com (agency)
```

---

**TL;DR**: Go to Supabase Dashboard > Database > Reload Schema Cache
