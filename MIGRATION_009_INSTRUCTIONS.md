# Migration 009 Application Instructions

## Problem
The quiz system is broken because migration 009 was never applied to the production Supabase database. Two critical functions are missing:
- `get_user_quiz_stats(p_user_id)`
- `get_recommended_questions(p_category, p_difficulty, p_limit, p_user_id)`

## Solution: Apply Migration 009 via Supabase Dashboard

### Step 1: Open Supabase SQL Editor
1. Go to: [https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql](https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql)
2. Click "New Query"

### Step 2: Copy Migration SQL
1. Open the file: [supabase/migrations/009_create_user_quiz_progress_table.sql](supabase/migrations/009_create_user_quiz_progress_table.sql)
2. Copy the entire contents (all 301 lines)

### Step 3: Paste and Run
1. Paste the SQL into the Supabase SQL Editor
2. Click "Run" or press Cmd/Ctrl + Enter
3. Wait for execution to complete

### Step 4: Verify Success
After running, you should see:
- ✅ `user_quiz_progress` table created
- ✅ 4 database functions created:
  - `record_quiz_answer`
  - `get_user_quiz_stats`
  - `get_quiz_session_results`
  - `get_recommended_questions`
- ✅ Success message: "Migration 009 completed: user_quiz_progress table created successfully!"

### Step 5: Test
1. Refresh your browser at http://localhost:3000
2. Navigate to the dashboard
3. Check if quiz stats load without errors
4. Check browser console - no more PGRST202 errors

---

## Alternative: Using the Migration Runner (Experimental)

If you want to try the automated approach:
1. Open: http://localhost:3000/run-migration-009.html
2. Click "Run Migration 009"
3. Check the output for success/error messages

**Note:** This requires the `exec_sql` or `execute_sql` function to exist in your database (from migration 001).

---

## What This Migration Does

### Creates Table: `user_quiz_progress`
Tracks all quiz attempts with:
- User responses and correctness
- Time taken per question
- Points earned
- Confidence levels
- Quiz session grouping
- User feedback and flags

### Creates Functions:

#### 1. `record_quiz_answer`
```sql
record_quiz_answer(
  p_user_id uuid,
  p_question_id uuid,
  p_user_answer jsonb,
  p_user_answer_index integer,
  p_time_taken_seconds integer,
  p_quiz_session_id uuid,
  p_confidence_level integer
)
```
Records a quiz answer and returns whether it was correct, points earned, and explanation.

#### 2. `get_user_quiz_stats`
```sql
get_user_quiz_stats(p_user_id uuid)
```
Returns comprehensive stats:
- Total questions attempted
- Total correct answers
- Total points earned
- Average score percentage
- Total time spent
- Quizzes completed

#### 3. `get_recommended_questions`
```sql
get_recommended_questions(
  p_user_id uuid,
  p_category quiz_category,
  p_difficulty quiz_difficulty,
  p_limit integer
)
```
Returns recommended questions based on user progress, prioritizing unattempted questions.

#### 4. `get_quiz_session_results`
```sql
get_quiz_session_results(p_session_id uuid)
```
Returns results for a specific quiz session including total score and time.

---

## Troubleshooting

### Error: "function does not exist"
- Make sure you're running the migration in the correct project
- Check that migrations 001-008 have been applied first
- Verify the `quiz_questions` table exists

### Error: "table already exists"
- If the table exists but functions don't, you can:
  1. Drop the table: `DROP TABLE user_quiz_progress CASCADE;`
  2. Re-run the full migration

### Still Having Issues?
- Check the Supabase logs for detailed error messages
- Verify your service role key has proper permissions
- Ensure you're connected to the correct database
