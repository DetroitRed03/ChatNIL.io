-- ============================================
-- FIX ATHLETE NAMES DATA INTEGRITY
-- Migration 250
-- ============================================
-- Problem: athlete_profiles and agency_athlete_lists reference user IDs
-- that don't exist in the users table, causing "Unknown" names in agency dashboard

BEGIN;

-- Step 1: Create users entries for orphaned athlete profiles
-- These athletes have profiles but no users entry

-- Athlete 1: UCLA Basketball (from agency_athlete_lists)
INSERT INTO users (id, email, first_name, last_name, role, onboarding_completed, created_at, updated_at)
VALUES (
  '7a799d45-d306-4622-b70f-46e7444e1caa',
  'marcus.williams@athlete.chatnil.com',
  'Marcus',
  'Williams',
  'athlete',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  first_name = COALESCE(users.first_name, EXCLUDED.first_name),
  last_name = COALESCE(users.last_name, EXCLUDED.last_name),
  updated_at = NOW();

-- Athlete 2: USC Football (from agency_athlete_lists)
INSERT INTO users (id, email, first_name, last_name, role, onboarding_completed, created_at, updated_at)
VALUES (
  'f496bd63-2c98-42af-a976-6b42528d0a59',
  'james.thompson@athlete.chatnil.com',
  'James',
  'Thompson',
  'athlete',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  first_name = COALESCE(users.first_name, EXCLUDED.first_name),
  last_name = COALESCE(users.last_name, EXCLUDED.last_name),
  updated_at = NOW();

-- Step 2: Add Sarah Johnson to the Nike agency's athlete list
-- She's a fully populated test athlete that should appear in the dashboard
INSERT INTO agency_athlete_lists (agency_id, athlete_id, notes, created_at, updated_at)
VALUES (
  '3f270e9b-cc2b-48a0-b82e-52fdf1094879',  -- Nike agency
  'ca05429a-0f32-4280-8b71-99dc5baee0dc',  -- Sarah Johnson
  'Top prospect - UCLA Basketball star with strong social presence',
  NOW(),
  NOW()
)
ON CONFLICT (agency_id, athlete_id) DO NOTHING;

-- Step 3: Create athlete_public_profiles entries for all athletes
-- This populates the display_name field used by discovery

INSERT INTO athlete_public_profiles (
  user_id,
  display_name,
  sport,
  position,
  school_name,
  is_available_for_partnerships,
  created_at,
  updated_at
)
SELECT
  u.id,
  TRIM(CONCAT(u.first_name, ' ', u.last_name)),
  ap.sport,
  ap.position,
  ap.school,
  true,
  NOW(),
  NOW()
FROM users u
JOIN athlete_profiles ap ON ap.user_id = u.id
WHERE u.role = 'athlete'
  AND NOT EXISTS (
    SELECT 1 FROM athlete_public_profiles app WHERE app.user_id = u.id
  );

-- Step 4: Verify the fix
SELECT
  'Fix Applied' as status,
  (SELECT COUNT(*) FROM users WHERE role = 'athlete') as total_athletes,
  (SELECT COUNT(*) FROM athlete_profiles) as total_profiles,
  (SELECT COUNT(*) FROM athlete_public_profiles) as total_public_profiles,
  (SELECT COUNT(*) FROM agency_athlete_lists WHERE agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879') as nike_saved_athletes;

COMMIT;
