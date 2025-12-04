-- Populate missing height, weight, and jersey number for athlete profiles
-- This fixes the issue where profiles from the old database migration were missing physical stats

-- Update profiles with realistic data based on their sport and position

-- Basketball Guard (if not already populated)
UPDATE athlete_profiles
SET
  height_inches = 72,  -- 6'0"
  weight_lbs = 165,
  jersey_number = 10,
  updated_at = NOW()
WHERE sport = 'Basketball'
  AND position = 'Guard'
  AND (height_inches IS NULL OR weight_lbs IS NULL OR jersey_number IS NULL)
  AND user_id != (SELECT id FROM users WHERE email = 'sarah.johnson@test.com');

-- Football Wide Receiver
UPDATE athlete_profiles
SET
  height_inches = 73,  -- 6'1"
  weight_lbs = 195,
  jersey_number = 15,
  updated_at = NOW()
WHERE sport = 'Football'
  AND position = 'Wide Receiver'
  AND (height_inches IS NULL OR weight_lbs IS NULL OR jersey_number IS NULL);

-- Volleyball Outside Hitter
UPDATE athlete_profiles
SET
  height_inches = 69,  -- 5'9"
  weight_lbs = 155,
  jersey_number = 7,
  updated_at = NOW()
WHERE sport = 'Volleyball'
  AND position = 'Outside Hitter'
  AND (height_inches IS NULL OR weight_lbs IS NULL OR jersey_number IS NULL);

-- Add default values for any other profiles that might be missing this data
UPDATE athlete_profiles
SET
  height_inches = COALESCE(height_inches, 70),  -- Default 5'10"
  weight_lbs = COALESCE(weight_lbs, 160),      -- Default 160 lbs
  jersey_number = COALESCE(jersey_number, 0),   -- Default #0
  updated_at = NOW()
WHERE height_inches IS NULL OR weight_lbs IS NULL OR jersey_number IS NULL;
