-- Fix the function to use correct column names (first_name, last_name instead of full_name)
DROP FUNCTION IF EXISTS calculate_profile_completion_score(users);

CREATE FUNCTION calculate_profile_completion_score(user_row users)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  max_score INTEGER := 20;
BEGIN
  -- Core profile fields (40 points total, 2 points each)
  IF user_row.first_name IS NOT NULL AND user_row.first_name != '' THEN score := score + 1; END IF;
  IF user_row.last_name IS NOT NULL AND user_row.last_name != '' THEN score := score + 1; END IF;
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

  -- Interest fields with COALESCE fix for NULL handling
  IF user_row.hobbies IS NOT NULL AND COALESCE(array_length(user_row.hobbies, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.lifestyle_interests IS NOT NULL AND COALESCE(array_length(user_row.lifestyle_interests, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.brand_affinity IS NOT NULL AND COALESCE(array_length(user_row.brand_affinity, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.causes_care_about IS NOT NULL AND COALESCE(array_length(user_row.causes_care_about, 1), 0) > 0 THEN score := score + 3; END IF;
  IF user_row.content_creation_interests IS NOT NULL AND COALESCE(array_length(user_row.content_creation_interests, 1), 0) > 0 THEN score := score + 3; END IF;

  -- Social media fields (10 points total, 5 points each)
  IF user_row.social_media_stats IS NOT NULL AND jsonb_array_length(user_row.social_media_stats) > 0 THEN score := score + 5; END IF;
  IF user_row.content_samples IS NOT NULL AND jsonb_array_length(user_row.content_samples) > 0 THEN score := score + 5; END IF;

  -- NIL preferences (5 points)
  IF user_row.nil_preferences IS NOT NULL AND user_row.nil_preferences != '{}'::jsonb THEN score := score + 5; END IF;

  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
