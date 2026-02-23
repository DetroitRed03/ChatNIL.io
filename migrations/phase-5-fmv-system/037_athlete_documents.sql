-- =============================================
-- Migration 037: Athlete Documents Table
-- =============================================
-- Stores non-deal documents (tax forms, receipts, IDs, etc.)
-- that don't require compliance review.

CREATE TABLE IF NOT EXISTS athlete_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_documents_athlete ON athlete_documents(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_documents_type ON athlete_documents(document_type);

-- RLS
ALTER TABLE athlete_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own athlete_documents'
  ) THEN
    CREATE POLICY "Users can view own athlete_documents"
      ON athlete_documents FOR SELECT
      USING (athlete_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own athlete_documents'
  ) THEN
    CREATE POLICY "Users can insert own athlete_documents"
      ON athlete_documents FOR INSERT
      WITH CHECK (athlete_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own athlete_documents'
  ) THEN
    CREATE POLICY "Users can delete own athlete_documents"
      ON athlete_documents FOR DELETE
      USING (athlete_id = auth.uid());
  END IF;
END $$;

-- Verification
SELECT 'athlete_documents table created' AS status;
