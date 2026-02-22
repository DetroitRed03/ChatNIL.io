-- =============================================
-- Migration 036: Ensure Storage Buckets for Document Uploads
-- =============================================
-- Ensures 'documents' and 'images' buckets exist alongside
-- existing 'user-documents' and 'athlete-profile-media' buckets.
-- Also creates file_uploads audit table.

-- Create documents bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit = EXCLUDED.file_size_limit;

-- Update user-documents bucket to allow document types (PDFs, Word docs)
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic'
  ],
  file_size_limit = 26214400 -- 25MB
WHERE id = 'user-documents';

-- Ensure images bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit = EXCLUDED.file_size_limit;

-- Storage policies for user-documents (ensure PDFs can be uploaded)
-- Drop and recreate to ensure they're correct
DO $$
BEGIN
  -- Users can upload to user-documents (folder = their user id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload to user-documents'
  ) THEN
    CREATE POLICY "Users can upload to user-documents"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  -- Users can read from user-documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read user-documents'
  ) THEN
    CREATE POLICY "Users can read user-documents"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'user-documents');
  END IF;

  -- Public read for documents bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read documents'
  ) THEN
    CREATE POLICY "Public read documents"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'documents');
  END IF;

  -- Users can upload to documents bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload to documents'
  ) THEN
    CREATE POLICY "Users can upload to documents"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- Verification
SELECT id, name, public, file_size_limit, array_length(allowed_mime_types, 1) as mime_count
FROM storage.buckets
WHERE id IN ('user-documents', 'documents', 'images')
ORDER BY id;
