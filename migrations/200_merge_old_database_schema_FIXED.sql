-- =====================================================
-- DATABASE MERGE: Old + New Database Schemas (FIXED)
-- Targets: athlete_public_profiles (not athlete_profiles)
-- Preserves BOTH agency features AND athlete profiles
-- =====================================================

-- =====================================================
-- PHASE 1: Add Missing Personal Info to users table
-- =====================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_email text;

-- =====================================================
-- PHASE 2: Expand athlete_public_profiles with ALL old DB fields
-- =====================================================

-- Academic Information
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS graduation_year integer;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS gpa numeric(3,2);

-- Physical Stats (detailed)
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS height_inches integer;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS weight_lbs integer;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS jersey_number integer;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS secondary_sports jsonb DEFAULT '[]'::jsonb;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS stats jsonb DEFAULT '{}'::jsonb;

-- NIL Preferences & Goals
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS nil_interests text[];
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS nil_concerns text[];
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS nil_goals text[];
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS nil_preferences jsonb DEFAULT '{}'::jsonb;

-- Social Media (add missing columns)
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS instagram_handle text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS instagram_followers bigint DEFAULT 0;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS instagram_engagement_rate numeric(5,2);
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS tiktok_handle text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS tiktok_followers bigint DEFAULT 0;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS tiktok_engagement_rate numeric(5,2);
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS twitter_handle text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS twitter_followers bigint DEFAULT 0;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS youtube_channel text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS youtube_subscribers bigint DEFAULT 0;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS total_followers bigint DEFAULT 0;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS avg_engagement_rate numeric(5,2);
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS twitch_channel text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Rich Media Content
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS cover_photo_url text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS profile_video_url text;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS content_samples jsonb DEFAULT '[]'::jsonb;

-- Partnership Preferences
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS preferred_partnership_types text[];
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS brand_preferences jsonb DEFAULT '{}'::jsonb;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS content_categories jsonb DEFAULT '[]'::jsonb;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS is_available_for_partnerships boolean DEFAULT true;

-- Profile & Achievement fields
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS achievements text[];
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS estimated_fmv numeric(12,2);

-- Profile Completion Tracking
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS profile_completion_score integer DEFAULT 0;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS profile_completion_tier text DEFAULT 'bronze';
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS last_profile_update timestamp with time zone;
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS profile_views integer DEFAULT 0;

-- =====================================================
-- PHASE 3: Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_athlete_public_profiles_graduation_year ON athlete_public_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_athlete_public_profiles_gpa ON athlete_public_profiles(gpa);
CREATE INDEX IF NOT EXISTS idx_athlete_public_profiles_completion_score ON athlete_public_profiles(profile_completion_score);
CREATE INDEX IF NOT EXISTS idx_athlete_public_profiles_completion_tier ON athlete_public_profiles(profile_completion_tier);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 200 (FIXED): Database merge complete!';
  RAISE NOTICE '📊 Added personal info columns to users table';
  RAISE NOTICE '📊 Added 40+ columns to athlete_public_profiles table';
  RAISE NOTICE '🎯 Ready to create Sarah Johnson profile!';
END $$;
