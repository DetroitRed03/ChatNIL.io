-- Migration 120: Quiz Difficulty System & Point Values
-- Implements gamified progression system with unlock logic

-- Step 1: Update point values to match gamification tiers
UPDATE quiz_questions SET points = 10 WHERE difficulty = 'beginner';
UPDATE quiz_questions SET points = 25 WHERE difficulty = 'intermediate';
UPDATE quiz_questions SET points = 50 WHERE difficulty = 'advanced';
UPDATE quiz_questions SET points = 100 WHERE difficulty = 'expert';

-- Step 2: Create user_quiz_stats table to track progress
CREATE TABLE IF NOT EXISTS user_quiz_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,

  -- Progress by difficulty
  beginner_completed integer DEFAULT 0,
  beginner_avg_score numeric(5,2) DEFAULT 0,

  intermediate_completed integer DEFAULT 0,
  intermediate_avg_score numeric(5,2) DEFAULT 0,

  advanced_completed integer DEFAULT 0,
  advanced_avg_score numeric(5,2) DEFAULT 0,

  expert_completed integer DEFAULT 0,
  expert_avg_score numeric(5,2) DEFAULT 0,

  -- Overall stats
  total_quizzes_completed integer DEFAULT 0,
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_quiz_at timestamp with time zone,

  -- Unlock status
  intermediate_unlocked boolean DEFAULT false,
  advanced_unlocked boolean DEFAULT false,
  expert_unlocked boolean DEFAULT false,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_quiz_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quiz stats" ON user_quiz_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz stats" ON user_quiz_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz stats" ON user_quiz_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can manage all stats
CREATE POLICY "Service role can manage all quiz stats" ON user_quiz_stats
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Step 3: Create function to calculate unlock status
CREATE OR REPLACE FUNCTION calculate_quiz_unlocks(p_user_id uuid)
RETURNS TABLE (
  intermediate_unlocked boolean,
  advanced_unlocked boolean,
  expert_unlocked boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Intermediate: After 5 beginner quizzes
    (SELECT beginner_completed >= 5 FROM user_quiz_stats WHERE user_id = p_user_id) AS intermediate_unlocked,

    -- Advanced: After 5 intermediate + 70% avg
    (SELECT
      intermediate_completed >= 5 AND intermediate_avg_score >= 70
    FROM user_quiz_stats WHERE user_id = p_user_id) AS advanced_unlocked,

    -- Expert: After 5 advanced + 80% avg
    (SELECT
      advanced_completed >= 5 AND advanced_avg_score >= 80
    FROM user_quiz_stats WHERE user_id = p_user_id) AS expert_unlocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to update stats after quiz completion
CREATE OR REPLACE FUNCTION update_quiz_stats_after_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_difficulty text;
  v_score numeric;
  v_points integer;
  v_stats record;
BEGIN
  -- Get quiz difficulty and points
  SELECT q.difficulty, q.points INTO v_difficulty, v_points
  FROM quiz_questions q
  WHERE q.id = NEW.question_id;

  -- Calculate score (assuming score is stored in NEW record)
  v_score := NEW.score;

  -- Get or create stats record
  INSERT INTO user_quiz_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update stats based on difficulty
  IF v_difficulty = 'beginner' THEN
    UPDATE user_quiz_stats
    SET
      beginner_completed = beginner_completed + 1,
      beginner_avg_score = ((beginner_avg_score * beginner_completed) + v_score) / (beginner_completed + 1),
      total_quizzes_completed = total_quizzes_completed + 1,
      total_points = total_points + v_points,
      last_quiz_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id;

  ELSIF v_difficulty = 'intermediate' THEN
    UPDATE user_quiz_stats
    SET
      intermediate_completed = intermediate_completed + 1,
      intermediate_avg_score = ((intermediate_avg_score * intermediate_completed) + v_score) / (intermediate_completed + 1),
      total_quizzes_completed = total_quizzes_completed + 1,
      total_points = total_points + v_points,
      last_quiz_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id;

  ELSIF v_difficulty = 'advanced' THEN
    UPDATE user_quiz_stats
    SET
      advanced_completed = advanced_completed + 1,
      advanced_avg_score = ((advanced_avg_score * advanced_completed) + v_score) / (advanced_completed + 1),
      total_quizzes_completed = total_quizzes_completed + 1,
      total_points = total_points + v_points,
      last_quiz_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id;

  ELSIF v_difficulty = 'expert' THEN
    UPDATE user_quiz_stats
    SET
      expert_completed = expert_completed + 1,
      expert_avg_score = ((expert_avg_score * expert_completed) + v_score) / (expert_completed + 1),
      total_quizzes_completed = total_quizzes_completed + 1,
      total_points = total_points + v_points,
      last_quiz_at = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Update unlock status
  UPDATE user_quiz_stats
  SET
    intermediate_unlocked = (beginner_completed >= 5),
    advanced_unlocked = (intermediate_completed >= 5 AND intermediate_avg_score >= 70),
    expert_unlocked = (advanced_completed >= 5 AND advanced_avg_score >= 80),
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger on user_quiz_progress
-- Note: This assumes user_quiz_progress table exists
-- If not, this will fail gracefully
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_quiz_progress') THEN
    DROP TRIGGER IF EXISTS trigger_update_quiz_stats ON user_quiz_progress;
    CREATE TRIGGER trigger_update_quiz_stats
      AFTER INSERT ON user_quiz_progress
      FOR EACH ROW
      EXECUTE FUNCTION update_quiz_stats_after_completion();
  END IF;
END $$;

-- Step 6: Grant permissions
GRANT SELECT ON user_quiz_stats TO authenticated;
GRANT INSERT, UPDATE ON user_quiz_stats TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_quiz_unlocks TO authenticated;

-- Add helpful comments
COMMENT ON TABLE user_quiz_stats IS 'Tracks user progress through quiz difficulty tiers with unlock logic';
COMMENT ON FUNCTION calculate_quiz_unlocks IS 'Calculates which difficulty tiers are unlocked for a user';
COMMENT ON FUNCTION update_quiz_stats_after_completion IS 'Updates user quiz stats after completing a quiz';
