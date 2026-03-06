# ChatNIL - Secrets Manifest

**Last Updated:** March 2026

---

## Environment Variables by Service

### Supabase (Database & Auth) - REQUIRED

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin key - bypasses RLS. Keep secret. |
| `SUPABASE_URL` | Server only | Same as NEXT_PUBLIC_SUPABASE_URL (used by some server libs) |

**Where to find:** Supabase Dashboard > Project Settings > API

### OpenAI - REQUIRED

| Variable | Scope | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | Server only | Used for AI chat, document analysis, embeddings |

**Where to find:** platform.openai.com > API Keys

### Resend (Email) - REQUIRED

| Variable | Scope | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | Server only | Sends transactional emails (welcome, deal notifications, invites) |

**Where to find:** resend.com > Dashboard > API Keys

### Application - REQUIRED

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | Client + Server | Base URL. Local: `http://localhost:3000`, Prod: `https://chatnil-io.vercel.app` |

### Perplexity AI - OPTIONAL

| Variable | Scope | Description |
|----------|-------|-------------|
| `PERPLEXITY_API_KEY` | Server only | Enhanced AI search capabilities |

### PostHog Analytics - OPTIONAL

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Client | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Client | PostHog host (default: `https://app.posthog.com`) |
| `POSTHOG_API_KEY` | Server only | Server-side analytics key |

### Cron & Security - OPTIONAL

| Variable | Scope | Description |
|----------|-------|-------------|
| `CRON_SECRET` | Server only | Bearer token for cron job authentication |
| `RATE_LIMIT_SALT` | Server only | Salt for rate limit IP hashing (default: `chatnil`) |
| `NEXT_PUBLIC_DEV_MODE` | Client | Enables dev-mode UI features when set |

---

## Production Values Location

All production environment variables are stored in:

**Vercel Dashboard** > chatnil-io project > Settings > Environment Variables

To view or edit: https://vercel.com/verrel-brice-jrs-projects/chatnil-io/settings/environment-variables

---

## Security Classification

| Level | Variables | Notes |
|-------|-----------|-------|
| **Critical** | `SUPABASE_SERVICE_ROLE_KEY` | Bypasses all RLS - full DB admin access |
| **High** | `OPENAI_API_KEY`, `RESEND_API_KEY`, `PERPLEXITY_API_KEY` | Billed API access |
| **Medium** | `CRON_SECRET`, `RATE_LIMIT_SALT` | Internal security |
| **Public** | `NEXT_PUBLIC_*` vars | Safe for browser exposure |

---

## Credential Rotation Schedule

| Service | Recommended | Action |
|---------|------------|--------|
| Supabase Service Key | Annually or if compromised | Rotate in Supabase Dashboard, update Vercel |
| OpenAI API Key | Annually or if compromised | Rotate in OpenAI Dashboard, update Vercel |
| Resend API Key | Annually or if compromised | Rotate in Resend Dashboard, update Vercel |
| Cron Secret | Annually | Generate new: `openssl rand -base64 32` |

---

## Transfer Checklist

- [ ] New owner has Supabase project access (Owner role)
- [ ] New owner has Vercel project access (Owner role)
- [ ] New owner has OpenAI account with API key
- [ ] New owner has Resend account with verified domain
- [ ] All env vars copied to new owner's accounts
- [ ] Old API keys rotated/revoked after transfer
