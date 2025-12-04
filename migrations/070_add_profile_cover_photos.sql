-- ============================================================================
-- Migration 070: Profile and Cover Photo Support + Athlete Profile Enhancements
-- ============================================================================
-- Description: Adds cover_photo_url field, timestamps for cache busting,
--              athlete physical stats (height, weight, jersey), and creates
--              public storage bucket for profile media
-- Dependencies: Migration 052 (Storage bucket infrastructure)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. PROFILE PHOTO FIELDS
-- ============================================================================

-- Add cover photo URL field
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Add photo upload timestamps for cache busting
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo_uploaded_at TIMESTAMPTZ;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS cover_photo_uploaded_at TIMESTAMPTZ;

-- Add column comments for documentation
COMMENT ON COLUMN users.profile_photo_url IS
  'URL to user profile photo stored in athlete-profile-media bucket';

COMMENT ON COLUMN users.cover_photo_url IS
  'URL to user cover/banner photo stored in athlete-profile-media bucket';

COMMENT ON COLUMN users.profile_photo_uploaded_at IS
  'Timestamp of last profile photo upload (for cache busting via ?v=timestamp)';

COMMENT ON COLUMN users.cover_photo_uploaded_at IS
  'Timestamp of last cover photo upload (for cache busting via ?v=timestamp)';

-- ============================================================================
-- 2. ATHLETE PHYSICAL STATS (for résumé-style profiles)
-- ============================================================================

-- Add height in inches (e.g., 74 = 6'2")
ALTER TABLE users
ADD COLUMN IF NOT EXISTS height_inches INTEGER;

-- Add weight in pounds
ALTER TABLE users
ADD COLUMN IF NOT EXISTS weight_lbs INTEGER;

-- Add jersey number
ALTER TABLE users
ADD COLUMN IF NOT EXISTS jersey_number INTEGER;

COMMENT ON COLUMN users.height_inches IS
  'Athlete height in inches (e.g., 74 = 6''2"). Convert to feet/inches for display.';

COMMENT ON COLUMN users.weight_lbs IS
  'Athlete weight in pounds. Display as "185 lbs"';

COMMENT ON COLUMN users.jersey_number IS
  'Athlete jersey number (if applicable)';

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for querying users with profile photos (for discovery/showcase)
CREATE INDEX IF NOT EXISTS idx_users_has_profile_photo
  ON users(profile_photo_url)
  WHERE profile_photo_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_has_cover_photo
  ON users(cover_photo_url)
  WHERE cover_photo_url IS NOT NULL;

-- ============================================================================
-- 4. CREATE ATHLETE-PROFILE-MEDIA STORAGE BUCKET
-- ============================================================================

-- Create athlete-profile-media bucket (PUBLIC for direct CDN access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'athlete-profile-media',
  'athlete-profile-media',
  true, -- Public bucket for profile/cover photos
  10485760, -- 10MB limit (smaller than documents bucket)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE storage.buckets IS
  'Storage buckets for file uploads. athlete-profile-media is public for profile photos, user-documents is private.';

-- ============================================================================
-- 5. RLS POLICIES FOR ATHLETE-PROFILE-MEDIA BUCKET
-- ============================================================================

-- Enable RLS on storage.objects (should already be enabled, but ensure)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload profile media to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile media" ON storage.objects;

-- Policy 1: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload profile media to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can upload profile media to own folder" ON storage.objects IS
  'Authenticated users can only upload profile/cover photos to their own user ID folder';

-- Policy 2: Public read access (anyone can view profile photos)
CREATE POLICY "Anyone can view profile media"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'athlete-profile-media'
);

COMMENT ON POLICY "Anyone can view profile media" ON storage.objects IS
  'Public read access for profile photos - needed for athlete discovery and public profiles';

-- Policy 3: Users can update their own files (for replacing photos)
CREATE POLICY "Users can update own profile media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own files
CREATE POLICY "Users can delete own profile media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'athlete-profile-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- 6. SUCCESS NOTIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 070 completed successfully!';
  RAISE NOTICE '📸 Added cover_photo_url field to users table';
  RAISE NOTICE '⏰ Added photo upload timestamp fields for cache busting';
  RAISE NOTICE '📏 Added athlete physical stats (height, weight, jersey)';
  RAISE NOTICE '🗄️  Created athlete-profile-media storage bucket (PUBLIC)';
  RAISE NOTICE '🔒 Created RLS policies for secure photo uploads';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Install sharp: npm install sharp';
  RAISE NOTICE '   2. Create photo upload API routes';
  RAISE NOTICE '   3. Create PhotoUpload component';
END $$;

COMMIT;
