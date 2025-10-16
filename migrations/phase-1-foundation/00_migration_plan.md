# Migration Plan: Phase 1 Foundation

**Status**: ✅ Complete (All migrations applied)
**Date Range**: September 23, 2025 - October 2, 2025
**Database**: Supabase Cloud (enbuwffusjhpcyoveewb)
**Total Migrations**: 14

---

## Executive Summary

This document outlines the complete Phase 1 database architecture for ChatNIL.io, an AI-powered NIL (Name, Image, Likeness) guidance platform serving student-athletes, parents/guardians, and coaches.

**Goals Achieved**:
- ✅ Multi-role user system (athlete, parent, coach)
- ✅ Comprehensive profile management
- ✅ Secure relationship system (parent-athlete, coach-athlete)
- ✅ Full-featured chat system (sessions, messages, attachments)
- ✅ Gamification (badges + quizzes)
- ✅ Row Level Security (RLS) across all tables
- ✅ File storage (profile images)

---

## Database Architecture

### Schema Design Philosophy

**1. Role-Based Single Table Design**
- **Decision**: One `users` table for all roles (athlete, parent, coach)
- **Rationale**:
  - Single authentication ID → single user record
  - Simplifies auth flows (Supabase Auth integration)
  - Reduces JOIN complexity for common queries
  - Nullable role-specific fields keep table clean

**2. Extended Profile Tables**
- **Decision**: Separate tables for athlete/parent/coach-specific data
- **Rationale**:
  - Normalization (avoid sparse columns)
  - Role-specific optimizations
  - Future extensibility without bloating main table
  - Clear separation of concerns

**3. Relationship Management**
- **Decision**: Separate junction tables with composite keys
- **Rationale**:
  - Many-to-many relationships (1 parent → many athletes, 1 coach → many athletes)
  - Permission granularity per relationship
  - Verification workflow support
  - No redundant ID column

**4. JSONB for Flexible Data**
- **Decision**: Use JSONB for permissions, social media, preferences
- **Rationale**:
  - Schema flexibility (add/remove fields without migrations)
  - Queryable (Postgres JSONB operators)
  - Perfect for permission sets (can vary per relationship)

---

## Migration Timeline

### Week 1: Foundation (Sept 23-24)

**Migration 001: Initial Schema** (`001_initial_schema.sql`)
- Created `users` table (core fields)
- Created `athlete_profiles` table
- Created `parent_profiles` table
- Created `coach_profiles` table
- Created `chat_sessions` table
- Created `chat_messages` table
- Created `chat_attachments` table

**Key Fields** (users table):
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
email TEXT UNIQUE NOT NULL
role TEXT CHECK (role IN ('athlete', 'parent', 'coach'))
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

**Migration 002: Onboarding Fields** (`002_add_onboarding_fields.sql`)
- Added `onboarding_completed BOOLEAN DEFAULT FALSE`
- Added `onboarding_completed_at TIMESTAMPTZ`
- Added tracking for multi-step onboarding flows

### Week 2: Multi-Role Support (Sept 27-28)

**Migration 003: Extended User Fields** (`003_extend_users_for_parent_coach.sql`)
- Added **35+ fields** to `users` table:
  - Personal: `first_name`, `last_name`, `date_of_birth`, `phone`, `parent_email`
  - Academic: `school_name`, `graduation_year`, `major`, `gpa`
  - Athletic: `primary_sport`, `position`, `achievements[]`
  - NIL: `nil_interests[]`, `nil_concerns[]`, `social_media_handles`
  - Coach: `title`, `division`, `team_name`, `managed_athletes[]`
  - Parent: `connected_athletes[]`, `relationship_type`, `dashboard_access_level`
  - Settings: `notification_preferences`, `compliance_settings`

**Design Note**: All role-specific fields are nullable. The `role` field determines which fields are relevant.

**Migration 004: Relationship Tables** (`004_create_relationship_tables.sql`)
- Created `parent_athlete_relationships`:
  ```sql
  PRIMARY KEY (parent_id, athlete_id)
  relationship_type ENUM (mother, father, guardian, step_parent, other)
  permissions JSONB
  verified BOOLEAN DEFAULT FALSE
  ```

- Created `coach_athlete_relationships`:
  ```sql
  PRIMARY KEY (coach_id, athlete_id)
  team_role ENUM (starter, bench, redshirt, walk_on, injured_reserve)
  sport TEXT
  season TEXT (e.g., "2024-2025")
  permissions JSONB
  active BOOLEAN DEFAULT TRUE
  ```

**Permission Schema Examples**:
```jsonb
// Parent permissions
{
  "view_nil_activities": true,
  "approve_contracts": true,
  "receive_notifications": true,
  "access_financial_info": false
}

// Coach permissions
{
  "view_nil_activities": true,
  "provide_guidance": true,
  "receive_reports": true,
  "manage_compliance": true
}
```

**Migration 005 (Duplicate Number!): Multiple Files**
- `005_create_multiple_athlete_tables.sql` - Enhanced athlete profile schema
- `005_create_profile_images_storage.sql` - Supabase Storage bucket setup

**Note**: Two files numbered 005 - this is a historical quirk. Both are required.

### Week 3: Gamification (Sept 28-30)

**Migration 006: Badges Table** (`006_create_badges_table.sql`)
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category ENUM (learning, engagement, social, achievement, milestone),
  rarity ENUM (common, uncommon, rare, epic, legendary),
  criteria JSONB,  -- Earning conditions
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);
```

**Badge Categories**:
- **Learning**: Complete quizzes, read resources
- **Engagement**: Streak days, message count
- **Social**: Share content, referrals
- **Achievement**: Profile completion, milestones
- **Milestone**: First NIL deal, 100 chats

**Migration 007: User Badges** (`007_create_user_badges_table.sql`)
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress JSONB,  -- For multi-step badges
  is_displayed BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);
```

**Migration 008: Quiz Questions** (`008_create_quiz_questions_table.sql`)
```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB,  -- Array of answer options
  correct_answer JSONB,
  correct_answer_index INTEGER,
  explanation TEXT,
  learning_resources JSONB,  -- Links to docs/articles
  category ENUM (nil_basics, contracts, branding, social_media,
                compliance, tax_finance, negotiation, legal,
                marketing, athlete_rights),
  difficulty ENUM (beginner, intermediate, advanced, expert),
  tags TEXT[],
  points INTEGER DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 60,
  target_roles TEXT[],  -- Which roles should see this question
  times_answered INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0
);
```

**Quiz Categories** (10 total):
- `nil_basics` - What is NIL? Rules overview
- `contracts` - Contract terms, review
- `branding` - Personal brand, social media
- `social_media` - Platform strategies
- `compliance` - NCAA, state laws
- `tax_finance` - Tax obligations, finances
- `negotiation` - Deal negotiation tactics
- `legal` - Legal rights, protections
- `marketing` - Self-marketing strategies
- `athlete_rights` - Rights and advocacy

**Migration 009: Quiz Progress** (`009_create_user_quiz_progress_table.sql`)
```sql
CREATE TABLE user_quiz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  status ENUM (in_progress, completed, abandoned),
  user_answer JSONB,
  user_answer_index INTEGER,
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  points_earned INTEGER DEFAULT 0,
  confidence_level INTEGER,  -- 1-5 scale
  hints_used INTEGER DEFAULT 0,
  resources_viewed TEXT[],
  quiz_session_id UUID,
  session_score INTEGER,
  session_total_questions INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

**Features**:
- Track multiple attempts per question
- Record time taken + confidence
- Session-based quizzes (multiple questions)
- Learning resource tracking (which resources helped?)

### Week 4: Chat System Enhancement (Sept 30)

**Migration 010: Enhanced Chat Sessions** (`010_create_chat_sessions_table.sql`)
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  role_context TEXT,  -- Snapshot of user role at session start
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  draft TEXT,  -- Auto-saved draft message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New Features**:
- Pin important sessions
- Archive old sessions
- Draft auto-save
- Role context capture (for AI personalization)

**Migration 011: Enhanced Chat Messages** (`011_create_chat_messages_table.sql`)
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role ENUM (user, assistant),
  attachments JSONB,  -- File metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration 012: Chat Attachments** (`012_create_chat_attachments_table.sql`)
```sql
CREATE TABLE chat_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Supported File Types**:
- **Documents**: PDF, DOCX, TXT (for contract review)
- **Images**: PNG, JPG, GIF, WebP (for screenshots)
- **Max size**: 50MB per file

### Week 5: Refinements (Oct 1-2)

**Migration 013: Athlete Field Additions** (`013_add_missing_athlete_fields.sql`)
- Added missing fields discovered during onboarding development
- Ensured parity between TypeScript types and database schema

**Migration 014: RLS Policy Fixes** (`014_fix_badge_rls_policies.sql`)
- Fixed Row Level Security policies for badges system
- Ensured users can only see their own badges
- Service role can manage all badges (for admin operations)

---

## Row Level Security (RLS)

### Policy Structure

**Pattern**: All tables follow the same RLS pattern:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Users can read their own records
CREATE POLICY "table_select_own" ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own records
CREATE POLICY "table_update_own" ON table_name
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "table_insert_own" ON table_name
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role has full access (for API routes)
CREATE POLICY "service_role_all" ON table_name
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

### Tables with RLS Enabled

✅ `users` - Own record only
✅ `athlete_profiles` - Own profile only
✅ `parent_profiles` - Own profile only
✅ `coach_profiles` - Own profile only
✅ `parent_athlete_relationships` - Own relationships only
✅ `coach_athlete_relationships` - Own relationships only
✅ `chat_sessions` - Own sessions only
✅ `chat_messages` - Own session messages only
✅ `chat_attachments` - Own attachments only
✅ `badges` - All users can read, service role can manage
✅ `user_badges` - Own badges only
✅ `quiz_questions` - All users can read, service role can manage
✅ `user_quiz_progress` - Own progress only

### Service Role Usage

**When to Use Service Role**:
- Profile creation (user doesn't exist yet)
- Admin operations (update any user)
- Relationship verification (check both users)
- System operations (badge awarding, quiz seeding)

**Implementation** (Next.js API routes):
```typescript
import { supabaseAdmin } from '@/lib/supabase';

// Service role bypasses RLS
const { data, error } = await supabaseAdmin
  .from('users')
  .update({ onboarding_completed: true })
  .eq('id', userId);
```

---

## Storage Buckets

### Profile Images Bucket

**Created in**: `005_create_profile_images_storage.sql`

**Configuration**:
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');
```

**Usage**:
- Path structure: `profile-images/{user_id}/{filename}`
- Max size: 5MB (enforced in application)
- Allowed formats: JPG, PNG, WebP
- Public read access (for displaying avatars)

---

## Indexes

### Performance Optimizations

**Primary Keys** (automatic indexes):
- All tables have UUID primary keys
- Composite keys on relationship tables

**Foreign Keys** (automatic indexes):
- All `user_id` columns
- All `session_id`, `message_id`, `badge_id`, `question_id` columns

**Custom Indexes** (needed):
```sql
-- Users table (frequent queries)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_onboarding ON users(onboarding_completed);

-- Chat sessions (sorting)
CREATE INDEX idx_chat_sessions_updated ON chat_sessions(updated_at DESC);

-- Chat messages (chronological order)
CREATE INDEX idx_chat_messages_session_created ON chat_messages(session_id, created_at);

-- Quiz questions (filtering)
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);

-- User quiz progress (analytics)
CREATE INDEX idx_quiz_progress_user_question ON user_quiz_progress(user_id, question_id);
```

**Note**: Some of these indexes may have been created automatically by Supabase. Verify with `\di` in SQL console.

---

## Data Validation

### Database Constraints

**ENUMs** (enforced at DB level):
- `users.role` → `athlete`, `parent`, `coach`
- `chat_messages.role` → `user`, `assistant`
- `badges.category` → 5 options
- `badges.rarity` → 5 options
- `quiz_questions.category` → 10 options
- `quiz_questions.difficulty` → 4 options
- `user_quiz_progress.status` → 3 options

**CHECK Constraints**:
- Email format validation (handled by Supabase Auth)
- GPA range (0.0 - 4.0)
- Graduation year (1900 - 2100)
- File size limits (via application)

**UNIQUE Constraints**:
- `users.email` (unique)
- `(parent_id, athlete_id)` in relationships (composite key = unique)
- `(coach_id, athlete_id)` in relationships (composite key = unique)

### Application-Level Validation (Zod)

**TypeScript Schemas** (used in forms):
```typescript
// Example: Athlete onboarding
export const athletePersonalInfoSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  dateOfBirth: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, "10 digits").optional(),
  email: z.string().email("Invalid email"),
  parentEmail: z.string().email().optional(),
});
```

**Locations**:
- Onboarding steps: Zod schemas in each step component
- API routes: Validation before database operations
- Profile updates: Inline validation in forms

---

## Migration Best Practices

### Lessons Learned from Phase 1

**1. Avoid Duplicate Migration Numbers**
- ❌ We have two `005_*` files (not ideal)
- ✅ Going forward: Strict sequential numbering

**2. Test Locally Before Production**
- ✅ Use Supabase local dev environment (future)
- ✅ Test migrations on a staging project first

**3. Document Breaking Changes**
- ✅ RLS policy changes can break existing queries
- ✅ Always test with both anon key and service role

**4. Keep Migrations Atomic**
- ✅ One logical change per migration
- ✅ Easy to debug and rollback if needed

**5. Use Descriptive Names**
- ✅ `003_extend_users_for_parent_coach.sql` is clear
- ❌ `003_update_users.sql` is vague

### Migration Template (Future)

```sql
-- Migration: 015_descriptive_name
-- Purpose: Brief description of what this migration does
-- Date: YYYY-MM-DD
-- Author: Name

-- Step 1: Add new column
ALTER TABLE table_name
ADD COLUMN new_column TYPE DEFAULT value;

-- Step 2: Create index
CREATE INDEX idx_table_new_column ON table_name(new_column);

-- Step 3: Add RLS policy
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);

-- Step 4: Verify
SELECT * FROM table_name LIMIT 1;

-- Rollback (if needed):
-- ALTER TABLE table_name DROP COLUMN new_column;
-- DROP POLICY "policy_name" ON table_name;
```

---

## Rollback Strategy

### Emergency Rollback Procedures

**Scenario 1: Migration Causes Data Loss**
1. Immediately stop new migrations
2. Restore from Supabase automatic backup (7-day retention)
3. Identify problematic migration
4. Write corrective migration

**Scenario 2: RLS Policies Block Access**
1. Connect with service role key (bypasses RLS)
2. Identify problematic policy
3. Drop policy: `DROP POLICY "policy_name" ON table_name;`
4. Recreate correct policy

**Scenario 3: Schema Conflict**
1. Use `ALTER TABLE ... DROP COLUMN` to remove problematic column
2. Fix data type mismatch
3. Re-add column with correct type

**Backup Strategy**:
- Supabase automatic backups (every 24 hours, 7-day retention on free tier)
- Manual exports before major migrations
- Point-in-time recovery (Pro tier)

### Safe Migration Checklist

Before applying a migration:
- [ ] Tested in local Supabase instance
- [ ] Reviewed SQL syntax (no typos)
- [ ] RLS policies won't lock users out
- [ ] No destructive operations (DROP, TRUNCATE)
- [ ] Backup created (if production)
- [ ] Team notified (if shared project)

---

## Next Phase: Phase 2 - NIL Deal Tracking

### Planned Tables (Future)

**NIL Deals**:
```sql
CREATE TABLE nil_deals (
  id UUID PRIMARY KEY,
  athlete_id UUID REFERENCES users(id),
  brand_name TEXT NOT NULL,
  deal_type ENUM (endorsement, appearance, social_media, autograph),
  status ENUM (pending, active, completed, cancelled),
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  contract_file_path TEXT,  -- Storage path
  compliance_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Brand Partnerships**:
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  target_sports TEXT[],
  active_deals_count INTEGER DEFAULT 0
);
```

**Financial Tracking**:
```sql
CREATE TABLE nil_transactions (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES nil_deals(id),
  athlete_id UUID REFERENCES users(id),
  transaction_type ENUM (payment_received, tax_payment, fee),
  amount DECIMAL(10,2),
  transaction_date DATE,
  notes TEXT
);
```

### Estimated Timeline

- **Phase 2 Planning**: 1-2 weeks
- **Phase 2 Development**: 3-4 weeks
- **Phase 2 Testing**: 1 week
- **Phase 2 Deployment**: Rolling basis

---

## Resources

### Documentation
- [Supabase Dashboard](https://app.supabase.com/project/enbuwffusjhpcyoveewb)
- [Supabase Docs - RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Docs - JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [System Breakdown](../../SYSTEM_BREAKDOWN.md)

### Tools
- **Supabase SQL Editor** - Run queries, test migrations
- **Supabase Table Editor** - Visual schema exploration
- **Supabase Auth** - User management
- **Supabase Storage** - File uploads

### Monitoring
- **Database Size**: Check in Supabase Dashboard → Database → Database Size
- **Query Performance**: Use Supabase Dashboard → Database → Slow Queries
- **RLS Policy Hits**: Check logs for RLS violations

---

## Appendix: Complete Table List

| # | Table Name | Rows (Estimate) | Purpose |
|---|-----------|----------------|---------|
| 1 | `users` | 1,000+ | Main user profiles (all roles) |
| 2 | `athlete_profiles` | 600+ | Extended athlete data |
| 3 | `parent_profiles` | 250+ | Extended parent data |
| 4 | `coach_profiles` | 150+ | Extended coach data |
| 5 | `parent_athlete_relationships` | 300+ | Parent-athlete connections |
| 6 | `coach_athlete_relationships` | 500+ | Coach-athlete connections |
| 7 | `chat_sessions` | 2,000+ | Conversation sessions |
| 8 | `chat_messages` | 10,000+ | Individual messages |
| 9 | `chat_attachments` | 500+ | File uploads |
| 10 | `badges` | 50 | Badge definitions (seeded) |
| 11 | `user_badges` | 5,000+ | Earned badges |
| 12 | `quiz_questions` | 200 | Quiz bank (seeded) |
| 13 | `user_quiz_progress` | 3,000+ | Quiz attempts |
| 14 | `storage.objects` | 1,000+ | Stored files (profile images, attachments) |

**Total Database Size (Estimated)**: 100-200 MB (early stage)

---

**Document Version**: 1.0
**Last Updated**: October 15, 2025
**Status**: Phase 1 Complete ✅
**Next Phase**: Phase 2 - NIL Deal Tracking (TBD)
