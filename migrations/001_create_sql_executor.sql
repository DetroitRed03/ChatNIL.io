-- Migration: Create SQL Executor Function
-- Created: 2025-09-25T22:30:00.000Z
-- Version: 001

-- Create the SQL execution function to allow migrations to run raw SQL
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO postgres;

-- Also create migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id varchar(50) PRIMARY KEY,
  name varchar(255) NOT NULL,
  executed_at timestamp with time zone DEFAULT now(),
  success boolean NOT NULL DEFAULT true,
  error_message text
);

-- Grant permissions on migrations table
GRANT ALL ON migrations TO service_role;
GRANT ALL ON migrations TO postgres;