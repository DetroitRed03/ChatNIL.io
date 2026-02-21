/**
 * Apply Migration 030: Fix get_user_quiz_stats calculation
 *
 * Run with: npx tsx scripts/apply-migration-030.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigration() {
  console.log('🔧 Applying migration 030: Fix get_user_quiz_stats...');

  const sql = `
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
  `;

  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Migration 030 applied successfully!');

  // Verify by testing the function
  console.log('\n📊 Verifying with a test query...');
  const { data, error: testError } = await supabase.rpc('exec_sql', {
    query: `SELECT * FROM get_user_quiz_stats('00000000-0000-0000-0000-000000000000'::uuid);`
  });

  if (testError) {
    console.error('⚠️ Verification query failed:', testError.message);
  } else {
    console.log('✅ Function exists and executes correctly');
  }
}

applyMigration();
