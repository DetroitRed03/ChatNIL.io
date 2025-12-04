-- ============================================
-- POPULATE ATHLETE PUBLIC PROFILES (FIXED)
-- Migration 251
-- ============================================
-- This migration properly joins users and athlete_profiles
-- to populate athlete_public_profiles for agency discovery

-- First, let's clear any existing data to avoid conflicts
DELETE FROM athlete_public_profiles;

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
  city,
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
  COALESCE(u.full_name, u.first_name || ' ' || u.last_name, 'Athlete') as display_name,
  ap.bio,
  COALESCE(ap.sport, 'Basketball') as sport,
  ap.position,
  COALESCE(u.school_name, ap.school, 'Unknown School') as school_name,
  CASE
    WHEN u.school_name ILIKE '%high%' OR ap.school ILIKE '%high%' THEN 'high_school'
    ELSE 'college'
  END as school_level,
  ap.graduation_year,
  COALESCE(
    CASE
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%kentucky%' THEN 'KY'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%ucla%' OR COALESCE(u.school_name, ap.school) ILIKE '%california%' THEN 'CA'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%usc%' THEN 'CA'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%stanford%' THEN 'CA'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%texas%' THEN 'TX'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%florida%' THEN 'FL'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%michigan%' THEN 'MI'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%ohio%' THEN 'OH'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%duke%' OR COALESCE(u.school_name, ap.school) ILIKE '%north carolina%' THEN 'NC'
      WHEN COALESCE(u.school_name, ap.school) ILIKE '%georgia%' THEN 'GA'
      ELSE 'KY'
    END,
    'KY'
  ) as state,
  NULL as city,

  -- Social media handles (generated)
  '@' || LOWER(REPLACE(COALESCE(u.full_name, u.first_name, 'athlete'), ' ', '')) || (RANDOM() * 999)::INTEGER as instagram_handle,

  -- Instagram stats (varies by sport)
  CASE
    WHEN COALESCE(ap.sport, 'Basketball') IN ('Basketball', 'Football')
    THEN (150000 + (RANDOM() * 100000))::INTEGER
    ELSE (40000 + (RANDOM() * 30000))::INTEGER
  END as instagram_followers,

  (4.0 + (RANDOM() * 5.0))::DECIMAL(5,2) as instagram_engagement_rate,

  -- TikTok
  '@' || LOWER(REPLACE(COALESCE(u.full_name, u.first_name, 'athlete'), ' ', '')) || (RANDOM() * 999)::INTEGER as tiktok_handle,

  CASE
    WHEN COALESCE(ap.sport, 'Basketball') IN ('Basketball', 'Football')
    THEN (100000 + (RANDOM() * 80000))::INTEGER
    ELSE (30000 + (RANDOM() * 20000))::INTEGER
  END as tiktok_followers,

  (6.0 + (RANDOM() * 8.0))::DECIMAL(5,2) as tiktok_engagement_rate,

  -- Twitter
  '@' || LOWER(REPLACE(COALESCE(u.full_name, u.first_name, 'athlete'), ' ', '')) || (RANDOM() * 999)::INTEGER as twitter_handle,

  CASE
    WHEN COALESCE(ap.sport, 'Basketball') IN ('Basketball', 'Football')
    THEN (50000 + (RANDOM() * 40000))::INTEGER
    ELSE (15000 + (RANDOM() * 15000))::INTEGER
  END as twitter_followers,

  -- YouTube
  LOWER(REPLACE(COALESCE(u.full_name, u.first_name, 'athlete'), ' ', '')) || 'official' as youtube_channel,

  CASE
    WHEN COALESCE(ap.sport, 'Basketball') IN ('Basketball', 'Football')
    THEN (30000 + (RANDOM() * 20000))::INTEGER
    ELSE (10000 + (RANDOM() * 10000))::INTEGER
  END as youtube_subscribers,

  -- FMV based on sport and estimated_fmv from athlete_profiles
  COALESCE(
    CASE
      WHEN ap.estimated_fmv IS NOT NULL THEN (ap.estimated_fmv * 0.7)::INTEGER
      WHEN ap.sport = 'Basketball' THEN 15000
      WHEN ap.sport = 'Football' THEN 20000
      WHEN ap.sport = 'Soccer' THEN 10000
      WHEN ap.sport = 'Baseball' THEN 8000
      WHEN ap.sport = 'Volleyball' THEN 6000
      ELSE 5000
    END,
    5000
  ) as estimated_fmv_min,

  COALESCE(
    CASE
      WHEN ap.estimated_fmv IS NOT NULL THEN (ap.estimated_fmv * 1.3)::INTEGER
      WHEN ap.sport = 'Basketball' THEN 35000
      WHEN ap.sport = 'Football' THEN 50000
      WHEN ap.sport = 'Soccer' THEN 25000
      WHEN ap.sport = 'Baseball' THEN 20000
      WHEN ap.sport = 'Volleyball' THEN 15000
      ELSE 15000
    END,
    15000
  ) as estimated_fmv_max,

  (5.0 + (RANDOM() * 6.0))::DECIMAL(5,2) as avg_engagement_rate,

  -- Content categories
  ARRAY['fitness', 'lifestyle', 'sports']::TEXT[] as content_categories,

  -- Brand values
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
LEFT JOIN athlete_profiles ap ON ap.user_id = u.id
WHERE u.role = 'athlete'
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  sport = EXCLUDED.sport,
  position = EXCLUDED.position,
  school_name = EXCLUDED.school_name,
  school_level = EXCLUDED.school_level,
  graduation_year = EXCLUDED.graduation_year,
  state = EXCLUDED.state,
  instagram_followers = EXCLUDED.instagram_followers,
  tiktok_followers = EXCLUDED.tiktok_followers,
  twitter_followers = EXCLUDED.twitter_followers,
  youtube_subscribers = EXCLUDED.youtube_subscribers,
  estimated_fmv_min = EXCLUDED.estimated_fmv_min,
  estimated_fmv_max = EXCLUDED.estimated_fmv_max,
  avg_engagement_rate = EXCLUDED.avg_engagement_rate,
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
  state,
  instagram_followers,
  tiktok_followers,
  total_followers,
  estimated_fmv_min,
  estimated_fmv_max,
  is_available_for_partnerships
FROM athlete_public_profiles
ORDER BY total_followers DESC
LIMIT 10;
