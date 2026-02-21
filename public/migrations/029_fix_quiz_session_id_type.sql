-- Migration 029: Fix quiz system — create missing table, fix column types, fix RPC functions
--
-- ISSUES FOUND:
-- 1. user_quiz_progress table was never created (migration 009 not applied)
-- 2. quiz_session_id was defined as uuid in migration 009, but app generates short text codes
-- 3. record_quiz_answer RPC referenced non-existent correct_answer_index column
-- 4. quiz_questions missing explanation, times_answered, times_correct columns
--
-- This migration creates the table correctly from scratch with text session ID.

-- Step 0: Ensure quiz_status enum exists
DO $$ BEGIN
    CREATE TYPE quiz_status AS ENUM ('in_progress', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 1: Create user_quiz_progress table with quiz_session_id as TEXT
CREATE TABLE IF NOT EXISTS user_quiz_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  attempt_number integer DEFAULT 1,
  status quiz_status DEFAULT 'in_progress',
  user_answer jsonb,
  user_answer_index integer,
  is_correct boolean,
  time_taken_seconds integer,
  points_earned integer DEFAULT 0,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5),
  hints_used integer DEFAULT 0,
  resources_viewed text[] DEFAULT '{}',
  quiz_session_id text,  -- TEXT not uuid — app generates short alphanumeric codes
  session_score integer,
  session_total_questions integer,
  user_feedback text,
  flagged_for_review boolean DEFAULT false,
  notes text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 2: RLS
ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own quiz progress" ON user_quiz_progress
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own quiz progress" ON user_quiz_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own quiz progress" ON user_quiz_progress
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage all quiz progress" ON user_quiz_progress
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Step 3: Indexes
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_id ON user_quiz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_question_id ON user_quiz_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_status ON user_quiz_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_session_id ON user_quiz_progress(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_completed_at ON user_quiz_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_is_correct ON user_quiz_progress(is_correct);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_question ON user_quiz_progress(user_id, question_id);

-- Step 4: Trigger
DO $$ BEGIN
  CREATE TRIGGER update_user_quiz_progress_updated_at
    BEFORE UPDATE ON user_quiz_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Step 5: Add missing columns to quiz_questions
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation text;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS times_answered integer DEFAULT 0;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS times_correct integer DEFAULT 0;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Step 6: Fixed record_quiz_answer — uses correct_answer (integer) not correct_answer_index
CREATE OR REPLACE FUNCTION record_quiz_answer(
  p_user_id uuid,
  p_question_id uuid,
  p_user_answer jsonb,
  p_user_answer_index integer,
  p_time_taken_seconds integer,
  p_quiz_session_id text DEFAULT NULL,
  p_confidence_level integer DEFAULT NULL
)
RETURNS TABLE(
  progress_id uuid,
  is_correct boolean,
  points_earned integer,
  explanation text
) AS $fn$
DECLARE
  v_correct_answer integer;
  v_is_correct boolean;
  v_points integer;
  v_explanation text;
  v_progress_id uuid;
  v_attempt_number integer;
BEGIN
  -- correct_answer is the integer index of the correct option
  SELECT qq.correct_answer, qq.points, qq.explanation
  INTO v_correct_answer, v_points, v_explanation
  FROM quiz_questions qq WHERE qq.id = p_question_id;

  -- Compare user's answer index with correct answer index
  v_is_correct := (p_user_answer_index = v_correct_answer);

  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO v_attempt_number
  FROM user_quiz_progress
  WHERE user_id = p_user_id AND question_id = p_question_id;

  IF NOT v_is_correct THEN v_points := 0; END IF;

  INSERT INTO user_quiz_progress (
    user_id, question_id, attempt_number, status,
    user_answer, user_answer_index, is_correct,
    time_taken_seconds, points_earned, confidence_level,
    quiz_session_id, completed_at
  ) VALUES (
    p_user_id, p_question_id, v_attempt_number, 'completed',
    p_user_answer, p_user_answer_index, v_is_correct,
    p_time_taken_seconds, v_points, p_confidence_level,
    p_quiz_session_id, now()
  ) RETURNING id INTO v_progress_id;

  UPDATE quiz_questions SET
    times_answered = COALESCE(times_answered, 0) + 1,
    times_correct = CASE WHEN v_is_correct THEN COALESCE(times_correct, 0) + 1 ELSE COALESCE(times_correct, 0) END
  WHERE id = p_question_id;

  RETURN QUERY SELECT v_progress_id, v_is_correct, v_points, v_explanation;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: get_quiz_session_results with text parameter
CREATE OR REPLACE FUNCTION get_quiz_session_results(p_session_id text)
RETURNS TABLE(
  total_questions integer,
  correct_answers integer,
  total_points integer,
  total_time_seconds integer,
  score_percentage numeric,
  completed_at timestamp with time zone
) AS $fn$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer,
    COUNT(CASE WHEN uqp.is_correct THEN 1 END)::integer,
    COALESCE(SUM(uqp.points_earned), 0)::integer,
    COALESCE(SUM(uqp.time_taken_seconds), 0)::integer,
    CASE WHEN COUNT(*) > 0
      THEN ROUND((COUNT(CASE WHEN uqp.is_correct THEN 1 END)::numeric / COUNT(*)::numeric * 100), 2)
      ELSE 0 END,
    MAX(uqp.completed_at)
  FROM user_quiz_progress uqp
  WHERE uqp.quiz_session_id = p_session_id AND uqp.status = 'completed';
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: get_user_quiz_stats (fixed in migration 030 — per-session avg score)
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id uuid)
RETURNS TABLE(
  total_questions_attempted integer,
  total_questions_correct integer,
  total_points_earned integer,
  average_score_percentage numeric,
  total_time_spent_seconds integer,
  quizzes_completed integer
) AS $fn$
BEGIN
  RETURN QUERY
  WITH session_scores AS (
    SELECT
      uqp.quiz_session_id,
      COUNT(*)::numeric AS session_total,
      COUNT(CASE WHEN uqp.is_correct THEN 1 END)::numeric AS session_correct
    FROM user_quiz_progress uqp
    WHERE uqp.user_id = p_user_id AND uqp.status = 'completed'
    GROUP BY uqp.quiz_session_id
  )
  SELECT
    COUNT(*)::integer,
    COUNT(CASE WHEN uqp.is_correct THEN 1 END)::integer,
    COALESCE(SUM(uqp.points_earned), 0)::integer,
    COALESCE(
      (SELECT ROUND(AVG(ss.session_correct / NULLIF(ss.session_total, 0) * 100), 2) FROM session_scores ss),
      0
    ),
    COALESCE(SUM(uqp.time_taken_seconds), 0)::integer,
    COUNT(DISTINCT uqp.quiz_session_id)::integer
  FROM user_quiz_progress uqp
  WHERE uqp.user_id = p_user_id AND uqp.status = 'completed';
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success
DO $$
BEGIN
    RAISE NOTICE 'Migration 029 completed: quiz system fully operational';
END $$;
