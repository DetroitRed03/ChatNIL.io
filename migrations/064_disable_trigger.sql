-- Temporarily disable the trigger to test if it's causing the issue
DROP TRIGGER IF EXISTS trigger_update_calculated_fields ON users;
