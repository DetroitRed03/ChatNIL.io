-- ============================================
-- Add Complete Data for Sarah Johnson
-- ============================================
-- Run this in Supabase SQL Editor to add all missing fields

UPDATE athlete_profiles
SET
  -- Social Media Stats (JSONB format)
  social_media_stats = '{
    "instagram": {
      "handle": "@sarah_hoops",
      "followers": 45000,
      "engagement_rate": 8.5
    },
    "tiktok": {
      "handle": "@sarahbasketball",
      "followers": 82000,
      "engagement_rate": 12.3
    },
    "twitter": {
      "handle": "@SarahJHoops",
      "followers": 18000,
      "engagement_rate": 5.2
    }
  }'::jsonb,

  -- Calculated totals
  total_followers = 145000,
  avg_engagement_rate = 8.67,

  -- NIL Interests
  nil_interests = ARRAY['Athletic Apparel', 'Sports Nutrition', 'Training Equipment', 'Healthy Lifestyle'],

  -- Content Creation Interests
  content_creation_interests = ARRAY['Instagram Reels', 'TikTok Videos', 'YouTube Shorts', 'Behind-the-Scenes'],

  -- Lifestyle Interests
  lifestyle_interests = ARRAY['Fitness', 'Nutrition', 'Mental Health', 'Fashion'],

  -- Hobbies
  hobbies = ARRAY['Photography', 'Cooking', 'Reading', 'Yoga'],

  -- Causes Care About
  causes_care_about = ARRAY['Youth Sports Access', 'Mental Health Awareness', 'Women in Sports', 'Education Equity'],

  -- Brand Affinity
  brand_affinity = ARRAY['Nike', 'Gatorade', 'Beats by Dre', 'Apple'],

  -- Physical Stats
  height_inches = 70,  -- 5'10"
  weight_lbs = 145,
  jersey_number = 23,

  -- Team Info
  team_name = 'UCLA Bruins',
  division = 'NCAA Division I',

  -- NIL Preferences (JSONB)
  nil_preferences = '{
    "preferred_deal_types": ["social_media_posts", "brand_ambassador", "appearances", "content_creation"],
    "min_compensation": 500,
    "max_compensation": 25000,
    "preferred_partnership_length": "3_6_months",
    "content_types_willing": ["instagram_posts", "tiktok_videos", "instagram_reels", "instagram_stories"],
    "travel_willing": true,
    "blacklist_categories": ["alcohol", "gambling"],
    "requires_agent_approval": false,
    "requires_parent_approval": false,
    "additional_notes": "Looking for brands that align with empowering young athletes and promoting healthy lifestyles."
  }'::jsonb,

  -- Photos (placeholder URLs - replace with actual URLs later)
  profile_photo_url = 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=400',
  cover_photo_url = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',

  -- Academic Info
  major = 'Communications',
  gpa = 3.7,

  -- Update timestamp
  updated_at = now()

WHERE user_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

-- Verify the update
SELECT
  username,
  sport,
  position,
  school,
  total_followers,
  avg_engagement_rate,
  social_media_stats->>'instagram' as instagram_data,
  array_length(nil_interests, 1) as nil_interests_count,
  array_length(causes_care_about, 1) as causes_count,
  height_inches,
  weight_lbs,
  jersey_number,
  major,
  gpa
FROM athlete_profiles
WHERE user_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';
