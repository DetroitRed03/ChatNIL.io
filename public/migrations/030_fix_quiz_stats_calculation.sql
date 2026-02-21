-- Migration 030: Fix get_user_quiz_stats — use COUNT(*) consistently
--
-- BUG: total_questions_attempted used COUNT(DISTINCT question_id) = 11 unique questions
--      total_questions_correct used COUNT(CASE WHEN is_correct) = 20 (all rows including retakes)
--      This produced 182% average score (20/11 * 100)
--
-- FIX: Use COUNT(*) for attempted (all answer rows), making both columns consistent.
--      Calculate per-session average score for a fairer percentage.

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
    RAISE NOTICE 'Migration 030 completed: quiz stats calculation fixed';
END $$;
