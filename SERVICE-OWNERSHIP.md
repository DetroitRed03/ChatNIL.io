# ChatNIL - Service Ownership & Transfer Checklist

**Last Updated:** March 2026
**Transfer Date:** _______________
**From:** _______________
**To:** _______________

---

## Account Transfers

### 1. GitHub Repository

| Item | Status | Notes |
|------|--------|-------|
| Transfer repo ownership or add as admin | [ ] | github.com/DetroitRed03/ChatNIL.io |
| New owner has push access to `main` | [ ] | |
| Branch protection rules reviewed | [ ] | |
| Deploy keys rotated (if any) | [ ] | |

### 2. Vercel

| Item | Status | Notes |
|------|--------|-------|
| Transfer project ownership or add as admin | [ ] | vercel.com > chatnil-io |
| New owner can access deployment settings | [ ] | |
| New owner can access environment variables | [ ] | |
| Domain ownership transferred (if custom domain) | [ ] | |
| Billing transferred to new owner | [ ] | |

### 3. Supabase

| Item | Status | Notes |
|------|--------|-------|
| Transfer project ownership or add as admin | [ ] | |
| New owner has access to SQL Editor | [ ] | |
| New owner has access to Auth settings | [ ] | |
| New owner has access to Storage buckets | [ ] | |
| New owner has access to API settings | [ ] | |
| Database backup exported | [ ] | Settings > Database > Backups |
| Billing transferred to new owner | [ ] | |

### 4. OpenAI

| Item | Status | Notes |
|------|--------|-------|
| New owner has own OpenAI account | [ ] | |
| New API key generated under new account | [ ] | |
| Key updated in Vercel env vars | [ ] | |
| Old key revoked | [ ] | |
| Billing set up on new account | [ ] | |

### 5. Resend (Email)

| Item | Status | Notes |
|------|--------|-------|
| New owner has Resend account | [ ] | |
| Domain DNS records transferred | [ ] | |
| Domain verified in new account | [ ] | |
| New API key generated | [ ] | |
| Key updated in Vercel env vars | [ ] | |
| Old key revoked | [ ] | |

### 6. PostHog (Optional - Analytics)

| Item | Status | Notes |
|------|--------|-------|
| Transfer project or create new | [ ] | |
| Update project keys in Vercel env vars | [ ] | |

---

## Domain & DNS

| Item | Status | Notes |
|------|--------|-------|
| Domain registrar access transferred | [ ] | |
| DNS records documented | [ ] | |
| SSL certificates auto-managed by Vercel | [ ] | |
| Email DNS (SPF, DKIM for Resend) transferred | [ ] | |

---

## Codebase Knowledge Transfer

| Item | Status | Notes |
|------|--------|-------|
| README.md reviewed | [ ] | Project overview, setup instructions |
| ARCHITECTURE.md reviewed | [ ] | System design, data flows, key patterns |
| DEPLOYMENT-RUNBOOK.md reviewed | [ ] | Deploy, rollback, migrations |
| SECRETS-MANIFEST.md reviewed | [ ] | All env vars and where to find them |
| TESTING-CHECKLIST.md reviewed | [ ] | 78 test cases across all roles |
| .env.example reviewed | [ ] | All 15 env vars documented |

---

## Database

| Item | Status | Notes |
|------|--------|-------|
| All migrations in `supabase/migrations/` documented | [ ] | 34+ numbered migrations |
| Current schema matches migrations | [ ] | |
| RLS policies active on all tables | [ ] | |
| No orphaned data or test records | [ ] | |
| Database backup taken before transfer | [ ] | |

---

## Billing Summary

| Service | Plan | Est. Monthly Cost | Billing Contact |
|---------|------|-------------------|-----------------|
| Vercel | Pro | Varies | |
| Supabase | Free/Pro | Varies | |
| OpenAI | Pay-as-you-go | Varies by usage | |
| Resend | Free/Pro | Varies | |
| PostHog | Free tier | $0 | |
| Domain | Annual | Varies | |

---

## Post-Transfer Verification

After transfer is complete, verify:

- [ ] New owner can `git clone` and `npm run dev` locally
- [ ] New owner can deploy via `vercel --prod`
- [ ] New owner can access Supabase SQL Editor
- [ ] New owner can view Vercel deployment logs
- [ ] New owner can rotate API keys independently
- [ ] All old credentials revoked
- [ ] Test login works on production
- [ ] Test AI chat works on production
- [ ] Test email sending works (deal submission notification)

---

## Emergency Contacts

| Service | Support URL |
|---------|------------|
| Supabase | supabase.com/support |
| Vercel | vercel.com/support |
| OpenAI | platform.openai.com/docs |
| Resend | resend.com/support |

---

## Sign-Off

| Party | Name | Date | Signature |
|-------|------|------|-----------|
| Previous Owner | | | |
| New Owner | | | |
