-- Check the current definition of calculate_profile_completion_score
SELECT prosrc
FROM pg_proc
WHERE proname = 'calculate_profile_completion_score';
