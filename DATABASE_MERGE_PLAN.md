# ChatNIL Database Merge Plan
## Creating Perfect Harmony Between Old and New Databases

**Goal**: Merge old database (comprehensive athlete profiles) with new database (agency features) into a unified schema that preserves ALL functionality.

---

## Executive Summary

### Old Database Strengths
- ✅ **56-column comprehensive athlete profiles** in single `users` table
- ✅ **Working public profile editing** functionality
- ✅ Complete NIL preferences, social media stats, content samples
- ✅ Personal info: parent_email, phone, date_of_birth
- ✅ Academic data: GPA, major, graduation year
- ✅ Rich media: profile_video_url, content_samples, cover_photo_url

### New Database Strengths
- ✅ **Agency platform features**: campaigns, matching, discovery
- ✅ **Normalized schema**: Cleaner separation of concerns
- ✅ **Username-based routing** for public profiles
- ✅ **FMV calculation system**
- ✅ **Campaign matchmaking engine**

### The Problem
- Old DB: No agency features, no athlete_profiles table
- New DB: Missing 40+ critical athlete profile columns, no profile editing

### The Solution
**Hybrid Schema Architecture** that:
1. Keeps new database as foundation (agency features intact)
2. Adds ALL missing athlete columns to `athlete_profiles` table
3. Migrates old user data → new schema
4. Rebuilds profile editing to work with expanded schema

---

## Phase 1: Schema Analysis & Column Mapping

### 1.1 Old Database `users` Table (56 columns)

**Authentication & Core Identity** (7 columns)
```
id, email, password_hash, role, username, created_at, updated_at
```

**Personal Information** (6 columns)
```
first_name, last_name, full_name, date_of_birth, phone, parent_email
```

**School & Academic** (4 columns)
```
school_name, graduation_year, major, gpa
```

**Sports Information** (6 columns)
```
primary_sport, position, height_inches, weight_lbs, jersey_number, secondary_sports
```

**NIL Preferences** (4 columns)
```
nil_interests, nil_concerns, nil_goals, nil_preferences
```

**Social Media Handles** (6 columns)
```
instagram_handle, tiktok_handle, twitter_handle,
youtube_channel, twitch_channel, linkedin_url
```

**Social Media Stats** (8 columns)
```
instagram_followers, instagram_engagement_rate,
tiktok_followers, tiktok_engagement_rate,
twitter_followers, youtube_subscribers,
total_followers, avg_engagement_rate
```

**Profile Content** (7 columns)
```
bio, achievements, stats, profile_photo_url,
cover_photo_url, profile_video_url, content_samples
```

**Availability & Preferences** (4 columns)
```
is_available_for_partnerships, preferred_partnership_types,
content_categories, brand_preferences
```

**Profile Metadata** (4 columns)
```
profile_completion_score, profile_completion_tier,
last_profile_update, profile_views
```

### 1.2 New Database Schema (Current)

**`users` table** (17 columns)
```
id, email, user_type, full_name, username, role,
company_name, industry, website, location, bio,
profile_photo, onboarding_completed, preferences,
metadata, created_at, updated_at
```

**`athlete_profiles` table** (Current - ~25 columns)
```
id, user_id, username, sport, position, school, year,
height, weight, bio, achievements, estimated_fmv,
instagram_handle, instagram_followers, instagram_engagement_rate,
tiktok_handle, tiktok_followers, tiktok_engagement_rate,
twitter_handle, twitter_followers, youtube_channel,
youtube_subscribers, total_followers, avg_engagement_rate,
content_categories, is_available_for_partnerships,
created_at, updated_at
```

### 1.3 Column Mapping Strategy

#### ✅ Already Mapped (in new athlete_profiles)
```
sport → primary_sport
position → position
school → school_name
bio → bio
achievements → achievements
instagram_handle, tiktok_handle, twitter_handle → same
total_followers, avg_engagement_rate → same
is_available_for_partnerships → same
content_categories → same
```

#### ❌ Missing Columns (Need to Add to New Schema)

**To `users` table:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_email text;
```

**To `athlete_profiles` table:**
```sql
-- Academic Info
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS graduation_year integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS gpa numeric(3,2);

-- Sports Details
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS height_inches integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS weight_lbs integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS jersey_number integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS secondary_sports jsonb;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS stats jsonb;

-- NIL Preferences
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_interests text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_concerns text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_goals text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_preferences jsonb;

-- Additional Social Media
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS twitch_channel text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Rich Media
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS cover_photo_url text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_video_url text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS content_samples jsonb;

-- Partnership Preferences
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS preferred_partnership_types text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS brand_preferences jsonb;

-- Profile Metadata
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_completion_score integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_completion_tier text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS last_profile_update timestamp with time zone;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_views integer DEFAULT 0;
```

---

## Phase 2: Migration SQL Script

### 2.1 Create Migration File

**File**: `migrations/200_merge_old_database_schema.sql`

```sql
-- =====================================================
-- PHASE 1: Add Missing Columns to New Database
-- =====================================================

-- Add personal info columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_email text;

-- Add comprehensive athlete profile columns
ALTER TABLE athlete_profiles
  ADD COLUMN IF NOT EXISTS graduation_year integer,
  ADD COLUMN IF NOT EXISTS major text,
  ADD COLUMN IF NOT EXISTS gpa numeric(3,2),
  ADD COLUMN IF NOT EXISTS height_inches integer,
  ADD COLUMN IF NOT EXISTS weight_lbs integer,
  ADD COLUMN IF NOT EXISTS jersey_number integer,
  ADD COLUMN IF NOT EXISTS secondary_sports jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stats jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS nil_interests text[],
  ADD COLUMN IF NOT EXISTS nil_concerns text[],
  ADD COLUMN IF NOT EXISTS nil_goals text[],
  ADD COLUMN IF NOT EXISTS nil_preferences jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS twitch_channel text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS cover_photo_url text,
  ADD COLUMN IF NOT EXISTS profile_video_url text,
  ADD COLUMN IF NOT EXISTS content_samples jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_partnership_types text[],
  ADD COLUMN IF NOT EXISTS brand_preferences jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_completion_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_completion_tier text DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS last_profile_update timestamp with time zone,
  ADD COLUMN IF NOT EXISTS profile_views integer DEFAULT 0;

-- =====================================================
-- PHASE 2: Update Profile Completion Function
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_profile_completion(athlete_profile_id uuid)
RETURNS jsonb AS $$
DECLARE
  profile RECORD;
  score integer := 0;
  tier text;
  max_score integer := 100;
BEGIN
  SELECT * INTO profile FROM athlete_profiles WHERE id = athlete_profile_id;

  -- Basic Info (20 points)
  IF profile.sport IS NOT NULL THEN score := score + 5; END IF;
  IF profile.position IS NOT NULL THEN score := score + 5; END IF;
  IF profile.school IS NOT NULL THEN score := score + 5; END IF;
  IF profile.bio IS NOT NULL AND length(profile.bio) > 50 THEN score := score + 5; END IF;

  -- Physical Stats (10 points)
  IF profile.height_inches IS NOT NULL THEN score := score + 3; END IF;
  IF profile.weight_lbs IS NOT NULL THEN score := score + 3; END IF;
  IF profile.jersey_number IS NOT NULL THEN score := score + 4; END IF;

  -- Academic Info (10 points)
  IF profile.graduation_year IS NOT NULL THEN score := score + 3; END IF;
  IF profile.major IS NOT NULL THEN score := score + 3; END IF;
  IF profile.gpa IS NOT NULL THEN score := score + 4; END IF;

  -- Social Media (25 points)
  IF profile.instagram_handle IS NOT NULL THEN score := score + 5; END IF;
  IF profile.tiktok_handle IS NOT NULL THEN score := score + 5; END IF;
  IF profile.twitter_handle IS NOT NULL THEN score := score + 5; END IF;
  IF profile.youtube_channel IS NOT NULL THEN score := score + 5; END IF;
  IF profile.total_followers > 0 THEN score := score + 5; END IF;

  -- Rich Media (15 points)
  IF profile.profile_video_url IS NOT NULL THEN score := score + 5; END IF;
  IF profile.cover_photo_url IS NOT NULL THEN score := score + 5; END IF;
  IF profile.content_samples IS NOT NULL AND jsonb_array_length(profile.content_samples) > 0 THEN score := score + 5; END IF;

  -- NIL Preferences (10 points)
  IF profile.nil_interests IS NOT NULL AND array_length(profile.nil_interests, 1) > 0 THEN score := score + 3; END IF;
  IF profile.nil_goals IS NOT NULL AND array_length(profile.nil_goals, 1) > 0 THEN score := score + 3; END IF;
  IF profile.preferred_partnership_types IS NOT NULL AND array_length(profile.preferred_partnership_types, 1) > 0 THEN score := score + 4; END IF;

  -- Achievements & Stats (10 points)
  IF profile.achievements IS NOT NULL AND array_length(profile.achievements, 1) > 0 THEN score := score + 5; END IF;
  IF profile.stats IS NOT NULL AND jsonb_typeof(profile.stats) = 'object' THEN score := score + 5; END IF;

  -- Determine tier
  IF score >= 80 THEN tier := 'platinum';
  ELSIF score >= 60 THEN tier := 'gold';
  ELSIF score >= 40 THEN tier := 'silver';
  ELSE tier := 'bronze';
  END IF;

  -- Update the profile
  UPDATE athlete_profiles
  SET profile_completion_score = score,
      profile_completion_tier = tier,
      last_profile_update = now()
  WHERE id = athlete_profile_id;

  RETURN jsonb_build_object('score', score, 'tier', tier);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PHASE 3: Create Data Migration Function
-- =====================================================

-- This function will be called for each user being migrated
CREATE OR REPLACE FUNCTION migrate_user_from_old_db(
  p_user_data jsonb
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_athlete_profile_id uuid;
BEGIN
  -- 1. Create auth user (if not exists)
  -- This will be done via Supabase admin API

  -- 2. Insert into users table
  INSERT INTO users (
    id, email, first_name, last_name, full_name,
    date_of_birth, phone, parent_email,
    username, role, onboarding_completed,
    created_at, updated_at
  ) VALUES (
    (p_user_data->>'id')::uuid,
    p_user_data->>'email',
    p_user_data->>'first_name',
    p_user_data->>'last_name',
    p_user_data->>'full_name',
    (p_user_data->>'date_of_birth')::date,
    p_user_data->>'phone',
    p_user_data->>'parent_email',
    p_user_data->>'username',
    'athlete',
    true,
    COALESCE((p_user_data->>'created_at')::timestamptz, now()),
    COALESCE((p_user_data->>'updated_at')::timestamptz, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    date_of_birth = EXCLUDED.date_of_birth,
    phone = EXCLUDED.phone,
    parent_email = EXCLUDED.parent_email
  RETURNING id INTO v_user_id;

  -- 3. Insert into athlete_profiles table
  INSERT INTO athlete_profiles (
    user_id, username, sport, position, school, year,
    bio, achievements, stats,
    height_inches, weight_lbs, jersey_number, secondary_sports,
    graduation_year, major, gpa,
    instagram_handle, instagram_followers, instagram_engagement_rate,
    tiktok_handle, tiktok_followers, tiktok_engagement_rate,
    twitter_handle, twitter_followers,
    youtube_channel, youtube_subscribers,
    twitch_channel, linkedin_url,
    total_followers, avg_engagement_rate,
    cover_photo_url, profile_video_url, content_samples,
    nil_interests, nil_concerns, nil_goals, nil_preferences,
    preferred_partnership_types, brand_preferences,
    content_categories, is_available_for_partnerships,
    profile_completion_score, profile_completion_tier,
    estimated_fmv
  ) VALUES (
    v_user_id,
    p_user_data->>'username',
    p_user_data->>'primary_sport',
    p_user_data->>'position',
    p_user_data->>'school_name',
    'Unknown', -- We'll need to calculate this from graduation_year
    p_user_data->>'bio',
    COALESCE((p_user_data->>'achievements')::jsonb, '[]'::jsonb),
    COALESCE((p_user_data->>'stats')::jsonb, '{}'::jsonb),
    (p_user_data->>'height_inches')::integer,
    (p_user_data->>'weight_lbs')::integer,
    (p_user_data->>'jersey_number')::integer,
    COALESCE((p_user_data->>'secondary_sports')::jsonb, '[]'::jsonb),
    (p_user_data->>'graduation_year')::integer,
    p_user_data->>'major',
    (p_user_data->>'gpa')::numeric,
    p_user_data->>'instagram_handle',
    (p_user_data->>'instagram_followers')::bigint,
    (p_user_data->>'instagram_engagement_rate')::numeric,
    p_user_data->>'tiktok_handle',
    (p_user_data->>'tiktok_followers')::bigint,
    (p_user_data->>'tiktok_engagement_rate')::numeric,
    p_user_data->>'twitter_handle',
    (p_user_data->>'twitter_followers')::bigint,
    p_user_data->>'youtube_channel',
    (p_user_data->>'youtube_subscribers')::bigint,
    p_user_data->>'twitch_channel',
    p_user_data->>'linkedin_url',
    (p_user_data->>'total_followers')::bigint,
    (p_user_data->>'avg_engagement_rate')::numeric,
    p_user_data->>'cover_photo_url',
    p_user_data->>'profile_video_url',
    COALESCE((p_user_data->>'content_samples')::jsonb, '[]'::jsonb),
    COALESCE((p_user_data->>'nil_interests')::text[], ARRAY[]::text[]),
    COALESCE((p_user_data->>'nil_concerns')::text[], ARRAY[]::text[]),
    COALESCE((p_user_data->>'nil_goals')::text[], ARRAY[]::text[]),
    COALESCE((p_user_data->>'nil_preferences')::jsonb, '{}'::jsonb),
    COALESCE((p_user_data->>'preferred_partnership_types')::text[], ARRAY[]::text[]),
    COALESCE((p_user_data->>'brand_preferences')::jsonb, '{}'::jsonb),
    COALESCE((p_user_data->>'content_categories')::jsonb, '[]'::jsonb),
    COALESCE((p_user_data->>'is_available_for_partnerships')::boolean, true),
    COALESCE((p_user_data->>'profile_completion_score')::integer, 0),
    COALESCE(p_user_data->>'profile_completion_tier', 'bronze'),
    COALESCE((p_user_data->>'estimated_fmv')::numeric, 0)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    height_inches = EXCLUDED.height_inches,
    weight_lbs = EXCLUDED.weight_lbs,
    jersey_number = EXCLUDED.jersey_number,
    secondary_sports = EXCLUDED.secondary_sports,
    graduation_year = EXCLUDED.graduation_year,
    major = EXCLUDED.major,
    gpa = EXCLUDED.gpa,
    nil_interests = EXCLUDED.nil_interests,
    nil_concerns = EXCLUDED.nil_concerns,
    nil_goals = EXCLUDED.nil_goals,
    nil_preferences = EXCLUDED.nil_preferences,
    twitch_channel = EXCLUDED.twitch_channel,
    linkedin_url = EXCLUDED.linkedin_url,
    cover_photo_url = EXCLUDED.cover_photo_url,
    profile_video_url = EXCLUDED.profile_video_url,
    content_samples = EXCLUDED.content_samples,
    preferred_partnership_types = EXCLUDED.preferred_partnership_types,
    brand_preferences = EXCLUDED.brand_preferences,
    profile_completion_score = EXCLUDED.profile_completion_score,
    profile_completion_tier = EXCLUDED.profile_completion_tier
  RETURNING id INTO v_athlete_profile_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION migrate_user_from_old_db TO service_role;

COMMENT ON FUNCTION migrate_user_from_old_db IS
'Migrates a single user from old database schema to new database schema';
```

---

## Phase 3: Data Migration Script

### 3.1 TypeScript Migration Script

**File**: `scripts/migrate-old-database-users.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load environment variables
const envOld = fs.readFileSync('.env.old', 'utf-8');
const oldVars: Record<string, string> = {};
envOld.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    oldVars[key] = values.join('=');
  }
});

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const newVars: Record<string, string> = {};
envLocal.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    newVars[key] = values.join('=');
  }
});

const oldSupabase = createClient(
  oldVars.OLD_SUPABASE_URL,
  oldVars.OLD_SUPABASE_SERVICE_ROLE_KEY
);

const newSupabase = createClient(
  newVars.SUPABASE_URL,
  newVars.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateUsers() {
  console.log('🚀 Starting User Migration from Old Database\n');
  console.log('='.repeat(80));

  // Step 1: Fetch all athlete users from old database
  console.log('\n📊 Step 1: Fetching users from old database...');
  const { data: oldUsers, error: fetchError } = await oldSupabase
    .from('users')
    .select('*')
    .eq('role', 'athlete');

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError);
    return;
  }

  console.log(`✅ Found ${oldUsers.length} athlete accounts to migrate\n`);

  // Step 2: Apply schema migration to new database
  console.log('📊 Step 2: Applying schema changes to new database...');
  console.log('⚠️  Please run migration/200_merge_old_database_schema.sql first!');
  console.log('Press any key to continue after running migration...');
  // await waitForKeypress();

  // Step 3: Migrate each user
  console.log('\n📊 Step 3: Migrating users...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  for (const user of oldUsers) {
    try {
      console.log(`\n🔄 Migrating: ${user.email} (${user.username})`);

      // 3a. Create auth user
      const { data: authData, error: authError } = await newSupabase.auth.admin.createUser({
        email: user.email,
        password: `TempPassword123!${user.id.slice(0,8)}`, // Temporary password
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          username: user.username,
          migrated_from_old_db: true,
          migration_date: new Date().toISOString()
        }
      });

      if (authError && !authError.message.includes('already registered')) {
        throw authError;
      }

      const userId = authData?.user?.id || user.id;

      // 3b. Call migration function
      const { data: migrateResult, error: migrateError } = await newSupabase
        .rpc('migrate_user_from_old_db', {
          p_user_data: user
        });

      if (migrateError) {
        throw migrateError;
      }

      console.log(`  ✅ Successfully migrated ${user.email}`);
      successCount++;

    } catch (err: any) {
      console.error(`  ❌ Error migrating ${user.email}:`, err.message);
      errors.push({ user: user.email, error: err.message });
      errorCount++;
    }
  }

  // Step 4: Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📈 MIGRATION SUMMARY\n');
  console.log(`✅ Successfully migrated: ${successCount} users`);
  console.log(`❌ Failed to migrate: ${errorCount} users`);

  if (errors.length > 0) {
    console.log('\n⚠️  Errors:\n');
    errors.forEach(e => {
      console.log(`  - ${e.user}: ${e.error}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Migration Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Verify migrated data in new database');
  console.log('2. Test profile editing functionality');
  console.log('3. Send password reset emails to all migrated users');
  console.log('4. Update frontend to use new schema');
  console.log('5. Test agency features still work');
}

migrateUsers().catch(console.error);
```

---

## Phase 4: Frontend Updates

### 4.1 Update Profile Editing Component

The profile editing functionality needs to be rebuilt to support ALL the new fields.

**Key Changes Needed:**

1. **Update TypeScript types** to include all new fields
2. **Expand profile edit form** with new sections:
   - Personal Info (name, DOB, phone, parent email)
   - Academic Info (graduation year, major, GPA)
   - Physical Stats (height, weight, jersey)
   - NIL Preferences (interests, goals, concerns)
   - Rich Media (video, cover photo, content samples)
   - Partnership Preferences

3. **Update API endpoints** to handle new fields

4. **Rebuild profile completion calculator** to use new scoring

### 4.2 Files to Update

**Type Definitions**: `lib/types/athlete.ts`
```typescript
export interface AthleteProfile {
  // Existing fields...

  // NEW: Personal Info
  height_inches?: number;
  weight_lbs?: number;
  jersey_number?: number;
  secondary_sports?: Sport[];

  // NEW: Academic
  graduation_year?: number;
  major?: string;
  gpa?: number;

  // NEW: NIL Preferences
  nil_interests?: string[];
  nil_concerns?: string[];
  nil_goals?: string[];
  nil_preferences?: Record<string, any>;

  // NEW: Additional Social
  twitch_channel?: string;
  linkedin_url?: string;

  // NEW: Rich Media
  cover_photo_url?: string;
  profile_video_url?: string;
  content_samples?: ContentSample[];

  // NEW: Partnership Preferences
  preferred_partnership_types?: string[];
  brand_preferences?: Record<string, any>;

  // NEW: Metadata
  profile_completion_score?: number;
  profile_completion_tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  last_profile_update?: string;
  profile_views?: number;
}
```

**Profile Edit Page**: `app/profile/edit/page.tsx`
- Add form sections for all new fields
- Implement auto-save functionality
- Show profile completion progress

**Profile API**: `app/api/profile/update/route.ts`
- Accept all new fields
- Validate data types
- Recalculate profile completion on save

---

## Phase 5: Testing & Validation

### 5.1 Migration Testing Checklist

- [ ] Schema migration applies without errors
- [ ] All columns added successfully
- [ ] Migration function works for sample user
- [ ] Auth users created properly
- [ ] Data integrity maintained (no data loss)
- [ ] Foreign keys still valid
- [ ] RLS policies still work

### 5.2 Functionality Testing Checklist

**Old Database Features (Must Work):**
- [ ] Profile editing - all 56 fields editable
- [ ] Public profile page displays all info
- [ ] Profile completion calculation accurate
- [ ] Social media stats display correctly
- [ ] NIL preferences saved and displayed
- [ ] Content samples upload and display

**New Database Features (Must Work):**
- [ ] Agency dashboard shows campaigns
- [ ] Campaign matching still functions
- [ ] Discovery page shows athletes
- [ ] FMV calculation works
- [ ] Username-based routing works
- [ ] Matchmaking engine runs

### 5.3 Data Validation Script

**File**: `scripts/validate-migration.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

async function validateMigration() {
  console.log('🔍 Validating Migration\n');

  // Check all users have athlete_profiles
  // Check profile completion scores
  // Check no data loss
  // Verify foreign keys
  // Test RLS policies

  console.log('✅ Validation Complete');
}
```

---

## Phase 6: Rollback Plan

### 6.1 Backup Strategy

**Before Migration:**
1. Full database backup via Supabase dashboard
2. Export all tables to CSV
3. Document current state
4. Test restore process

### 6.2 Rollback Procedure

If migration fails:

1. **Stop migration script immediately**
2. **Restore from backup**
3. **Analyze errors**
4. **Fix migration script**
5. **Test on staging database first**
6. **Retry migration**

---

## Phase 7: Timeline & Risk Assessment

### 7.1 Estimated Timeline

| Phase | Task | Time | Difficulty |
|-------|------|------|------------|
| 1 | Create schema migration SQL | 2 hours | Medium |
| 2 | Test migration on staging DB | 1 hour | Easy |
| 3 | Write TypeScript migration script | 3 hours | Medium |
| 4 | Migrate 10 sample users | 30 min | Easy |
| 5 | Validate sample migration | 1 hour | Medium |
| 6 | Migrate all users | 1 hour | Easy |
| 7 | Update frontend types | 2 hours | Easy |
| 8 | Rebuild profile editing | 6 hours | Hard |
| 9 | Update API endpoints | 3 hours | Medium |
| 10 | End-to-end testing | 4 hours | Medium |
| **TOTAL** | | **23.5 hours** | **~3 days** |

### 7.2 Risk Assessment

**HIGH RISK:**
- ❌ Data loss during migration
- ❌ Auth user conflicts (duplicate emails)
- ❌ Breaking existing agency features

**MEDIUM RISK:**
- ⚠️  Profile editing bugs with new fields
- ⚠️  Performance issues with larger athlete_profiles table
- ⚠️  Frontend breaking changes

**LOW RISK:**
- ✅ Schema migration (reversible)
- ✅ Type definition updates
- ✅ API endpoint additions

### 7.3 Mitigation Strategies

1. **For Data Loss**: Full backup before migration, test on staging first
2. **For Auth Conflicts**: Check existing emails before creating auth users
3. **For Breaking Changes**: Feature flags, gradual rollout
4. **For Performance**: Add database indexes on new columns

---

## Phase 8: Post-Migration Tasks

### 8.1 Immediate Actions

1. **Send password reset emails** to all migrated users
2. **Update documentation** with new schema
3. **Monitor error logs** for 48 hours
4. **Verify analytics tracking** still works

### 8.2 User Communication

**Email Template for Migrated Users:**

```
Subject: Important: ChatNIL Account Migration Complete

Hi [Name],

We've successfully migrated your ChatNIL athlete profile to our new platform!

What this means for you:
✅ All your profile data has been preserved
✅ New agency partnership features are now available
✅ Enhanced profile editing with more options
✅ Better FMV calculation and matchmaking

ACTION REQUIRED:
Please reset your password using the link below:
[Password Reset Link]

Questions? Contact support@chatnil.io

Thanks,
The ChatNIL Team
```

---

## Summary

### What This Plan Achieves

✅ **Preserves ALL old database features**:
- 56-column comprehensive athlete profiles
- Profile editing functionality
- NIL preferences and goals
- Rich media support

✅ **Keeps ALL new database features**:
- Agency platform and campaigns
- Matchmaking engine
- Discovery system
- FMV calculations

✅ **Maintains Data Integrity**:
- No data loss
- All relationships preserved
- Auth system intact

✅ **Provides Clear Path Forward**:
- Step-by-step migration
- Testing and validation
- Rollback capability
- Post-migration support

### Success Criteria

Migration is successful when:
1. All users can log in with reset passwords
2. Profile editing works with all 56+ fields
3. Agency features continue to function
4. No data has been lost
5. Performance is acceptable
6. All tests pass

---

## Ready to Execute

This plan creates "perfect harmony" by:
1. Expanding new database schema to include old database's comprehensive athlete fields
2. Migrating all user data without loss
3. Rebuilding profile editing to work with expanded schema
4. Preserving all agency features

**Recommended Next Step**: Review this plan, then proceed with Phase 1 (schema migration) on a test database first.
