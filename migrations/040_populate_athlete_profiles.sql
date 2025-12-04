-- ============================================
-- POPULATE ATHLETE PUBLIC PROFILES
-- Migration 040 Data Population
-- ============================================

-- Insert public profiles for all existing athletes
INSERT INTO athlete_public_profiles (
  user_id,
  display_name,
  bio,
  sport,
  position,
  school_name,
  school_level,
  graduation_year,
  state,
  instagram_handle,
  instagram_followers,
  instagram_engagement_rate,
  tiktok_handle,
  tiktok_followers,
  tiktok_engagement_rate,
  twitter_handle,
  twitter_followers,
  youtube_channel,
  youtube_subscribers,
  estimated_fmv_min,
  estimated_fmv_max,
  avg_engagement_rate,
  content_categories,
  brand_values,
  audience_demographics,
  is_available_for_partnerships,
  preferred_partnership_types,
  response_rate,
  avg_response_time_hours,
  is_verified,
  total_partnerships_completed
)
SELECT
  u.id as user_id,
  COALESCE(u.first_name || ' ' || u.last_name, 'Athlete') as display_name,
  u.bio,
  COALESCE(u.primary_sport, 'Basketball') as sport,
  u.position,
  COALESCE(u.school_name, 'Unknown School') as school_name,
  CASE
    WHEN u.school_name ILIKE '%high%' THEN 'high_school'
    ELSE 'college'
  END as school_level,
  u.graduation_year,
  COALESCE(
    CASE
      WHEN u.school_name ILIKE '%kentucky%' THEN 'KY'
      WHEN u.school_name ILIKE '%california%' THEN 'CA'
      WHEN u.school_name ILIKE '%texas%' THEN 'TX'
      WHEN u.school_name ILIKE '%florida%' THEN 'FL'
      ELSE 'KY'
    END,
    'KY'
  ) as state,

  -- Social media handles (generated)
  '@' || LOWER(COALESCE(u.first_name, 'athlete')) || (RANDOM() * 999)::INTEGER as instagram_handle,

  -- Instagram stats (varies by sport)
  CASE
    WHEN u.primary_sport IN ('Basketball', 'Football')
    THEN (150000 + (RANDOM() * 100000))::INTEGER
    ELSE (40000 + (RANDOM() * 30000))::INTEGER
  END as instagram_followers,

  (4.0 + (RANDOM() * 5.0))::DECIMAL(5,2) as instagram_engagement_rate,

  -- TikTok
  '@' || LOWER(COALESCE(u.first_name, 'athlete')) || (RANDOM() * 999)::INTEGER as tiktok_handle,

  CASE
    WHEN u.primary_sport IN ('Basketball', 'Football')
    THEN (100000 + (RANDOM() * 80000))::INTEGER
    ELSE (30000 + (RANDOM() * 20000))::INTEGER
  END as tiktok_followers,

  (6.0 + (RANDOM() * 8.0))::DECIMAL(5,2) as tiktok_engagement_rate,

  -- Twitter
  '@' || LOWER(COALESCE(u.first_name, 'athlete')) || (RANDOM() * 999)::INTEGER as twitter_handle,

  CASE
    WHEN u.primary_sport IN ('Basketball', 'Football')
    THEN (50000 + (RANDOM() * 40000))::INTEGER
    ELSE (15000 + (RANDOM() * 15000))::INTEGER
  END as twitter_followers,

  -- YouTube
  LOWER(COALESCE(u.first_name, 'athlete')) || 'official' as youtube_channel,

  CASE
    WHEN u.primary_sport IN ('Basketball', 'Football')
    THEN (30000 + (RANDOM() * 20000))::INTEGER
    ELSE (10000 + (RANDOM() * 10000))::INTEGER
  END as youtube_subscribers,

  -- FMV based on sport
  CASE
    WHEN u.primary_sport = 'Basketball' THEN 15000
    WHEN u.primary_sport = 'Football' THEN 20000
    WHEN u.primary_sport = 'Soccer' THEN 10000
    WHEN u.primary_sport = 'Baseball' THEN 8000
    WHEN u.primary_sport = 'Volleyball' THEN 6000
    ELSE 5000
  END as estimated_fmv_min,

  CASE
    WHEN u.primary_sport = 'Basketball' THEN 35000
    WHEN u.primary_sport = 'Football' THEN 50000
    WHEN u.primary_sport = 'Soccer' THEN 25000
    WHEN u.primary_sport = 'Baseball' THEN 20000
    WHEN u.primary_sport = 'Volleyball' THEN 15000
    ELSE 15000
  END as estimated_fmv_max,

  (5.0 + (RANDOM() * 6.0))::DECIMAL(5,2) as avg_engagement_rate,

  -- Content categories (random selection)
  ARRAY['fitness', 'lifestyle', 'sports']::TEXT[] as content_categories,

  -- Brand values (random selection)
  ARRAY['authenticity', 'excellence', 'community']::TEXT[] as brand_values,

  -- Audience demographics
  jsonb_build_object(
    'age_range', '16-24',
    'gender', 'mixed',
    'location', 'United States'
  ) as audience_demographics,

  true as is_available_for_partnerships,
  ARRAY['sponsored_posts', 'brand_ambassador', 'content_creation']::TEXT[] as preferred_partnership_types,
  (80.0 + (RANDOM() * 20.0))::DECIMAL(5,2) as response_rate,
  (2 + (RANDOM() * 22)::INTEGER) as avg_response_time_hours,
  false as is_verified,
  (RANDOM() * 5)::INTEGER as total_partnerships_completed

FROM users u
WHERE u.role = 'athlete'
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  sport = EXCLUDED.sport,
  position = EXCLUDED.position,
  school_name = EXCLUDED.school_name,
  school_level = EXCLUDED.school_level,
  graduation_year = EXCLUDED.graduation_year,
  updated_at = NOW();

-- Verify the inserts
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN sport = 'Basketball' THEN 1 END) as basketball_count,
  COUNT(CASE WHEN sport = 'Football' THEN 1 END) as football_count,
  AVG(instagram_followers) as avg_instagram_followers,
  AVG(total_followers) as avg_total_followers,
  MIN(estimated_fmv_min) as min_fmv,
  MAX(estimated_fmv_max) as max_fmv
FROM athlete_public_profiles;

-- Show sample profiles
SELECT
  display_name,
  sport,
  school_name,
  instagram_followers,
  tiktok_followers,
  total_followers,
  estimated_fmv_min,
  estimated_fmv_max
FROM athlete_public_profiles
ORDER BY total_followers DESC
LIMIT 5;
