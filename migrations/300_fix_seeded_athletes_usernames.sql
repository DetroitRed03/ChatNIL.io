-- Migration 300: Fix Seeded Athletes Usernames
-- This migration updates seeded athlete usernames to use hyphenated format
-- and ensures data consistency between users and athlete_profiles tables
--
-- Format change: firstname_lastname -> firstname-lastname
-- Note: Sarah Johnson keeps 'sarah_johnson' as grandfathered (already has underscore)

BEGIN;

-- ============================================================================
-- 1. UPDATE EXISTING SEEDED ATHLETE USERNAMES TO HYPHENATED FORMAT
-- ============================================================================

-- Update Marcus Williams username (underscore to hyphen)
UPDATE users
SET username = 'marcus-williams',
    updated_at = NOW()
WHERE email = 'marcus.williams@demo.chatnil.io'
  AND (username IS NULL OR username = 'marcus_williams');

-- Update Emma Davis username
UPDATE users
SET username = 'emma-davis',
    updated_at = NOW()
WHERE email = 'emma.davis@demo.chatnil.io'
  AND (username IS NULL OR username = 'emma_davis');

-- Update Tyler Brown username
UPDATE users
SET username = 'tyler-brown',
    updated_at = NOW()
WHERE email = 'tyler.brown@demo.chatnil.io'
  AND (username IS NULL OR username = 'tyler_brown');

-- Update Olivia Martinez username
UPDATE users
SET username = 'olivia-martinez',
    updated_at = NOW()
WHERE email = 'olivia.martinez@demo.chatnil.io'
  AND (username IS NULL OR username = 'olivia_martinez');

-- Note: Sarah Johnson keeps her existing username (sarah_johnson)
-- as it's grandfathered and already works

-- ============================================================================
-- 2. ADD FIRST_NAME AND LAST_NAME TO USERS IF MISSING
-- ============================================================================

-- Update Sarah Johnson
UPDATE users
SET first_name = 'Sarah',
    last_name = 'Johnson',
    updated_at = NOW()
WHERE email = 'sarah.johnson@demo.chatnil.io'
  AND (first_name IS NULL OR last_name IS NULL);

-- Update Marcus Williams
UPDATE users
SET first_name = 'Marcus',
    last_name = 'Williams',
    updated_at = NOW()
WHERE email = 'marcus.williams@demo.chatnil.io'
  AND (first_name IS NULL OR last_name IS NULL);

-- Update Emma Davis
UPDATE users
SET first_name = 'Emma',
    last_name = 'Davis',
    updated_at = NOW()
WHERE email = 'emma.davis@demo.chatnil.io'
  AND (first_name IS NULL OR last_name IS NULL);

-- Update Tyler Brown
UPDATE users
SET first_name = 'Tyler',
    last_name = 'Brown',
    updated_at = NOW()
WHERE email = 'tyler.brown@demo.chatnil.io'
  AND (first_name IS NULL OR last_name IS NULL);

-- Update Olivia Martinez
UPDATE users
SET first_name = 'Olivia',
    last_name = 'Martinez',
    updated_at = NOW()
WHERE email = 'olivia.martinez@demo.chatnil.io'
  AND (first_name IS NULL OR last_name IS NULL);

-- ============================================================================
-- 3. ENSURE ALL EXISTING USERS WITHOUT USERNAME GET ONE
-- ============================================================================

-- Auto-generate usernames for any users that don't have one
-- This uses a function to generate unique usernames

CREATE OR REPLACE FUNCTION generate_missing_usernames()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    user_record RECORD;
    base_username TEXT;
    final_username TEXT;
    suffix INTEGER;
    users_updated INTEGER := 0;
BEGIN
    -- Find all users without usernames
    FOR user_record IN
        SELECT id, first_name, last_name, email
        FROM users
        WHERE username IS NULL
          AND (first_name IS NOT NULL AND last_name IS NOT NULL)
    LOOP
        -- Generate base username
        base_username := lower(
            regexp_replace(
                regexp_replace(
                    user_record.first_name || '-' || user_record.last_name,
                    '\s+', '-', 'g'
                ),
                '[^a-z0-9-]', '', 'g'
            )
        );

        -- Check for uniqueness and add suffix if needed
        final_username := base_username;
        suffix := 1;

        WHILE EXISTS (SELECT 1 FROM users WHERE username = final_username AND id != user_record.id) LOOP
            suffix := suffix + 1;
            final_username := base_username || '-' || suffix;
        END LOOP;

        -- Update the user with the generated username
        UPDATE users
        SET username = final_username,
            updated_at = NOW()
        WHERE id = user_record.id;

        users_updated := users_updated + 1;

        RAISE NOTICE 'Generated username % for user %', final_username, user_record.email;
    END LOOP;

    RETURN users_updated;
END;
$$;

-- Execute the function
SELECT generate_missing_usernames() as users_updated;

-- ============================================================================
-- 4. VERIFICATION QUERIES
-- ============================================================================

-- Verify seeded athletes have usernames
SELECT
    'Seeded Athletes Username Check' as check_type,
    email,
    username,
    first_name,
    last_name,
    CASE WHEN username IS NOT NULL THEN '✓' ELSE '✗' END as has_username
FROM users
WHERE email LIKE '%@demo.chatnil.io'
ORDER BY email;

-- Verify all athletes have usernames
SELECT
    'All Athletes Username Status' as check_type,
    COUNT(*) as total_athletes,
    COUNT(username) as with_username,
    COUNT(*) - COUNT(username) as missing_username
FROM users
WHERE role = 'athlete';

-- Summary of username formats
SELECT
    'Username Format Summary' as check_type,
    CASE
        WHEN username LIKE '%-%' THEN 'hyphenated'
        WHEN username LIKE '%_%' THEN 'underscored'
        ELSE 'other'
    END as format,
    COUNT(*) as count
FROM users
WHERE username IS NOT NULL
GROUP BY 1, 2
ORDER BY count DESC;

COMMIT;
