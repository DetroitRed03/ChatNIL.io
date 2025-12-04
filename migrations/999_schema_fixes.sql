-- Database Schema Migrations
-- Generated: 2025-11-27T13:51:52.222Z
-- Run these migrations to add missing columns

ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS id TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS primary_sport TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS coach_name TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS coach_email TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS social_media_stats TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS content_creation_interests TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS brand_affinity TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS causes_care_about TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS lifestyle_interests TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS hobbies TEXT; -- TODO: Set proper data type
ALTER TABLE social_media_stats ADD COLUMN IF NOT EXISTS platform TEXT; -- TODO: Set proper data type
ALTER TABLE social_media_stats ADD COLUMN IF NOT EXISTS handle TEXT; -- TODO: Set proper data type
ALTER TABLE social_media_stats ADD COLUMN IF NOT EXISTS followers TEXT; -- TODO: Set proper data type
ALTER TABLE social_media_stats ADD COLUMN IF NOT EXISTS instagram_engagement TEXT; -- TODO: Set proper data type
ALTER TABLE social_media_stats ADD COLUMN IF NOT EXISTS tiktok_engagement TEXT; -- TODO: Set proper data type
ALTER TABLE social_media_stats ADD COLUMN IF NOT EXISTS twitter_engagement TEXT; -- TODO: Set proper data type
-- TODO: Create table chat_sessions
-- Expected columns: id, user_id, title, created_at, updated_at, last_message_at

-- TODO: Create table chat_messages
-- Expected columns: id, session_id, role, content, created_at

ALTER TABLE agency_athlete_lists ADD COLUMN IF NOT EXISTS agency_user_id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_lists ADD COLUMN IF NOT EXISTS list_name TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_lists ADD COLUMN IF NOT EXISTS description TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_list_items ADD COLUMN IF NOT EXISTS id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_list_items ADD COLUMN IF NOT EXISTS list_id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_list_items ADD COLUMN IF NOT EXISTS athlete_profile_id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_list_items ADD COLUMN IF NOT EXISTS tags TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_list_items ADD COLUMN IF NOT EXISTS notes TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_list_items ADD COLUMN IF NOT EXISTS created_at TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS agency_user_id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS athlete_user_id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS thread_id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS sender_id TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS message_text TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS attachments TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS is_read TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS read_at TEXT; -- TODO: Set proper data type
ALTER TABLE agency_athlete_messages ADD COLUMN IF NOT EXISTS created_at TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS id TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS user_id TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS username TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS sport TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS position TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS school TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS state TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS school_level TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS content_categories TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS total_followers TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS avg_engagement_rate TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS estimated_fmv_min TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS estimated_fmv_max TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS is_available_for_partnerships TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS created_at TEXT; -- TODO: Set proper data type
ALTER TABLE athlete_public_profiles ADD COLUMN IF NOT EXISTS updated_at TEXT; -- TODO: Set proper data type
