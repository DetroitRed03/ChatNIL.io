-- Migration 020: Integration Fixes
-- Date: 2025-12-29
-- Fixes 3 issues found during Agency ↔ Athlete integration testing

-- ============================================================================
-- ISSUE 1: Create saved_athletes table (was missing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_athletes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  athlete_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  saved_at timestamptz DEFAULT now(),
  notes text,
  tags text[],
  UNIQUE(agency_id, athlete_id)
);

-- Enable RLS
ALTER TABLE saved_athletes ENABLE ROW LEVEL SECURITY;

-- Policies for saved_athletes
CREATE POLICY "agencies_view_saved" ON saved_athletes
  FOR SELECT USING (auth.uid() = agency_id);

CREATE POLICY "agencies_insert_saved" ON saved_athletes
  FOR INSERT WITH CHECK (auth.uid() = agency_id);

CREATE POLICY "agencies_delete_saved" ON saved_athletes
  FOR DELETE USING (auth.uid() = agency_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_saved_athletes_agency ON saved_athletes(agency_id);

-- ============================================================================
-- ISSUE 2: Fix orphan deals and add NOT NULL constraint
-- ============================================================================

-- Delete any deals without agency_id (orphans can't be properly secured)
DELETE FROM nil_deals WHERE agency_id IS NULL;

-- Ensure agency_id is always required going forward
ALTER TABLE nil_deals ALTER COLUMN agency_id SET NOT NULL;

-- ============================================================================
-- ISSUE 3: Fix agency_athlete_messages table schema
-- ============================================================================

-- Drop old table with incorrect schema
DROP TABLE IF EXISTS agency_athlete_messages CASCADE;

-- Create with correct schema matching API expectations
CREATE TABLE agency_athlete_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  athlete_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  thread_id uuid NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message_text text NOT NULL,
  attachments jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agency_athlete_messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "users_view_own_messages" ON agency_athlete_messages
  FOR SELECT USING (auth.uid() = agency_user_id OR auth.uid() = athlete_user_id);

CREATE POLICY "users_send_messages" ON agency_athlete_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "users_update_read_status" ON agency_athlete_messages
  FOR UPDATE USING (auth.uid() = agency_user_id OR auth.uid() = athlete_user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_thread ON agency_athlete_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_agency ON agency_athlete_messages(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_athlete ON agency_athlete_messages(athlete_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON agency_athlete_messages(created_at);

-- ============================================================================
-- Summary of changes:
-- 1. Created saved_athletes table with RLS policies
-- 2. Removed orphan deals and enforced agency_id NOT NULL
-- 3. Recreated agency_athlete_messages with correct schema
-- ============================================================================
