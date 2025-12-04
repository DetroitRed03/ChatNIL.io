-- Fix foreign key references from auth.users to public.users
-- This allows proper data insertion without schema cache issues

-- Drop existing foreign key constraints
ALTER TABLE athlete_public_profiles
DROP CONSTRAINT IF EXISTS athlete_public_profiles_user_id_fkey;

ALTER TABLE agency_campaigns
DROP CONSTRAINT IF EXISTS agency_campaigns_agency_user_id_fkey;

ALTER TABLE agency_athlete_messages
DROP CONSTRAINT IF EXISTS agency_athlete_messages_agency_user_id_fkey,
DROP CONSTRAINT IF EXISTS agency_athlete_messages_athlete_user_id_fkey,
DROP CONSTRAINT IF EXISTS agency_athlete_messages_sender_id_fkey;

-- Add correct foreign key constraints to public.users
ALTER TABLE athlete_public_profiles
ADD CONSTRAINT athlete_public_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE agency_campaigns
ADD CONSTRAINT agency_campaigns_agency_user_id_fkey
FOREIGN KEY (agency_user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE agency_athlete_messages
ADD CONSTRAINT agency_athlete_messages_agency_user_id_fkey
FOREIGN KEY (agency_user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT agency_athlete_messages_athlete_user_id_fkey
FOREIGN KEY (athlete_user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT agency_athlete_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
