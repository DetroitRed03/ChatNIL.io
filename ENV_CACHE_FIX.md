# Environment Variable Caching Issue

## Problem
After updating `.env.local`, the browser may still show old environment variables because Next.js caches them at build time.

## Solution

### Option 1: Complete Clean Restart (Recommended)
```bash
# Kill all processes and clear caches
pkill -9 -f "next"
killall -9 node
rm -rf .next node_modules/.cache

# Start fresh
npm run dev
```

### Option 2: Use the restart script
```bash
./restart-dev.sh
```

### Option 3: Hard refresh in browser
After restarting the server:
1. Clear browser cache (Cmd+Shift+R on Mac)
2. Or use "Empty Cache and Hard Reload" in Chrome DevTools

## Verification

Check http://localhost:3000/test-env to see which environment variables the browser is using.

It should show:
- URL: `https://lqskiijspudfocddhkqs.supabase.co` (NEW database)
- NOT: `https://enbuwffusjhpcyoveewb.supabase.co` (OLD database)

## Current Correct Configuration

Your `.env.local` should have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lqskiijspudfocddhkqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...(NEW key)
SUPABASE_URL=https://lqskiijspudfocddhkqs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...(NEW key)
```

## Why This Happens

Next.js bakes `NEXT_PUBLIC_*` environment variables into the client bundle at build time for security and performance. When you change these variables, you must:
1. Stop the dev server
2. Clear the `.next` cache
3. Restart the dev server

Simply restarting isn't enough - you must clear the cache!
