# Database Schema Audit Report
Generated: 2025-11-27T13:51:52.219Z


## Table: users
✅ Table exists with 22 columns

### ℹ️ Extra Columns (in DB but not expected by app):
- `user_type`
- `full_name`
- `school_created`
- `profile_completion_tier`
- `home_completion_required`

### Actual Columns:
```
id, email, user_type, full_name, profile_photo, username, onboarding_completed, created_at, updated_at, role, company_name, industry, school_id, school_name, school_created, profile_completion_tier, home_completion_required, first_name, last_name, date_of_birth, phone, parent_email
```

## Table: athlete_profiles
✅ Table exists with 37 columns

### ⚠️ Missing Columns:
- `id`
- `primary_sport`
- `coach_name`
- `coach_email`
- `social_media_stats`
- `content_creation_interests`
- `brand_affinity`
- `causes_care_about`
- `lifestyle_interests`
- `hobbies`

### ℹ️ Extra Columns (in DB but not expected by app):
- `height`
- `weight`
- `profile_photo_url`
- `username`
- `graduation_year`
- `stats`
- `nil_interests`
- `nil_concerns`
- `nil_goals`
- `twitch_channel`
- `linkedin_url`
- `cover_photo_url`
- `profile_video_url`
- `content_samples`
- `preferred_partnership_types`
- `brand_preferences`
- `profile_completion_score`
- `profile_completion_tier`
- `last_profile_update`
- `profile_views`

### Actual Columns:
```
user_id, sport, position, school, year, height, weight, estimated_fmv, profile_photo_url, bio, achievements, created_at, updated_at, username, graduation_year, major, gpa, height_inches, weight_lbs, jersey_number, secondary_sports, stats, nil_interests, nil_concerns, nil_goals, nil_preferences, twitch_channel, linkedin_url, cover_photo_url, profile_video_url, content_samples, preferred_partnership_types, brand_preferences, profile_completion_score, profile_completion_tier, last_profile_update, profile_views
```

## Table: social_media_stats
✅ Table exists with 10 columns

### ⚠️ Missing Columns:
- `platform`
- `handle`
- `followers`
- `instagram_engagement`
- `tiktok_engagement`
- `twitter_engagement`

### ℹ️ Extra Columns (in DB but not expected by app):
- `total_followers`

### Actual Columns:
```
id, user_id, instagram_followers, tiktok_followers, twitter_followers, youtube_subscribers, total_followers, engagement_rate, created_at, updated_at
```

## Table: chat_sessions
❌ **TABLE MISSING OR INACCESSIBLE**
Error: Could not find the table 'public.chat_sessions' in the schema cache

## Table: chat_messages
❌ **TABLE MISSING OR INACCESSIBLE**
Error: Could not find the table 'public.chat_messages' in the schema cache

## Table: agency_athlete_lists
✅ Table exists with 6 columns

### ⚠️ Missing Columns:
- `agency_user_id`
- `list_name`
- `description`

### ℹ️ Extra Columns (in DB but not expected by app):
- `agency_id`
- `athlete_id`
- `notes`

### Actual Columns:
```
id, agency_id, athlete_id, notes, created_at, updated_at
```

## Table: agency_athlete_list_items
✅ Table exists with 0 columns

### ⚠️ Missing Columns:
- `id`
- `list_id`
- `athlete_profile_id`
- `tags`
- `notes`
- `created_at`

### Actual Columns:
```

```

## Table: agency_athlete_messages
✅ Table exists with 0 columns

### ⚠️ Missing Columns:
- `id`
- `agency_user_id`
- `athlete_user_id`
- `thread_id`
- `sender_id`
- `message_text`
- `attachments`
- `is_read`
- `read_at`
- `created_at`

### Actual Columns:
```

```

## Table: athlete_public_profiles
✅ Table exists with 0 columns

### ⚠️ Missing Columns:
- `id`
- `user_id`
- `username`
- `sport`
- `position`
- `school`
- `state`
- `school_level`
- `content_categories`
- `total_followers`
- `avg_engagement_rate`
- `estimated_fmv_min`
- `estimated_fmv_max`
- `is_available_for_partnerships`
- `created_at`
- `updated_at`

### Actual Columns:
```

```


---

## Summary

This audit compared the application's expected database schema against the actual Supabase database.

### Action Items:
1. Review missing columns and determine if they need to be added
2. Review extra columns and determine if application code needs to use them
3. Run migrations to add any required missing columns
4. Update application code to match actual schema

