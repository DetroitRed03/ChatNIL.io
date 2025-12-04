-- =====================================================
-- DATABASE MERGE: Old + New Database Schemas
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
-- PHASE 2: Expand athlete_profiles with ALL old DB fields
-- =====================================================

-- Academic Information
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS graduation_year integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS gpa numeric(3,2);

-- Physical Stats (detailed)
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS height_inches integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS weight_lbs integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS jersey_number integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS secondary_sports jsonb DEFAULT '[]'::jsonb;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS stats jsonb DEFAULT '{}'::jsonb;

-- NIL Preferences & Goals
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_interests text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_concerns text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_goals text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS nil_preferences jsonb DEFAULT '{}'::jsonb;

-- Additional Social Media Platforms
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS twitch_channel text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Rich Media Content
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS cover_photo_url text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_video_url text;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS content_samples jsonb DEFAULT '[]'::jsonb;

-- Partnership Preferences
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS preferred_partnership_types text[];
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS brand_preferences jsonb DEFAULT '{}'::jsonb;

-- Profile Completion Tracking
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_completion_score integer DEFAULT 0;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_completion_tier text DEFAULT 'bronze';
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS last_profile_update timestamp with time zone;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS profile_views integer DEFAULT 0;

-- =====================================================
-- PHASE 3: Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_athlete_profiles_graduation_year ON athlete_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_gpa ON athlete_profiles(gpa);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_completion_score ON athlete_profiles(profile_completion_score);
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_completion_tier ON athlete_profiles(profile_completion_tier);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);

-- =====================================================
-- PHASE 4: Enhanced Profile Completion Function
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

  IF profile IS NULL THEN
    RETURN jsonb_build_object('score', 0, 'tier', 'bronze', 'error', 'Profile not found');
  END IF;

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
  IF profile.content_samples IS NOT NULL AND jsonb_array_length(profile.content_samples) > 0 THEN
    score := score + 5;
  END IF;

  -- NIL Preferences (10 points)
  IF profile.nil_interests IS NOT NULL AND array_length(profile.nil_interests, 1) > 0 THEN
    score := score + 3;
  END IF;
  IF profile.nil_goals IS NOT NULL AND array_length(profile.nil_goals, 1) > 0 THEN
    score := score + 3;
  END IF;
  IF profile.preferred_partnership_types IS NOT NULL AND array_length(profile.preferred_partnership_types, 1) > 0 THEN
    score := score + 4;
  END IF;

  -- Achievements & Stats (10 points)
  IF profile.achievements IS NOT NULL AND array_length(profile.achievements, 1) > 0 THEN
    score := score + 5;
  END IF;
  IF profile.stats IS NOT NULL AND jsonb_typeof(profile.stats) = 'object' THEN
    score := score + 5;
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PHASE 5: User Migration Function
-- =====================================================

CREATE OR REPLACE FUNCTION migrate_user_from_old_db(
  p_user_data jsonb
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_athlete_profile_id uuid;
  v_year_classification text;
BEGIN
  -- Calculate year classification from graduation year
  v_year_classification := CASE
    WHEN (p_user_data->>'graduation_year')::integer = EXTRACT(YEAR FROM CURRENT_DATE) THEN 'Senior'
    WHEN (p_user_data->>'graduation_year')::integer = EXTRACT(YEAR FROM CURRENT_DATE) + 1 THEN 'Junior'
    WHEN (p_user_data->>'graduation_year')::integer = EXTRACT(YEAR FROM CURRENT_DATE) + 2 THEN 'Sophomore'
    WHEN (p_user_data->>'graduation_year')::integer = EXTRACT(YEAR FROM CURRENT_DATE) + 3 THEN 'Freshman'
    ELSE 'Unknown'
  END;

  -- 1. Insert/Update users table
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
    COALESCE(p_user_data->>'full_name',
             CONCAT(p_user_data->>'first_name', ' ', p_user_data->>'last_name')),
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
    full_name = EXCLUDED.full_name,
    date_of_birth = EXCLUDED.date_of_birth,
    phone = EXCLUDED.phone,
    parent_email = EXCLUDED.parent_email,
    updated_at = now()
  RETURNING id INTO v_user_id;

  -- 2. Insert/Update athlete_profiles table
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
    estimated_fmv, created_at, updated_at
  ) VALUES (
    v_user_id,
    p_user_data->>'username',
    p_user_data->>'primary_sport',
    p_user_data->>'position',
    p_user_data->>'school_name',
    v_year_classification,
    p_user_data->>'bio',
    COALESCE((p_user_data->>'achievements')::text[], ARRAY[]::text[]),
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
    COALESCE((p_user_data->>'estimated_fmv')::numeric, 0),
    COALESCE((p_user_data->>'created_at')::timestamptz, now()),
    COALESCE((p_user_data->>'updated_at')::timestamptz, now())
  )
  ON CONFLICT (user_id) DO UPDATE SET
    height_inches = EXCLUDED.height_inches,
    weight_lbs = EXCLUDED.weight_lbs,
    jersey_number = EXCLUDED.jersey_number,
    secondary_sports = EXCLUDED.secondary_sports,
    graduation_year = EXCLUDED.graduation_year,
    major = EXCLUDED.major,
    gpa = EXCLUDED.gpa,
    stats = EXCLUDED.stats,
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
    profile_completion_tier = EXCLUDED.profile_completion_tier,
    updated_at = now()
  RETURNING id INTO v_athlete_profile_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_profile_completion TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION migrate_user_from_old_db TO service_role;

-- =====================================================
-- PHASE 6: Update RLS Policies for New Columns
-- =====================================================

-- Users can read their own personal info
DROP POLICY IF EXISTS "Users can read own personal info" ON users;
CREATE POLICY "Users can read own personal info"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own personal info
DROP POLICY IF EXISTS "Users can update own personal info" ON users;
CREATE POLICY "Users can update own personal info"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Athletes can update their own profiles
DROP POLICY IF EXISTS "Athletes can update own profile" ON athlete_profiles;
CREATE POLICY "Athletes can update own profile"
  ON athlete_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 200: Database merge complete!';
  RAISE NOTICE '📊 Added personal info columns to users table';
  RAISE NOTICE '📊 Added 25+ columns to athlete_profiles table';
  RAISE NOTICE '🔧 Created enhanced profile completion function';
  RAISE NOTICE '🔧 Created user migration function';
  RAISE NOTICE '🔒 Updated RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready to migrate users from old database!';
END $$;
