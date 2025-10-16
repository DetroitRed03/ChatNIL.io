-- Migration 009: Create user_quiz_progress table to track quiz attempts and learning
-- This table records all quiz attempts, scores, and learning progress

-- Create quiz status enum
DO $$ BEGIN
    CREATE TYPE quiz_status AS ENUM ('in_progress', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_quiz_progress table
CREATE TABLE IF NOT EXISTS user_quiz_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,

  -- Attempt tracking
  attempt_number integer DEFAULT 1, -- How many times user has attempted this question
  status quiz_status DEFAULT 'in_progress',

  -- User's response
  user_answer jsonb, -- User's selected answer(s)
  user_answer_index integer, -- Index of user's answer for multiple choice
  is_correct boolean,

  -- Performance metrics
  time_taken_seconds integer, -- How long it took to answer
  points_earned integer DEFAULT 0,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5), -- 1-5 scale

  -- Learning data
  hints_used integer DEFAULT 0,
  resources_viewed text[] DEFAULT '{}', -- Which learning resources user viewed

  -- Quiz session data
  quiz_session_id uuid, -- Groups questions taken together in same quiz session
  session_score integer, -- Score for entire quiz session (if applicable)
  session_total_questions integer, -- Total questions in the session

  -- Feedback
  user_feedback text, -- Optional feedback about the question
  flagged_for_review boolean DEFAULT false, -- User can flag question as unclear/incorrect

  -- Metadata
  notes text,

  -- Timestamps
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own quiz progress
CREATE POLICY "Users can view own quiz progress" ON user_quiz_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz progress" ON user_quiz_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz progress" ON user_quiz_progress
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can access all progress for analytics
CREATE POLICY "Service role can manage all quiz progress" ON user_quiz_progress
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_id ON user_quiz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_question_id ON user_quiz_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_status ON user_quiz_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_session_id ON user_quiz_progress(quiz_session_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_completed_at ON user_quiz_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_is_correct ON user_quiz_progress(is_correct);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_question ON user_quiz_progress(user_id, question_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_quiz_progress_updated_at
    BEFORE UPDATE ON user_quiz_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments for documentation
COMMENT ON TABLE user_quiz_progress IS 'Tracks all quiz attempts and learning progress for each user';
COMMENT ON COLUMN user_quiz_progress.attempt_number IS 'Number of times user has attempted this specific question';
COMMENT ON COLUMN user_quiz_progress.quiz_session_id IS 'Groups multiple questions taken together in one quiz session';
COMMENT ON COLUMN user_quiz_progress.confidence_level IS 'User self-reported confidence (1=not confident, 5=very confident)';
COMMENT ON COLUMN user_quiz_progress.flagged_for_review IS 'User can flag questions as unclear or potentially incorrect';

-- Create function to record a quiz answer
CREATE OR REPLACE FUNCTION record_quiz_answer(
  p_user_id uuid,
  p_question_id uuid,
  p_user_answer jsonb,
  p_user_answer_index integer,
  p_time_taken_seconds integer,
  p_quiz_session_id uuid DEFAULT NULL,
  p_confidence_level integer DEFAULT NULL
)
RETURNS TABLE(
  progress_id uuid,
  is_correct boolean,
  points_earned integer,
  explanation text
) AS $$
DECLARE
  v_correct_answer jsonb;
  v_correct_answer_index integer;
  v_is_correct boolean;
  v_points integer;
  v_explanation text;
  v_progress_id uuid;
  v_attempt_number integer;
BEGIN
  -- Get the correct answer and points for this question
  SELECT
    qq.correct_answer,
    qq.correct_answer_index,
    qq.points,
    qq.explanation
  INTO v_correct_answer, v_correct_answer_index, v_points, v_explanation
  FROM quiz_questions qq
  WHERE qq.id = p_question_id;

  -- Determine if answer is correct
  IF p_user_answer_index IS NOT NULL AND v_correct_answer_index IS NOT NULL THEN
    v_is_correct := (p_user_answer_index = v_correct_answer_index);
  ELSE
    v_is_correct := (p_user_answer = v_correct_answer);
  END IF;

  -- Get attempt number
  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO v_attempt_number
  FROM user_quiz_progress
  WHERE user_id = p_user_id AND question_id = p_question_id;

  -- Award points if correct
  IF v_is_correct THEN
    v_points := v_points;
  ELSE
    v_points := 0;
  END IF;

  -- Insert the quiz progress record
  INSERT INTO user_quiz_progress (
    user_id,
    question_id,
    attempt_number,
    status,
    user_answer,
    user_answer_index,
    is_correct,
    time_taken_seconds,
    points_earned,
    confidence_level,
    quiz_session_id,
    completed_at
  ) VALUES (
    p_user_id,
    p_question_id,
    v_attempt_number,
    'completed',
    p_user_answer,
    p_user_answer_index,
    v_is_correct,
    p_time_taken_seconds,
    v_points,
    p_confidence_level,
    p_quiz_session_id,
    now()
  )
  RETURNING id INTO v_progress_id;

  -- Update question statistics
  UPDATE quiz_questions
  SET
    times_answered = times_answered + 1,
    times_correct = CASE WHEN v_is_correct THEN times_correct + 1 ELSE times_correct END
  WHERE id = p_question_id;

  -- Return results
  RETURN QUERY SELECT v_progress_id, v_is_correct, v_points, v_explanation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's quiz statistics
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id uuid)
RETURNS TABLE(
  total_questions_attempted integer,
  total_questions_correct integer,
  total_points_earned integer,
  average_score_percentage numeric,
  total_time_spent_seconds integer,
  quizzes_completed integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT question_id)::integer as total_questions_attempted,
    COUNT(CASE WHEN is_correct THEN 1 END)::integer as total_questions_correct,
    COALESCE(SUM(points_earned), 0)::integer as total_points_earned,
    CASE
      WHEN COUNT(DISTINCT question_id) > 0
      THEN ROUND((COUNT(CASE WHEN is_correct THEN 1 END)::numeric / COUNT(DISTINCT question_id)::numeric * 100), 2)
      ELSE 0
    END as average_score_percentage,
    COALESCE(SUM(time_taken_seconds), 0)::integer as total_time_spent_seconds,
    COUNT(DISTINCT quiz_session_id)::integer as quizzes_completed
  FROM user_quiz_progress
  WHERE user_id = p_user_id AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get quiz session results
CREATE OR REPLACE FUNCTION get_quiz_session_results(p_session_id uuid)
RETURNS TABLE(
  total_questions integer,
  correct_answers integer,
  total_points integer,
  total_time_seconds integer,
  score_percentage numeric,
  completed_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer as total_questions,
    COUNT(CASE WHEN is_correct THEN 1 END)::integer as correct_answers,
    COALESCE(SUM(points_earned), 0)::integer as total_points,
    COALESCE(SUM(time_taken_seconds), 0)::integer as total_time_seconds,
    CASE
      WHEN COUNT(*) > 0
      THEN ROUND((COUNT(CASE WHEN is_correct THEN 1 END)::numeric / COUNT(*)::numeric * 100), 2)
      ELSE 0
    END as score_percentage,
    MAX(uqp.completed_at) as completed_at
  FROM user_quiz_progress uqp
  WHERE uqp.quiz_session_id = p_session_id AND uqp.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recommended questions for a user
CREATE OR REPLACE FUNCTION get_recommended_questions(
  p_user_id uuid,
  p_category quiz_category DEFAULT NULL,
  p_difficulty quiz_difficulty DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  question_id uuid,
  question text,
  category quiz_category,
  difficulty quiz_difficulty,
  times_attempted integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qq.id as question_id,
    qq.question,
    qq.category,
    qq.difficulty,
    COALESCE(COUNT(uqp.id), 0)::integer as times_attempted
  FROM quiz_questions qq
  LEFT JOIN user_quiz_progress uqp ON qq.id = uqp.question_id AND uqp.user_id = p_user_id
  WHERE
    qq.is_active = true
    AND (p_category IS NULL OR qq.category = p_category)
    AND (p_difficulty IS NULL OR qq.difficulty = p_difficulty)
  GROUP BY qq.id, qq.question, qq.category, qq.difficulty, qq.display_order
  ORDER BY
    -- Prioritize questions not yet attempted
    CASE WHEN COUNT(uqp.id) = 0 THEN 0 ELSE 1 END,
    -- Then by display order
    qq.display_order,
    -- Then randomly for variety
    RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for functions
COMMENT ON FUNCTION record_quiz_answer IS 'Records a quiz answer and returns whether it was correct, points earned, and explanation';
COMMENT ON FUNCTION get_user_quiz_stats IS 'Returns comprehensive quiz statistics for a user';
COMMENT ON FUNCTION get_quiz_session_results IS 'Returns results for a specific quiz session';
COMMENT ON FUNCTION get_recommended_questions IS 'Returns recommended questions for a user based on their progress';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 009 completed: user_quiz_progress table created successfully!';
    RAISE NOTICE 'Helper functions created: record_quiz_answer, get_user_quiz_stats, get_quiz_session_results, get_recommended_questions';
END $$;
