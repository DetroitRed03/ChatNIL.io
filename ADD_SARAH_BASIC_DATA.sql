-- ============================================
-- Add Basic Data for Sarah Johnson
-- Using ONLY safe columns (non-array fields)
-- ============================================

UPDATE athlete_profiles
SET
  -- Physical Stats
  height_inches = 70,  -- 5'10"
  weight_lbs = 145,
  jersey_number = '23',

  -- Photos (Unsplash placeholder URLs)
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
  year,
  height_inches,
  weight_lbs,
  jersey_number,
  profile_photo_url,
  cover_photo_url,
  major,
  gpa,
  nil_interests,
  nil_goals,
  estimated_fmv,
  profile_completion_score
FROM athlete_profiles
WHERE user_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';
