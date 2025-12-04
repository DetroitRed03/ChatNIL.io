# Fix: Invalid API Key Error

## 🔴 Problem

The Supabase anon key in `.env.local` is **invalid** for the current database.

This happened because you switched Supabase databases, but the API keys in `.env.local` are from the old database.

## ✅ Solution

### Step 1: Get the Correct API Key

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/settings/api
2. Copy the **anon public** key (should start with `eyJhbGci...`)
3. Also verify the **Project URL** matches: `https://enbuwffusjhpcyoveewb.supabase.co`

### Step 2: Update .env.local

Open `.env.local` and update these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://enbuwffusjhpcyoveewb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-the-new-anon-key-here>
SUPABASE_URL=https://enbuwffusjhpcyoveewb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<paste-the-new-service-role-key-here>
```

### Step 3: Restart Dev Server

After updating `.env.local`:

```bash
# Kill current server
pkill -f "next dev"

# Start again
npm run dev
```

Or I can restart it for you after you update the file.

## 🔍 How to Verify

After updating and restarting:

```bash
# Test authentication
npx tsx scripts/test-auth.ts
```

Should show: `✅ Authentication successful!`

## 📝 Quick Checklist

- [ ] Get new anon key from Supabase dashboard
- [ ] Get new service role key from Supabase dashboard
- [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] Restart dev server
- [ ] Test with `npx tsx scripts/test-auth.ts`
- [ ] Try logging in at http://localhost:3000

## 🎯 After Fix

Once the keys are updated, you'll be able to log in with:

- Email: `nike.agency@test.com`
- Password: `TestPassword123!`

And all the brand accounts will work!

---

**Let me know when you've updated .env.local and I'll restart the server and verify everything works!**
