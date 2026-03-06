# ChatNIL - Architecture Overview

**Last Updated:** March 2026

---

## System Architecture

```
                          +------------------+
                          |     Vercel       |
                          |   (Hosting)      |
                          +--------+---------+
                                   |
                          +--------+---------+
                          |   Next.js 14     |
                          |   App Router     |
                          +--------+---------+
                                   |
              +--------------------+--------------------+
              |                    |                    |
    +---------+--------+  +-------+--------+  +--------+---------+
    |  React Client    |  |  API Routes    |  |  Server Actions  |
    |  (Browser)       |  |  /api/*        |  |  (SSR Pages)     |
    +---------+--------+  +-------+--------+  +--------+---------+
              |                    |                    |
              |           +-------+--------+           |
              |           |  Business      |           |
              |           |  Logic (lib/)  |           |
              |           +-------+--------+           |
              |                    |                    |
    +---------+--------------------+--------------------+---------+
    |                         Supabase                            |
    |  +------------+  +----------+  +---------+  +----------+   |
    |  | PostgreSQL |  |   Auth   |  | Storage |  |   RLS    |   |
    |  +------------+  +----------+  +---------+  +----------+   |
    +---------------------------------------------------------+  |
                                                                  |
    +---------------------+  +------------------+                 |
    |      OpenAI         |  |     Resend       |                 |
    |  (Chat, Analysis,   |  |  (Transactional  |                 |
    |   Embeddings)       |  |   Email)         |                 |
    +---------------------+  +------------------+
```

---

## User Roles & Access

| Role | Dashboard | Key Features |
|------|-----------|-------------|
| `hs_student` | Gamified learning | Quizzes, badges, XP, streaks, daily challenges |
| `college_athlete` | Deal management | Deal validation, FMV calculator, tax tracker, reminders |
| `parent` | Oversight | View linked athlete activity, consent management |
| `compliance_officer` | Enterprise review | Deal approval/rejection, audit logs, athlete roster |
| `agency` | Campaign management | Athlete discovery, matchmaking, campaign tracking |
| `brand` | Partnership discovery | Athlete search, opportunity posting |

Helper: `isAthleteRole(role)` checks for `hs_student`, `college_athlete`, or `athlete` (legacy).

---

## Data Flow: Core Paths

### 1. AI Chat

```
User Message -> /api/chat -> lib/ai/get-prompt-for-role.ts -> OpenAI GPT-4
                                                            -> Response streamed to client
```

Role-specific system prompts loaded based on `user.role`. Chat history stored in `chat_sessions` + `chat_messages`.

### 2. Deal Validation

```
Athlete fills wizard -> POST /api/deals -> Stored in DB
                     -> POST /api/deals/[id]/submit-to-compliance
                     -> Compliance Officer sees in dashboard
                     -> Approve/Reject/Request Info via PATCH /api/compliance/*
                     -> Notification sent to athlete
```

### 3. FMV Calculation

```
Athlete profile data -> lib/fmv/calculator.ts -> Weighted scoring algorithm
                     -> Social media stats, sport, school level, engagement
                     -> Stored in athlete_fmv_data table
                     -> Recalculated daily via /api/cron/fmv-daily-recalculation
```

---

## Database Schema (Key Tables)

### Core User Tables
- `auth.users` - Supabase auth (email, password)
- `public.users` - App user data (role, name, onboarding state)
- `athlete_profiles` - Sport, school, GPA, social links
- `athlete_public_profiles` - Public-facing profile data, social stats, FMV

### Chat System
- `chat_sessions` - Conversation threads per user
- `chat_messages` - Individual messages (user + assistant)
- `chat_attachments` - Uploaded files

### Deal & Compliance
- `nil_deals` - Deal records with status workflow
- `deal_analyses` - AI-generated deal analysis
- `compliance_reviews` - Officer review decisions

### Notifications & Reminders
- `notifications` - System notifications (all roles)
- `user_reminders` - User-set reminders (athletes)

### Education
- `quiz_questions` - Quiz content by category/difficulty
- `user_quiz_progress` - Quiz attempts and scores
- `badges` / `user_badges` - Achievement system

### Agency & Matching
- `campaigns` - Agency campaigns
- `campaign_athletes` - Matched athletes per campaign
- `athlete_matches` - Matchmaking results

### All tables have Row Level Security (RLS) enabled.

---

## API Route Organization

```
app/api/
  auth/          # Login, signup, session management
  chat/          # AI chat sessions and messages
  dashboard/     # Role-specific dashboard data endpoints
    college-athlete/v2/   # College athlete dashboard aggregator
    hs-student/           # HS student dashboard
  deals/         # Deal CRUD, validation, submission
  compliance/    # Compliance officer actions (approve, reject, override)
  fmv/           # Fair Market Value calculations
  notifications/ # Notification CRUD
  reminders/     # Reminder CRUD (create, list, complete/dismiss)
  quizzes/       # Quiz taking and results
  profile/       # User profile read/update
  athletes/      # Public athlete profiles
  campaigns/     # Agency campaign management
  matches/       # Athlete-brand matchmaking
  cron/          # Scheduled jobs (FMV recalc, rankings sync)
  email/         # Email sending and summaries
  documents/     # Document upload and AI analysis
```

---

## Key Libraries & Patterns

### Authentication Pattern

API routes use cookie-based auth with `sb-access-token`:

```typescript
const cookieStore = await cookies();
const accessToken = cookieStore.get('sb-access-token')?.value;
const { data: { user } } = await supabase.auth.getUser(accessToken);
```

### Supabase Client Pattern

- **Browser:** `lib/supabase-client.ts` (anon key, client-side)
- **Server (user context):** Cookie-based auth in API routes
- **Server (admin):** `lib/supabase/admin.ts` (service role key, bypasses RLS)

### Tables Not in TypeScript Types

Some tables are not in the generated `Database` type and require raw `fetch()`:
- `athlete_public_profiles`, `social_media_stats`, `nil_deals`
- `athlete_fmv_data`, `user_trait_results`, `state_nil_rules`

Always use `cache: 'no-store'` with raw fetch (Next.js 14 caches by default).

---

## Infrastructure

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| **Vercel** | Hosting, CDN, serverless functions | vercel.com |
| **Supabase** | Database, auth, storage, realtime | supabase.com |
| **OpenAI** | AI chat, document analysis | platform.openai.com |
| **Resend** | Transactional email | resend.com |
| **PostHog** | Analytics (optional) | posthog.com |
| **GitHub** | Source code | github.com/DetroitRed03/ChatNIL.io |

---

## Performance Considerations

- **Notification polling:** 5-minute intervals (not real-time)
- **FMV recalculation:** Daily cron job, not on-demand
- **Dashboard data:** Single aggregated API call per role (e.g., `/api/dashboard/college-athlete/v2`)
- **AI responses:** Streamed via SSE for perceived speed
- **Static pages:** Pre-rendered at build time where possible
