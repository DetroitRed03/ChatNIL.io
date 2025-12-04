-- ============================================================================
-- Migration 020 Fix: Correct Type Handling in update_batch_counts Function
-- ============================================================================
-- Issue: The update_batch_counts() function was calling jsonb_array_length()
--        which could be incorrectly applied to UUID[] arrays during triggers
-- Fix: Use array_length() for UUID[] and jsonb_array_length() for JSONB
-- ============================================================================

BEGIN;

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS update_batch_stats ON school_account_batches;

-- Replace the function with corrected type handling
CREATE OR REPLACE FUNCTION update_batch_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate counts with proper type handling
  -- created_user_ids is UUID[], so use array_length()
  NEW.success_count := COALESCE(array_length(NEW.created_user_ids, 1), 0);

  -- error_log is JSONB, so use jsonb_array_length()
  -- But check if it's actually JSONB first
  IF NEW.error_log IS NOT NULL THEN
    NEW.failed_count := jsonb_array_length(NEW.error_log);
  ELSE
    NEW.failed_count := 0;
  END IF;

  NEW.processed_count := NEW.success_count + NEW.failed_count;

  -- Auto-complete batch when all processed
  IF NEW.processed_count >= NEW.total_athletes AND NEW.status = 'processing' THEN
    NEW.status := 'completed';
    NEW.completed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_batch_stats
  BEFORE UPDATE OF created_user_ids, error_log ON school_account_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_counts();

COMMIT;

-- Verification
SELECT 'Migration 020 Fix applied successfully!' as status;
