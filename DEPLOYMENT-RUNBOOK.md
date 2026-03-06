# ChatNIL - Deployment Runbook

**Last Updated:** March 2026

---

## Table of Contents

1. [Local Development Setup](#1-local-development-setup)
2. [Deploying to Production](#2-deploying-to-production)
3. [Rolling Back](#3-rolling-back)
4. [Running Migrations](#4-running-migrations)
5. [Cron Jobs](#5-cron-jobs)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Local Development Setup

### Prerequisites

- Node.js 18+ (`node -v`)
- npm 9+ (`npm -v`)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/DetroitRed03/ChatNIL.io.git
cd ChatNIL.io

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with real values (see SECRETS-MANIFEST.md)

# 4. Start development server
npm run dev
```

App runs at http://localhost:3000

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build (type-checks + compiles) |
| `npm run start` | Start production server (after build) |
| `npm run lint` | Run ESLint |

---

## 2. Deploying to Production

### Method 1: Vercel CLI (Primary)

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Login (one-time)
vercel login

# Deploy to production
vercel --prod
```

### Method 2: Git Push

Push to `main` branch. Vercel auto-deploys if Git integration is connected.

```bash
git push origin main
```

Note: As of March 2026, auto-deploy from Git may require manual trigger via `vercel --prod`.

### Pre-Deploy Checklist

- [ ] `npm run build` passes locally
- [ ] Database migrations applied (if any new ones)
- [ ] Environment variables set in Vercel (if new ones added)
- [ ] Tested core flows locally

### Post-Deploy Verification

1. Visit https://chatnil-io.vercel.app
2. Test login with a known account
3. Check Vercel dashboard for any runtime errors
4. Verify API routes return 200: `/api/chat`, `/api/dashboard/college-athlete/v2`

---

## 3. Rolling Back

### Option A: Vercel Instant Rollback (Fastest)

1. Go to Vercel Dashboard > chatnil-io > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### Option B: Git Revert

```bash
# Revert the last commit
git revert HEAD
git push origin main
vercel --prod
```

### Option C: Redeploy Specific Commit

```bash
# Find the good commit
git log --oneline -10

# Checkout and deploy
git checkout <commit-hash>
vercel --prod
```

---

## 4. Running Migrations

### Migration Files

All migrations live in `supabase/migrations/`. They are numbered sequentially:

```
supabase/migrations/
  001_initial_schema.sql
  002_add_onboarding_fields.sql
  ...
  034_user_reminders.sql
```

### Applying a Migration

**Option 1: Supabase SQL Editor (Recommended)**

1. Go to Supabase Dashboard > SQL Editor
2. Paste the migration SQL
3. Click "Run"

**Option 2: exec_sql RPC**

If the `exec_sql` function exists in your DB:

```javascript
const { data, error } = await supabase.rpc('exec_sql', {
  query: `<paste SQL here>`
});
```

**Option 3: Via npm script**

```bash
# Set env vars first
export $(grep -v '^#' .env.local | xargs)
npm run migrate
```

### Migration Checklist

- [ ] Read the migration SQL before applying
- [ ] Check for `DROP` or `ALTER` statements that could break existing data
- [ ] Apply to staging/dev first if possible
- [ ] Verify tables/columns exist after running

### Important Migration Notes

- `athlete_public_profiles.total_followers` is a GENERATED column - never INSERT/UPDATE it directly
- `athlete_public_profiles.school_level` is NOT NULL - always provide in INSERTs
- The `exec_sql` RPC function parameter is named `query` (not `sql`)

---

## 5. Cron Jobs

Three cron endpoints exist for scheduled tasks:

| Endpoint | Purpose | Schedule |
|----------|---------|----------|
| `/api/cron/fmv-daily-recalculation` | Recalculate Fair Market Values | Daily |
| `/api/cron/sync-external-rankings` | Sync athlete rankings | Daily |
| `/api/cron/fmv-rate-limit-reset` | Reset FMV rate limits | Daily |

All require `Authorization: Bearer $CRON_SECRET` header in production.

Configure in Vercel Dashboard > Cron Jobs, or use an external scheduler (e.g., cron-job.org).

---

## 6. Troubleshooting

### "Cannot find module './vendor-chunks/...'"

Stale Next.js build cache.

```bash
rm -rf .next
npm run dev
```

### 401 Errors on API Routes

- Ensure `credentials: 'include'` on client-side fetch calls
- Check that `sb-access-token` cookie is being set
- Verify Supabase auth session is active

### "supabaseUrl is required" Error

Environment variables not loaded. Ensure `.env.local` exists and has the required values.

### Supabase Client Returns Null (No Error)

The Supabase JS client v2.57.4 silently returns `{data: null, error: null}` for tables not in the TypeScript `Database` type. Use raw `fetch()` for these tables:

```typescript
const res = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/table_name?select=*`,
  {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store', // Important: Next.js 14 caches by default
  }
);
```

### Build Fails with TypeScript Errors

There are ~20 pre-existing TypeScript strict-mode warnings. The build (`next build`) succeeds despite these because Next.js only fails on hard errors. Running `npx tsc --noEmit` will show these warnings but they are non-blocking.

### DATABASE_URL Pooler Broken

The Supabase pooler connection string (`DATABASE_URL`) returns "Tenant or user not found". Use the direct connection or Supabase client instead.
