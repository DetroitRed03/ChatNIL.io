-- ============================================================================
-- Migration 016: Athlete Profile Enhancements with Matchmaking Features
-- ============================================================================
-- Description: Adds comprehensive athlete profile fields including hobbies,
--              interests, social media statistics, NIL preferences, and
--              calculated matchmaking scores for agency-athlete connections.
--
-- Author: ChatNIL Team
-- Date: 2025-10-15
-- Dependencies: Migration 015 (Agency Role)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. HOBBY AND INTEREST FIELDS
-- ============================================================================
-- Purpose: Capture athlete personality and lifestyle for authentic partnerships

ALTER TABLE users ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
COMMENT ON COLUMN users.hobbies IS 'General hobbies and activities (e.g., gaming, cooking, photography)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS content_creation_interests TEXT[] DEFAULT '{}';
COMMENT ON COLUMN users.content_creation_interests IS 'Types of content athlete enjoys creating (e.g., vlogs, tutorials, behind-the-scenes)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_affinity TEXT[] DEFAULT '{}';
COMMENT ON COLUMN users.brand_affinity IS 'Brands athlete already uses/loves (organic partnerships)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS lifestyle_interests TEXT[] DEFAULT '{}';
COMMENT ON COLUMN users.lifestyle_interests IS 'Lifestyle categories (e.g., fitness, fashion, tech, travel)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS causes_care_about TEXT[] DEFAULT '{}';
COMMENT ON COLUMN users.causes_care_about IS 'Social causes and charities athlete supports (e.g., mental health, environment)';

-- ============================================================================
-- 2. SOCIAL MEDIA STATISTICS
-- ============================================================================
-- Purpose: Track platform-specific following and engagement for matchmaking
-- Structure: Array of objects with { platform, handle, followers, engagement_rate }

ALTER TABLE users ADD COLUMN IF NOT EXISTS social_media_stats JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN users.social_media_stats IS 'Array of social media platform statistics. Example:
[
  {
    "platform": "instagram",
    "handle": "@athlete",
    "followers": 50000,
    "engagement_rate": 4.5,
    "verified": true,
    "last_updated": "2025-10-15T00:00:00Z"
  },
  {
    "platform": "tiktok",
    "handle": "@athlete",
    "followers": 100000,
    "engagement_rate": 8.2,
    "verified": false,
    "last_updated": "2025-10-15T00:00:00Z"
  }
]';

-- ============================================================================
-- 3. NIL PREFERENCES
-- ============================================================================
-- Purpose: Define athlete's partnership preferences for smart matching
-- Structure: JSONB object with partnership criteria and deal preferences

ALTER TABLE users ADD COLUMN IF NOT EXISTS nil_preferences JSONB DEFAULT '{}'::jsonb;
COMMENT ON COLUMN users.nil_preferences IS 'NIL partnership preferences. Example:
{
  "preferred_deal_types": ["sponsored_posts", "brand_ambassador", "appearances"],
  "min_compensation": 1000,
  "max_compensation": 50000,
  "preferred_partnership_length": "3-6 months",
  "content_types_willing": ["instagram_posts", "tiktok_videos", "youtube_videos"],
  "blacklist_categories": ["alcohol", "gambling"],
  "preferred_brand_sizes": ["startup", "established"],
  "negotiation_flexibility": "moderate",
  "requires_agent_approval": false
}';

-- ============================================================================
-- 4. PROFILE ENRICHMENT
-- ============================================================================
-- Purpose: Add multimedia and descriptive content for compelling profiles

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
COMMENT ON COLUMN users.bio IS 'Athlete biography/personal statement (500-1000 characters)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_video_url TEXT;
COMMENT ON COLUMN users.profile_video_url IS 'URL to introduction/highlight video (YouTube, Vimeo, etc.)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS content_samples JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN users.content_samples IS 'Array of content sample objects. Example:
[
  {
    "type": "instagram_post",
    "url": "https://instagram.com/p/...",
    "description": "Sponsored post for local business",
    "engagement": 5000,
    "date": "2025-09-01"
  },
  {
    "type": "tiktok_video",
    "url": "https://tiktok.com/@athlete/video/...",
    "description": "Product review video",
    "views": 50000,
    "date": "2025-08-15"
  }
]';

-- ============================================================================
-- 5. CALCULATED FIELDS (AUTO-UPDATED VIA TRIGGERS)
-- ============================================================================
-- Purpose: Aggregate metrics for quick filtering and ranking

ALTER TABLE users ADD COLUMN IF NOT EXISTS total_followers INTEGER DEFAULT 0;
COMMENT ON COLUMN users.total_followers IS 'Sum of followers across all social media platforms (auto-calculated)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_engagement_rate DECIMAL(5,2) DEFAULT 0.0;
COMMENT ON COLUMN users.avg_engagement_rate IS 'Average engagement rate across all platforms (auto-calculated)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;
COMMENT ON COLUMN users.profile_completion_score IS 'Profile completeness percentage 0-100 (auto-calculated based on filled fields)';

-- ============================================================================
-- 6. PERFORMANCE INDEXES
-- ============================================================================
-- Purpose: Optimize queries for matchmaking and search

-- GIN indexes for array searches (interests, hobbies, brand affinity)
CREATE INDEX IF NOT EXISTS idx_users_hobbies ON users USING GIN (hobbies);
CREATE INDEX IF NOT EXISTS idx_users_content_creation_interests ON users USING GIN (content_creation_interests);
CREATE INDEX IF NOT EXISTS idx_users_brand_affinity ON users USING GIN (brand_affinity);
CREATE INDEX IF NOT EXISTS idx_users_lifestyle_interests ON users USING GIN (lifestyle_interests);
CREATE INDEX IF NOT EXISTS idx_users_causes_care_about ON users USING GIN (causes_care_about);

-- JSONB indexes for structured searches
CREATE INDEX IF NOT EXISTS idx_users_social_media_stats ON users USING GIN (social_media_stats);
CREATE INDEX IF NOT EXISTS idx_users_nil_preferences ON users USING GIN (nil_preferences);
CREATE INDEX IF NOT EXISTS idx_users_content_samples ON users USING GIN (content_samples);

-- B-tree indexes for calculated fields (filtering/sorting)
CREATE INDEX IF NOT EXISTS idx_users_total_followers ON users (total_followers) WHERE role = 'athlete';
CREATE INDEX IF NOT EXISTS idx_users_avg_engagement_rate ON users (avg_engagement_rate) WHERE role = 'athlete';
CREATE INDEX IF NOT EXISTS idx_users_profile_completion_score ON users (profile_completion_score) WHERE role = 'athlete';

-- Composite index for matchmaking queries
CREATE INDEX IF NOT EXISTS idx_users_athlete_matchmaking
  ON users (role, total_followers, avg_engagement_rate, profile_completion_score)
  WHERE role = 'athlete' AND onboarding_completed = true;

-- ============================================================================
-- 7. DATABASE FUNCTIONS
-- ============================================================================

-- Function: Calculate total followers from social_media_stats array
CREATE OR REPLACE FUNCTION calculate_total_followers(stats JSONB)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  stat JSONB;
BEGIN
  -- Handle null or empty array
  IF stats IS NULL OR jsonb_array_length(stats) = 0 THEN
    RETURN 0;
  END IF;

  -- Sum followers from each platform
  FOR stat IN SELECT * FROM jsonb_array_elements(stats)
  LOOP
    total := total + COALESCE((stat->>'followers')::INTEGER, 0);
  END LOOP;

  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_total_followers IS 'Sums followers across all social media platforms from JSONB array';

-- Function: Calculate average engagement rate from social_media_stats array
CREATE OR REPLACE FUNCTION calculate_avg_engagement_rate(stats JSONB)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_rate DECIMAL := 0;
  count INTEGER := 0;
  stat JSONB;
BEGIN
  -- Handle null or empty array
  IF stats IS NULL OR jsonb_array_length(stats) = 0 THEN
    RETURN 0.0;
  END IF;

  -- Sum engagement rates and count platforms
  FOR stat IN SELECT * FROM jsonb_array_elements(stats)
  LOOP
    IF stat ? 'engagement_rate' THEN
      total_rate := total_rate + COALESCE((stat->>'engagement_rate')::DECIMAL, 0);
      count := count + 1;
    END IF;
  END LOOP;

  -- Return average or 0 if no valid rates
  IF count > 0 THEN
    RETURN ROUND(total_rate / count, 2);
  ELSE
    RETURN 0.0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_avg_engagement_rate IS 'Calculates average engagement rate across all social media platforms from JSONB array';

-- Function: Calculate profile completion score
CREATE OR REPLACE FUNCTION calculate_profile_completion_score(user_row users)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  max_score INTEGER := 20; -- 20 checkable fields
BEGIN
  -- Core profile fields (40 points total, 2 points each)
  IF user_row.full_name IS NOT NULL AND user_row.full_name != '' THEN score := score + 2; END IF;
  IF user_row.email IS NOT NULL AND user_row.email != '' THEN score := score + 2; END IF;
  IF user_row.bio IS NOT NULL AND user_row.bio != '' THEN score := score + 2; END IF;
  IF user_row.profile_photo_url IS NOT NULL AND user_row.profile_photo_url != '' THEN score := score + 2; END IF;
  IF user_row.profile_video_url IS NOT NULL AND user_row.profile_video_url != '' THEN score := score + 2; END IF;

  -- Athlete-specific fields (30 points total, 3 points each)
  IF user_row.school_name IS NOT NULL AND user_row.school_name != '' THEN score := score + 3; END IF;
  IF user_row.primary_sport IS NOT NULL AND user_row.primary_sport != '' THEN score := score + 3; END IF;
  IF user_row.position IS NOT NULL AND user_row.position != '' THEN score := score + 3; END IF;
  IF user_row.graduation_year IS NOT NULL THEN score := score + 3; END IF;
  IF user_row.achievements IS NOT NULL AND jsonb_array_length(user_row.achievements) > 0 THEN score := score + 3; END IF;

  -- Interest fields (15 points total, 3 points each)
  IF user_row.hobbies IS NOT NULL AND array_length(user_row.hobbies, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.lifestyle_interests IS NOT NULL AND array_length(user_row.lifestyle_interests, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.brand_affinity IS NOT NULL AND array_length(user_row.brand_affinity, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.causes_care_about IS NOT NULL AND array_length(user_row.causes_care_about, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.content_creation_interests IS NOT NULL AND array_length(user_row.content_creation_interests, 1) > 0 THEN score := score + 3; END IF;

  -- Social media fields (10 points total, 5 points each)
  IF user_row.social_media_stats IS NOT NULL AND jsonb_array_length(user_row.social_media_stats) > 0 THEN score := score + 5; END IF;
  IF user_row.content_samples IS NOT NULL AND jsonb_array_length(user_row.content_samples) > 0 THEN score := score + 5; END IF;

  -- NIL preferences (5 points)
  IF user_row.nil_preferences IS NOT NULL AND user_row.nil_preferences != '{}'::jsonb THEN score := score + 5; END IF;

  -- Convert to percentage (0-100)
  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_profile_completion_score IS 'Calculates profile completion score (0-100) based on filled fields with weighted scoring';

-- ============================================================================
-- 8. TRIGGERS FOR AUTO-CALCULATION
-- ============================================================================

-- Trigger function: Update calculated fields when social_media_stats changes
CREATE OR REPLACE FUNCTION update_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_followers
  NEW.total_followers := calculate_total_followers(NEW.social_media_stats);

  -- Update avg_engagement_rate
  NEW.avg_engagement_rate := calculate_avg_engagement_rate(NEW.social_media_stats);

  -- Update profile_completion_score
  NEW.profile_completion_score := calculate_profile_completion_score(NEW);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_calculated_fields IS 'Trigger function to auto-update calculated fields on INSERT or UPDATE';

-- Create trigger on users table
DROP TRIGGER IF EXISTS trigger_update_calculated_fields ON users;
CREATE TRIGGER trigger_update_calculated_fields
  BEFORE INSERT OR UPDATE OF
    social_media_stats,
    bio,
    profile_video_url,
    content_samples,
    hobbies,
    lifestyle_interests,
    brand_affinity,
    causes_care_about,
    content_creation_interests,
    nil_preferences,
    full_name,
    email,
    profile_photo_url,
    school_name,
    primary_sport,
    position,
    graduation_year,
    achievements
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_calculated_fields();

COMMENT ON TRIGGER trigger_update_calculated_fields ON users IS 'Auto-updates total_followers, avg_engagement_rate, and profile_completion_score when relevant fields change';

-- ============================================================================
-- 9. VERIFICATION QUERY
-- ============================================================================

DO $$
DECLARE
  new_columns_count INTEGER;
  new_indexes_count INTEGER;
  new_functions_count INTEGER;
  new_triggers_count INTEGER;
BEGIN
  -- Count new columns
  SELECT COUNT(*) INTO new_columns_count
  FROM information_schema.columns
  WHERE table_name = 'users'
    AND column_name IN (
      'hobbies', 'content_creation_interests', 'brand_affinity', 'lifestyle_interests',
      'causes_care_about', 'social_media_stats', 'nil_preferences', 'bio',
      'profile_video_url', 'content_samples', 'total_followers',
      'avg_engagement_rate', 'profile_completion_score'
    );

  -- Count new indexes
  SELECT COUNT(*) INTO new_indexes_count
  FROM pg_indexes
  WHERE tablename = 'users'
    AND indexname LIKE 'idx_users_%'
    AND indexname IN (
      'idx_users_hobbies', 'idx_users_content_creation_interests', 'idx_users_brand_affinity',
      'idx_users_lifestyle_interests', 'idx_users_causes_care_about', 'idx_users_social_media_stats',
      'idx_users_nil_preferences', 'idx_users_content_samples', 'idx_users_total_followers',
      'idx_users_avg_engagement_rate', 'idx_users_profile_completion_score',
      'idx_users_athlete_matchmaking'
    );

  -- Count new functions
  SELECT COUNT(*) INTO new_functions_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'calculate_total_followers', 'calculate_avg_engagement_rate',
      'calculate_profile_completion_score', 'update_calculated_fields'
    );

  -- Count new triggers
  SELECT COUNT(*) INTO new_triggers_count
  FROM pg_trigger
  WHERE tgname = 'trigger_update_calculated_fields';

  -- Output verification results
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 016 Verification Results';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'New columns added: % (expected: 13)', new_columns_count;
  RAISE NOTICE 'New indexes created: % (expected: 12)', new_indexes_count;
  RAISE NOTICE 'New functions created: % (expected: 4)', new_functions_count;
  RAISE NOTICE 'New triggers created: % (expected: 1)', new_triggers_count;
  RAISE NOTICE '========================================';

  -- Verify all components exist
  IF new_columns_count = 13 AND new_indexes_count = 12 AND
     new_functions_count = 4 AND new_triggers_count = 1 THEN
    RAISE NOTICE 'SUCCESS: Migration 016 completed successfully!';
  ELSE
    RAISE WARNING 'INCOMPLETE: Some components may be missing. Review logs above.';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- 10. ROLLBACK INSTRUCTIONS
-- ============================================================================
/*
-- To rollback this migration, run the following commands:

BEGIN;

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_calculated_fields ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_calculated_fields();
DROP FUNCTION IF EXISTS calculate_profile_completion_score(users);
DROP FUNCTION IF EXISTS calculate_avg_engagement_rate(JSONB);
DROP FUNCTION IF EXISTS calculate_total_followers(JSONB);

-- Drop indexes
DROP INDEX IF EXISTS idx_users_athlete_matchmaking;
DROP INDEX IF EXISTS idx_users_profile_completion_score;
DROP INDEX IF EXISTS idx_users_avg_engagement_rate;
DROP INDEX IF EXISTS idx_users_total_followers;
DROP INDEX IF EXISTS idx_users_content_samples;
DROP INDEX IF EXISTS idx_users_nil_preferences;
DROP INDEX IF EXISTS idx_users_social_media_stats;
DROP INDEX IF EXISTS idx_users_causes_care_about;
DROP INDEX IF EXISTS idx_users_lifestyle_interests;
DROP INDEX IF EXISTS idx_users_brand_affinity;
DROP INDEX IF EXISTS idx_users_content_creation_interests;
DROP INDEX IF EXISTS idx_users_hobbies;

-- Drop columns
ALTER TABLE users DROP COLUMN IF EXISTS profile_completion_score;
ALTER TABLE users DROP COLUMN IF EXISTS avg_engagement_rate;
ALTER TABLE users DROP COLUMN IF EXISTS total_followers;
ALTER TABLE users DROP COLUMN IF EXISTS content_samples;
ALTER TABLE users DROP COLUMN IF EXISTS profile_video_url;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS nil_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS social_media_stats;
ALTER TABLE users DROP COLUMN IF EXISTS causes_care_about;
ALTER TABLE users DROP COLUMN IF EXISTS lifestyle_interests;
ALTER TABLE users DROP COLUMN IF EXISTS brand_affinity;
ALTER TABLE users DROP COLUMN IF EXISTS content_creation_interests;
ALTER TABLE users DROP COLUMN IF EXISTS hobbies;

COMMIT;
*/

-- ============================================================================
-- END OF MIGRATION 016
-- ============================================================================
