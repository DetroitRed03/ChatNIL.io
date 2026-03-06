# ChatNIL

AI-powered NIL (Name, Image, Likeness) compliance and education platform for student athletes.

## Overview

ChatNIL helps student athletes, parents, compliance officers, and agencies navigate the evolving NIL landscape with AI-powered guidance, deal validation, and compliance tools.

### User Roles

- **High School Athletes** - Learn NIL rules, earn badges, complete quizzes, and build knowledge
- **College Athletes** - Manage deals, validate contracts, track FMV, and stay compliant
- **Parents** - Oversee athlete NIL activities, review deals, and manage consent
- **Compliance Officers** - Review deals, manage athlete rosters, and enforce institutional policies
- **Agencies** - Discover athletes, manage campaigns, and track matches
- **Brands** - Find athletes for partnerships and sponsorships

### Key Features

- AI chat assistant with role-specific NIL guidance
- Deal validation wizard with compliance scoring
- Fair Market Value (FMV) calculator
- Quiz and badge system for NIL education
- Notification and reminder system
- Document upload and contract analysis
- Geo-compliance with state-specific NIL rules
- Campaign matchmaking for agencies and brands

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **AI:** OpenAI GPT-4
- **Email:** Resend
- **Analytics:** PostHog (optional)
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- OpenAI API key

### Setup

```bash
# Clone and install
git clone <repo-url>
cd ChatNIL.io
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

See `.env.example` for all required and optional variables. At minimum you need:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `RESEND_API_KEY` - Resend email API key

### Database Setup

Apply migrations in order from the `supabase/migrations/` directory via the Supabase SQL Editor or CLI.

## Project Structure

```
app/                          # Next.js App Router pages & API routes
  api/                        # API routes (auth, chat, deals, compliance, etc.)
  (auth)/                     # Authentication pages (login, signup, verify)
  deals/                      # Deal management & validation
  compliance/                 # Compliance officer views
  agency/                     # Agency dashboard & campaigns
  quizzes/                    # Quiz system
  athletes/[username]/        # Public athlete profiles
components/                   # React components
  dashboard/                  # Role-specific dashboards
  deal-validation/            # Deal validation wizard
  compliance-dashboard/       # Compliance officer tools
  Navigation/                 # Header, sidebar, mobile menu
  notifications/              # Notification bell
  quiz/                       # Quiz taking & results
  ui/                         # Shared UI components
lib/                          # Utilities & business logic
  ai/                         # AI prompt engineering
  compliance/                 # Compliance scoring engine
  email/                      # Email templates & sending
  fmv/                        # Fair Market Value calculator
  supabase/                   # Database client helpers
supabase/migrations/          # SQL migration files
public/                       # Static assets
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add all environment variables from `.env.example`
3. Deploy via `vercel --prod` or push to `main`

### Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint

## Security

- Row Level Security (RLS) on all database tables
- Role-based access control across all API routes
- Cookie-based authentication with Supabase Auth
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas

## License

Proprietary. All rights reserved.
