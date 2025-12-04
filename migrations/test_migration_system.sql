-- Test Migration: Verify migration system works
-- This creates a simple test table to verify the migration runner works

CREATE TABLE IF NOT EXISTS migration_test (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_message text NOT NULL DEFAULT 'Migration system works!',
  created_at timestamptz DEFAULT now()
);

-- Insert a test row
INSERT INTO migration_test (test_message)
VALUES ('Successfully ran migration via automated script!')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON migration_test TO authenticated, service_role;
