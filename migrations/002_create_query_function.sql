-- Migration: Create Query Function that Returns Results
-- Created: 2025-11-26
-- Version: 002
-- Purpose: Create a function that returns SELECT query results (exec_sql doesn't return data)

CREATE OR REPLACE FUNCTION run_query(query_text text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE format('SELECT to_jsonb(t) FROM (%s) t', query_text);
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Query error: %', SQLERRM;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION run_query(text) TO service_role;
GRANT EXECUTE ON FUNCTION run_query(text) TO postgres;
GRANT EXECUTE ON FUNCTION run_query(text) TO anon;
GRANT EXECUTE ON FUNCTION run_query(text) TO authenticated;

COMMENT ON FUNCTION run_query(text) IS 'Executes a SELECT query and returns results as JSONB. Use this instead of exec_sql when you need to retrieve data.';
