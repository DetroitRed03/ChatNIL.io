-- Recreate the trigger with correct column names
-- Only watch columns that exist and affect profile completion score
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
    first_name,
    last_name,
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
