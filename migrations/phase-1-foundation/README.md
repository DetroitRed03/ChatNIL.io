# Phase 1: Foundation Migrations

This directory contains the foundational database migrations for the ChatNIL.io project, organized for clarity and maintainability.

## Purpose

Phase 1 migrations establish the core database schema required for the ChatNIL platform:
- User authentication and profiles
- Role-based access (Athletes, Parents, Coaches)
- Relationship management (parent-athlete, coach-athlete connections)
- Chat system (sessions, messages, attachments)
- Gamification (badges, quizzes)
- Row Level Security (RLS) policies

## Migration Strategy

### Current State (Root `/migrations` folder)
The project has **14 existing migrations** (001-014) that have already been applied to the production Supabase database:

```
migrations/
├── 001_initial_schema.sql                    # Core users table
├── 002_add_onboarding_fields.sql            # Onboarding tracking
├── 003_extend_users_for_parent_coach.sql    # Multi-role support
├── 004_create_relationship_tables.sql       # Parent/Coach relationships
├── 005_create_multiple_athlete_tables.sql   # Extended profiles
├── 005_create_profile_images_storage.sql    # Storage bucket setup
├── 006_create_badges_table.sql              # Badge definitions
├── 007_create_user_badges_table.sql         # User badge progress
├── 008_create_quiz_questions_table.sql      # Quiz system
├── 009_create_user_quiz_progress_table.sql  # Quiz tracking
├── 010_create_chat_sessions_table.sql       # Chat conversations
├── 011_create_chat_messages_table.sql       # Chat messages
├── 012_create_chat_attachments_table.sql    # File attachments
├── 013_add_missing_athlete_fields.sql       # Athlete field additions
└── 014_fix_badge_rls_policies.sql           # RLS policy fixes
```

### Phase 1 Reorganization
This `phase-1-foundation` directory provides:
1. **Consolidated schema** - Single-file view of all Phase 1 tables
2. **Documentation** - Clear explanation of design decisions
3. **Future reference** - Template for Phase 2+ migrations

**Note**: These are NOT new migrations to run. They document the existing schema for reference and planning.

## Database Schema Summary

### Tables (14 total)

**User Management (6 tables)**:
- `users` - Main profile table (all roles)
- `athlete_profiles` - Extended athlete data
- `parent_profiles` - Extended parent data
- `coach_profiles` - Extended coach data
- `parent_athlete_relationships` - Parent-athlete connections
- `coach_athlete_relationships` - Coach-athlete connections

**Chat System (3 tables)**:
- `chat_sessions` - Conversation sessions
- `chat_messages` - Individual messages
- `chat_attachments` - File attachments

**Gamification (4 tables)**:
- `badges` - Badge definitions
- `user_badges` - Earned badges
- `quiz_questions` - Learning questions
- `user_quiz_progress` - Quiz attempt history

**Storage Buckets (1)**:
- `profile-images` - User profile pictures

## Files in This Directory

| File | Purpose |
|------|---------|
| `README.md` | This file - directory overview |
| `00_migration_plan.md` | Comprehensive migration strategy and design rationale |
| `consolidated_schema.sql` | Complete Phase 1 schema in one file (reference only) |
| `rollback_plan.md` | Disaster recovery procedures (future) |

## Usage

### For New Developers
1. Read `00_migration_plan.md` to understand the schema design
2. Review `consolidated_schema.sql` to see the complete schema
3. Check root `/migrations` for actual applied migrations

### For Database Changes
1. Create new migrations in the **root `/migrations` directory**
2. Follow the numbering convention: `015_descriptive_name.sql`, `016_...`, etc.
3. Document major changes in a new phase directory when needed

### For Production Deployment
1. Migrations 001-014 are **already applied** to production
2. New migrations should be tested locally first
3. Apply via Supabase Dashboard → SQL Editor
4. Update this documentation when adding new phases

## Key Design Decisions

### Why One `users` Table?
- **Single source of truth** for all user types
- **Simplifies authentication** (one ID → one user)
- **Flexible** - role-specific fields are nullable
- **Extensible** - easy to add new roles

### Why Separate Profile Tables?
- **Normalization** - avoid sparse columns in main table
- **Role-specific queries** - optimize for each user type
- **Future flexibility** - can add role-specific features easily

### Why Composite Keys for Relationships?
- **No ID lookups** - directly query by parent_id + athlete_id
- **Enforces uniqueness** - one relationship per pair
- **Better performance** - indexed on both keys

### Why JSONB for Permissions?
- **Flexibility** - add/remove permissions without schema changes
- **Granularity** - different permission sets per relationship
- **Queryable** - Postgres JSONB operators for filtering

## Security

All tables have **Row Level Security (RLS)** enabled:
- Users can only read/update their own records
- Service role bypasses RLS for admin operations
- Relationships enforce bidirectional access control

See migration `014_fix_badge_rls_policies.sql` for latest RLS policies.

## Next Steps

**Phase 2 Migrations** (Planned):
- Document management (contracts, agreements)
- NIL deal tracking (brands, earnings, compliance)
- Notification system (in-app, email, SMS)
- Real-time features (WebSocket subscriptions)

When Phase 2 begins, create:
```
migrations/
├── phase-1-foundation/      # This directory
└── phase-2-nil-deals/        # Future
```

## Resources

- **Supabase Dashboard**: https://app.supabase.com/project/enbuwffusjhpcyoveewb
- **Current Schema**: Query via Supabase SQL Editor: `\dt` (list tables), `\d table_name` (describe table)
- **Migration Files**: [/migrations](../README.md)
- **System Documentation**: [/SYSTEM_BREAKDOWN.md](../../SYSTEM_BREAKDOWN.md)

---

**Last Updated**: October 15, 2025
**Status**: Phase 1 Complete (migrations 001-014 applied)
**Database**: Supabase Cloud (US East)
**Project**: ChatNIL.io
