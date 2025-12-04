# ChatNIL Launch Checklist

**Last Updated:** December 4, 2025
**Build Status:** Verified
**Platform:** Next.js 14 + Supabase

---

## Required Environment Variables

### Supabase (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### OpenAI (Required for AI Chat)
```bash
OPENAI_API_KEY=sk-your-openai-key
```

### Application (Required)
```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NODE_ENV=production
```

### Rate Limiting (Required)
```bash
RATE_LIMIT_SALT=your-random-salt-string
```

### Analytics (Optional)
```bash
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=your-posthog-api-key
```

### Cron Jobs (Optional)
```bash
CRON_SECRET=your-cron-secret
```

### Development Only
```bash
NEXT_PUBLIC_DEV_MODE=false  # Set to false in production
```

---

## Pre-Deployment Steps

### 1. Code Verification
- [x] Run `npm run build` - No errors
- [x] Check for TODO/FIXME in critical paths - 1 minor TODO (non-blocking)
- [x] Remove coach onboarding code - Completed
- [x] Verify TypeScript compilation - Passed

### 2. Database Preparation
- [x] Apply migration 300_verify_rls_policies.sql
- [x] Apply migration 301_rate_limiting.sql
- [x] Verify all RLS policies are enabled
- [x] Confirm rate limiting tables exist

### 3. Environment Setup
- [ ] Set all required environment variables in Vercel/hosting platform
- [ ] Verify Supabase project is on appropriate plan
- [ ] Confirm OpenAI API key has sufficient credits
- [ ] Generate unique RATE_LIMIT_SALT

### 4. DNS & Domain
- [ ] Configure custom domain
- [ ] Set up SSL certificate (auto with Vercel)
- [ ] Update NEXT_PUBLIC_APP_URL

---

## Database Tables Verification

| Table | Status | Row Count |
|-------|--------|-----------|
| users | ✅ Ready | 19 |
| chat_sessions | ✅ Ready | 1 |
| chat_messages | ✅ Ready | 2 |
| badges | ✅ Ready | - |
| user_badges | ✅ Ready | - |
| quiz_questions | ✅ Ready | 80 |
| quiz_sessions | ✅ Ready | - |
| knowledge_base | ✅ Ready | 132 |
| athlete_profiles | ✅ Ready | 5 |
| api_rate_limits | ✅ Ready | 0 |
| anon_rate_limits | ✅ Ready | 1 |

---

## Post-Deployment Verification Steps

### 1. Authentication Flow (5 min)
- [ ] Sign up with new email works
- [ ] Sign in with existing account works
- [ ] Password reset email sends
- [ ] Session persists on page refresh
- [ ] Logout clears session

### 2. Onboarding Flows (10 min)
- [ ] Athlete 8-step onboarding completes
- [ ] Parent 3-step onboarding completes
- [ ] Agency 4-step onboarding completes
- [ ] Profile data saves to database
- [ ] Profile completion percentage calculates

### 3. Core Features (10 min)
- [ ] Dashboard loads with correct data
- [ ] AI chat responds to messages
- [ ] Chat history persists
- [ ] Quiz system loads questions
- [ ] Badge system displays correctly

### 4. Rate Limiting (5 min)
- [ ] Send 21 chat messages in 1 minute - should block on 21st
- [ ] Verify 429 response includes retry-after header
- [ ] Rate limit resets after window expires

### 5. Security (5 min)
- [ ] Protected routes redirect to login
- [ ] Users cannot access other users' data
- [ ] API routes reject unauthenticated requests
- [ ] Service role key not exposed to client

---

## Rate Limit Configuration

| Endpoint | Max Requests | Window | Purpose |
|----------|-------------|--------|---------|
| /api/chat/ai | 20 | 1 min | AI chat abuse prevention |
| /api/auth/create-profile | 5 | 60 min | Signup abuse prevention |
| /api/auth/complete-onboarding | 3 | 60 min | Onboarding abuse prevention |
| /api/fmv/calculate | 10 | 5 min | FMV calculation limiting |
| /api/profile/update | 30 | 5 min | Profile update limiting |
| /api/matchmaking/* | 10 | 1 min | Matchmaking abuse prevention |

---

## Rollback Procedure

### Immediate Rollback (< 5 min)
1. In Vercel Dashboard: Deployments → Select previous working deployment → "..." → "Promote to Production"
2. Verify site is working on previous version
3. Investigate issues before re-deploying

### Database Rollback (If migrations fail)
```sql
-- Rollback rate limiting (if needed)
DROP TABLE IF EXISTS api_rate_limits CASCADE;
DROP TABLE IF EXISTS anon_rate_limits CASCADE;
DROP FUNCTION IF EXISTS check_api_rate_limit CASCADE;
DROP FUNCTION IF EXISTS check_anon_rate_limit CASCADE;
DROP FUNCTION IF EXISTS get_rate_limit_remaining CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_rate_limits CASCADE;
```

### Environment Rollback
1. Revert environment variables to previous values in Vercel
2. Trigger redeploy
3. Verify functionality restored

---

## Emergency Contacts & Resources

### Supabase
- Dashboard: https://supabase.com/dashboard
- Status: https://status.supabase.com
- Docs: https://supabase.com/docs

### Vercel
- Dashboard: https://vercel.com/dashboard
- Status: https://vercel-status.com
- Docs: https://vercel.com/docs

### OpenAI
- Dashboard: https://platform.openai.com
- Status: https://status.openai.com
- Usage: https://platform.openai.com/usage

---

## Known Limitations

1. **Mobile keyboard handling** - Virtual keyboard may obscure input on some devices
2. **Chat session naming** - Auto-generated names use first message content
3. **State filtering in RAG** - TODO in lib/ai/rag.ts:65 (non-critical, uses fallback)

---

## Maintenance Tasks

### Daily
- Monitor rate limit tables for abuse patterns
- Check error logs in Vercel

### Weekly
- Run `cleanup_old_rate_limits()` function
- Review user signup patterns
- Check OpenAI usage/billing

### Monthly
- Audit RLS policies
- Review and rotate API keys if needed
- Update dependencies

---

**Document generated:** December 4, 2025
**Status:** Ready for Launch
