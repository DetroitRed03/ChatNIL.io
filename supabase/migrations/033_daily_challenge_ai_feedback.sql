-- Create daily_question_answers table with AI feedback support

CREATE TABLE IF NOT EXISTS daily_question_answers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer text NOT NULL,
  quality_score integer,
  ai_feedback text,
  created_at timestamptz DEFAULT now()
);

-- Index for checking if user already answered today
CREATE INDEX IF NOT EXISTS idx_daily_answers_user_date
  ON daily_question_answers(user_id, created_at);

-- RLS policies
ALTER TABLE daily_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily answers"
  ON daily_question_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily answers"
  ON daily_question_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
