# Getting Started with Phase 1 Migrations

**Quick Start Guide** for developers joining the ChatNIL.io project.

---

## What You'll Find Here

This `phase-1-foundation` directory contains:

📁 **README.md** - Directory overview and migration status
📋 **00_migration_plan.md** - Comprehensive Phase 1 architecture documentation
🔧 **SUPABASE_MCP_GUIDE.md** - Guide to using Supabase MCP with Claude
📝 **GETTING_STARTED.md** - This file (quick start for developers)

---

## For New Developers

### 1. Understand the Current State

**Database Status**: ✅ Phase 1 Complete
- **14 migrations** already applied to production Supabase
- **14 tables** created (users, profiles, chat, badges, quizzes)
- **Row Level Security** enabled on all tables
- **Storage bucket** set up for profile images

**Migration Files Location**: [`/migrations`](../) (root directory)

### 2. Read the Documentation

**Start here** (in order):
1. [README.md](README.md) - Get oriented (5 min read)
2. [00_migration_plan.md](00_migration_plan.md) - Understand architecture (20 min read)
3. [SUPABASE_MCP_GUIDE.md](SUPABASE_MCP_GUIDE.md) - Learn to use MCP tools (10 min read)

### 3. Explore the Database

**Option A: Supabase Dashboard** (Visual)
1. Go to: https://app.supabase.com/project/enbuwffusjhpcyoveewb
2. Navigate to **Table Editor** → See all tables visually
3. Click any table → View schema, data, relationships

**Option B: Supabase MCP** (via Claude - Recommended!)
1. Restart Claude Desktop (to load MCP server)
2. Try: `"List all tables in my Supabase project"`
3. Explore: `"Show me the schema for the users table"`
4. Query: `"How many users have completed onboarding?"`

**Option C: SQL Editor** (Advanced)
1. Supabase Dashboard → **SQL Editor**
2. Run: `\dt` (list all tables)
3. Run: `\d users` (describe users table)

### 4. Set Up Your Development Environment

**Required**:
```bash
# 1. Clone repository (if not already)
git clone <your-repo-url>
cd ChatNIL.io

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

**Supabase Credentials** (from `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (for API routes)

### 5. Test the Application

**User Flows to Test**:
1. **Signup** → Select role → Complete onboarding → Land on chat
2. **Login** → Access profile → Edit fields → Save changes
3. **Chat** → Send message → View history (AI responses pending)
4. **Badges** → View earned badges (if any seeded)
5. **Quizzes** → Take a quiz (if questions seeded)

**Test Users** (if seeded in your database):
- Check Supabase Dashboard → Authentication → Users
- Or query: `"Show me all users in the database"`

---

## For Existing Developers

### Adding a New Migration

**Process**:
1. **Plan the change** - What tables/columns do you need?
2. **Check existing schema** - Does it already exist?
   - Via MCP: `"Does the users table have a 'bio' column?"`
   - Via Dashboard: Table Editor → users → Columns
3. **Create migration file**:
   ```bash
   touch migrations/015_descriptive_name.sql
   ```
4. **Write SQL** (or generate via MCP):
   ```
   "Generate a migration to add a 'bio' column (TEXT) to the users table"
   ```
5. **Review SQL** - Check syntax, RLS policies, indexes
6. **Test locally** - Apply to local Supabase instance (if using)
7. **Apply to production**:
   - Supabase Dashboard → SQL Editor
   - Paste migration SQL → Run
8. **Update TypeScript types** - Edit [`lib/types.ts`](../../lib/types.ts)
9. **Test application** - Verify UI works with new schema

**Migration Template**:
```sql
-- Migration: 015_add_user_bio
-- Purpose: Add bio field for user profiles
-- Date: 2025-10-15

ALTER TABLE users
ADD COLUMN bio TEXT;

-- Create index if needed for searching
CREATE INDEX idx_users_bio ON users USING gin(to_tsvector('english', bio));

-- Update RLS policies if needed
-- (Bio should be readable by the user themselves)

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'bio';
```

### Modifying Existing Tables

**Best Practices**:
- ✅ Add columns with `ALTER TABLE ... ADD COLUMN`
- ✅ Make new columns nullable (or provide defaults)
- ❌ Avoid `DROP COLUMN` (data loss risk)
- ❌ Avoid `ALTER COLUMN TYPE` (can break existing data)
- ✅ Create new tables for new features
- ✅ Add indexes for frequently queried columns

**Example**:
```sql
-- Good: Add nullable column
ALTER TABLE users ADD COLUMN twitter_handle TEXT;

-- Good: Add column with default
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Risky: Drop column (data loss!)
ALTER TABLE users DROP COLUMN old_field;  -- ⚠️ Careful!

-- Risky: Change type (can fail if data incompatible)
ALTER TABLE users ALTER COLUMN graduation_year TYPE BIGINT;  -- ⚠️ Test first!
```

### Working with RLS Policies

**Pattern for New Tables**:
```sql
-- 1. Create table
CREATE TABLE new_table (...);

-- 2. Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- 3. Allow users to read their own records
CREATE POLICY "new_table_select_own" ON new_table
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Allow users to insert their own records
CREATE POLICY "new_table_insert_own" ON new_table
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow users to update their own records
CREATE POLICY "new_table_update_own" ON new_table
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Service role bypass (for API routes)
CREATE POLICY "service_role_all" ON new_table
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

**Testing RLS**:
```sql
-- Test as authenticated user (anon key)
SELECT * FROM new_table WHERE user_id = 'some-user-id';

-- Test as service role
-- (Should return all rows, bypassing RLS)
```

---

## Common Tasks

### Task 1: Query User Data

**Via MCP**:
```
"Show me all athletes who have completed onboarding and have a GPA above 3.5"
```

**Via SQL**:
```sql
SELECT id, first_name, last_name, school_name, gpa
FROM users
WHERE role = 'athlete'
  AND onboarding_completed = true
  AND gpa > 3.5
ORDER BY gpa DESC;
```

### Task 2: Check Relationship Counts

**Via MCP**:
```
"How many parent-athlete relationships exist? How many are verified?"
```

**Via SQL**:
```sql
SELECT
  COUNT(*) as total_relationships,
  SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) as verified_count,
  SUM(CASE WHEN verified = false THEN 1 ELSE 0 END) as unverified_count
FROM parent_athlete_relationships;
```

### Task 3: Analyze Chat Activity

**Via MCP**:
```
"Show me the top 10 most active users by chat message count"
```

**Via SQL**:
```sql
SELECT
  u.id,
  u.email,
  u.role,
  COUNT(cm.id) as message_count
FROM users u
LEFT JOIN chat_sessions cs ON u.id = cs.user_id
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
GROUP BY u.id, u.email, u.role
ORDER BY message_count DESC
LIMIT 10;
```

### Task 4: Find Incomplete Profiles

**Via MCP**:
```
"Find all users who haven't completed onboarding, show their role and signup date"
```

**Via SQL**:
```sql
SELECT id, email, role, created_at
FROM users
WHERE onboarding_completed = false
ORDER BY created_at DESC;
```

### Task 5: Badge Progress

**Via MCP**:
```
"Show me badge earn rates - how many of each rarity have been earned?"
```

**Via SQL**:
```sql
SELECT
  b.rarity,
  COUNT(ub.id) as times_earned,
  COUNT(DISTINCT ub.user_id) as unique_users
FROM badges b
LEFT JOIN user_badges ub ON b.id = ub.badge_id
GROUP BY b.rarity
ORDER BY
  CASE b.rarity
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 2
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 4
    WHEN 'legendary' THEN 5
  END;
```

---

## Troubleshooting

### Issue: "Can't connect to Supabase"

**Check**:
1. `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Supabase project is active (not paused)
3. Internet connection is working

**Fix**:
```bash
# Verify environment variables
cat .env.local | grep SUPABASE

# Restart dev server
npm run dev
```

### Issue: "RLS policy preventing query"

**Understanding**:
- RLS (Row Level Security) restricts data access
- Anon key queries → RLS policies apply
- Service role queries → RLS bypassed

**Fix**:
```typescript
// Client-side (RLS applies)
import { supabase } from '@/lib/supabase-client';
const { data } = await supabase.from('users').select('*');
// Returns only authenticated user's record

// Server-side API route (RLS bypassed)
import { supabaseAdmin } from '@/lib/supabase';
const { data } = await supabaseAdmin.from('users').select('*');
// Returns all users (admin access)
```

### Issue: "Migration fails with error"

**Common Errors**:
1. **Column already exists** → Check schema first
2. **Foreign key violation** → Ensure referenced table exists
3. **Syntax error** → Review SQL carefully

**Debug**:
```
Via MCP: "Check if the users table already has a 'bio' column"
```

**Rollback** (if needed):
```sql
-- Undo last migration
ALTER TABLE users DROP COLUMN new_column;
```

### Issue: "TypeScript type errors after schema change"

**Fix**:
1. Update [`lib/types.ts`](../../lib/types.ts)
2. Regenerate types via MCP:
   ```
   "Generate TypeScript types for the users table"
   ```
3. Copy/paste into `lib/types.ts`
4. Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")

---

## Next Phase Planning

### Phase 2: NIL Deal Tracking (Planned)

**New Tables**:
- `nil_deals` - Brand partnerships, contracts
- `brands` - Brand directory
- `nil_transactions` - Financial tracking
- `deal_templates` - Contract templates
- `compliance_checks` - Automated compliance

**Estimated Timeline**: 3-4 weeks development

**When Phase 2 Begins**:
1. Create `migrations/phase-2-nil-deals/` directory
2. Write `phase-2-nil-deals/README.md`
3. Start with migration `015_*` in root `/migrations`

---

## Resources

### Documentation
- [Main README](../../README.md)
- [System Breakdown](../../SYSTEM_BREAKDOWN.md)
- [Phase 1 Migration Plan](00_migration_plan.md)
- [Supabase MCP Guide](SUPABASE_MCP_GUIDE.md)

### Tools
- **Supabase Dashboard**: https://app.supabase.com/project/enbuwffusjhpcyoveewb
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/current/

### Support
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: [Your repo issues page]

---

## Quick Reference

### Table List (14 tables)

| Table | Purpose |
|-------|---------|
| `users` | Main user profiles (all roles) |
| `athlete_profiles` | Extended athlete data |
| `parent_profiles` | Extended parent data |
| `coach_profiles` | Extended coach data |
| `parent_athlete_relationships` | Parent-athlete connections |
| `coach_athlete_relationships` | Coach-athlete connections |
| `chat_sessions` | Conversation sessions |
| `chat_messages` | Individual messages |
| `chat_attachments` | File uploads |
| `badges` | Badge definitions |
| `user_badges` | Earned badges |
| `quiz_questions` | Quiz bank |
| `user_quiz_progress` | Quiz attempts |
| `storage.objects` | Stored files (via Storage) |

### Key Relationships

```
users (1) → (N) athlete_profiles
users (1) → (N) parent_profiles
users (1) → (N) coach_profiles
users (1) → (N) chat_sessions → (N) chat_messages → (N) chat_attachments
users (1) → (N) user_badges ← (N) badges
users (1) → (N) user_quiz_progress ← (N) quiz_questions
users (M) ←→ (N) users (via parent_athlete_relationships)
users (M) ←→ (N) users (via coach_athlete_relationships)
```

### Environment Variables (`.env.local`)

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://enbuwffusjhpcyoveewb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEV_MODE=real

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_API_KEY=your-api-key
```

### Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint

# Supabase (if using local dev)
npx supabase start   # Start local Supabase
npx supabase status  # Check status
npx supabase db push # Push local schema to remote
```

---

**Last Updated**: October 15, 2025
**Phase 1 Status**: ✅ Complete
**Next Phase**: Phase 2 - NIL Deal Tracking (TBD)
**Questions?** Ask via Supabase MCP! 🚀
