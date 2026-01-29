-- Migration 023: Create chapter_progress table for HS student chapter learning persistence
-- This table tracks student progress through NIL education chapters (Identity, Business, Money, Legacy)

-- Create chapter_progress table
CREATE TABLE IF NOT EXISTS chapter_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Chapter tracking
  pillar text NOT NULL, -- 'identity', 'business', 'money', 'legacy'
  question_id text NOT NULL, -- e.g., 'identity-1', 'business-2'
  question_index integer NOT NULL, -- 0-based index within the chapter

  -- User's response
  answer text NOT NULL,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Unique constraint to prevent duplicate entries for same question
  CONSTRAINT unique_user_chapter_question UNIQUE (user_id, pillar, question_index)
);

-- RLS disabled for simplicity - table only accessed via authenticated API routes
-- ALTER TABLE chapter_progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapter_progress_user_id ON chapter_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_pillar ON chapter_progress(pillar);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_user_pillar ON chapter_progress(user_id, pillar);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_question_index ON chapter_progress(question_index);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_chapter_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chapter_progress_updated_at
    BEFORE UPDATE ON chapter_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_chapter_progress_updated_at();

-- Add helpful comments for documentation
COMMENT ON TABLE chapter_progress IS 'Tracks student progress through NIL education chapters';
COMMENT ON COLUMN chapter_progress.pillar IS 'Chapter pillar: identity, business, money, or legacy';
COMMENT ON COLUMN chapter_progress.question_id IS 'Question identifier like identity-1, business-2';
COMMENT ON COLUMN chapter_progress.question_index IS '0-based index of question within the chapter';
COMMENT ON COLUMN chapter_progress.answer IS 'The student answer to the question';

-- Create xp_transactions table if it doesn't exist (used by progress API)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS disabled for simplicity - table only accessed via authenticated API routes
-- ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Create index for xp_transactions
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 023 completed: chapter_progress and xp_transactions tables created successfully!';
END $$;
