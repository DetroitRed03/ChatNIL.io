# ✅ ROOT CAUSE FOUND - Environment Variable Override

## The Problem We've Been Chasing

For the past hour, we've been fighting with:
1. PGRST errors (PGRST205, PGRST200)
2. Browser showing OLD database URL
3. Multiple cache clearing attempts failing
4. `.next` rebuild showing OLD URL despite `.env.local` having NEW URL

## Root Cause: System Environment Variables

Your **system environment variables** have the OLD Supabase database hardcoded:

```bash
$ env | grep SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://enbuwffusjhpcyoveewb.supabase.co  ← OLD DATABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ← OLD KEY
SUPABASE_URL=https://enbuwffusjhpcyoveewb.supabase.co  ← OLD DATABASE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ← OLD KEY
```

Meanwhile, `.env.local` has the correct NEW database:

```bash
# .env.local (CORRECT - but being overridden!)
NEXT_PUBLIC_SUPABASE_URL=https://lqskiijspudfocddhkqs.supabase.co  ← NEW DATABASE
```

## Why This Breaks Everything

In Next.js, environment variable precedence is:

1. **System environment variables** (highest priority)
2. `.env.local`
3. `.env`

Because the OLD database URL is in your system environment, it **overrides** `.env.local` every single time, no matter how many times you:
- Clear `.next` cache
- Rebuild the app
- Clear browser cache
- Restart the dev server

## How to Fix It

### IMMEDIATE FIX: Use the Clean Start Script

I've created [start-clean-dev.sh](start-clean-dev.sh) which unsets the OLD environment variables before starting the dev server:

```bash
./start-clean-dev.sh
```

This will work for this session, but you'll need to use this script every time you start the dev server until you fix the root cause.

### PERMANENT FIX: Remove System Environment Variables

The environment variables are likely set in **VSCode settings**. Here's how to find and remove them:

#### Option 1: VSCode Workspace Settings (Most Likely)

1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type: `Preferences: Open Workspace Settings (JSON)`
3. Look for these keys:
   - `terminal.integrated.env.osx`
   - `terminal.integrated.env.linux`
   - `terminal.integrated.env.windows`
   - Any `env` or Supabase-related settings
4. Remove the OLD Supabase environment variables
5. **Restart VSCode completely** (Cmd+Q and reopen)

#### Option 2: VSCode User Settings

1. Open Command Palette: `Cmd+Shift+P`
2. Type: `Preferences: Open User Settings (JSON)`
3. Search for the same keys as above
4. Remove Supabase environment variables
5. Restart VSCode

#### Option 3: Check Shell Profiles

```bash
grep -n "SUPABASE" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.profile ~/.zshenv 2>/dev/null
```

If found, edit the file and remove those lines, then:

```bash
source ~/.zshrc  # or whichever file you edited
```

## Verification Steps

After fixing, verify the environment variables are gone:

```bash
env | grep SUPABASE
```

You should see **NOTHING** (empty output).

Then start the dev server normally:

```bash
npm run dev
```

Check the browser console - it should show the NEW database:

```
📊 Supabase URL: https://lqskiijspudfocddhkqs.supabase.co
```

## What We Also Fixed

While hunting for this, I also fixed the PGRST relationship cache issues by modifying these API routes to avoid PostgREST joins:

1. [app/api/auth/get-profile/route.ts](app/api/auth/get-profile/route.ts:66-73)
2. [app/api/demo/matchmaking/breakdown/[athleteId]/[campaignId]/route.ts](app/api/demo/matchmaking/breakdown/[athleteId]/[campaignId]/route.ts:66-73)

These now fetch `users` and `social_media_stats` separately and manually join them, bypassing PostgREST's schema cache.

## Summary

The real issue was never the caches, PostgREST, or the build system. It was simply that **system environment variables were overriding `.env.local`**.

Once you remove the OLD environment variables from your system/VSCode settings, everything should work perfectly with the NEW database.
