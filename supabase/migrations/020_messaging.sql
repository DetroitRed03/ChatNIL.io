-- Migration 020: Direct Messaging System
-- Agency ↔ Athlete communication infrastructure

-- ============================================
-- 1. MESSAGE THREADS TABLE
-- ============================================
-- Stores thread metadata with denormalized fields for performance

CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    athlete_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Denormalized for query performance (updated via trigger)
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ,
    last_sender_id UUID REFERENCES auth.users(id),

    -- Unread counts (denormalized for performance)
    agency_unread_count INTEGER DEFAULT 0,
    athlete_unread_count INTEGER DEFAULT 0,

    -- Thread status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one thread per agency-athlete pair
    UNIQUE(agency_user_id, athlete_user_id)
);

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================

-- Agency inbox query optimization
CREATE INDEX IF NOT EXISTS idx_threads_agency
ON message_threads(agency_user_id, last_message_at DESC);

-- Athlete inbox query optimization
CREATE INDEX IF NOT EXISTS idx_threads_athlete
ON message_threads(athlete_user_id, last_message_at DESC);

-- Message fetching optimization (if agency_athlete_messages exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agency_athlete_messages') THEN
        CREATE INDEX IF NOT EXISTS idx_messages_thread
        ON agency_athlete_messages(thread_id, created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_messages_unread
        ON agency_athlete_messages(thread_id, is_read) WHERE is_read = false;
    END IF;
END $$;

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

-- Users can view their own threads
DROP POLICY IF EXISTS "Users can view their own threads" ON message_threads;
CREATE POLICY "Users can view their own threads"
ON message_threads FOR SELECT
USING (
    auth.uid() = agency_user_id OR
    auth.uid() = athlete_user_id
);

-- Agency can create threads with athletes
DROP POLICY IF EXISTS "Agency can create threads" ON message_threads;
CREATE POLICY "Agency can create threads"
ON message_threads FOR INSERT
WITH CHECK (
    auth.uid() = agency_user_id
);

-- Users can update their own threads (for archiving, etc.)
DROP POLICY IF EXISTS "Users can update their own threads" ON message_threads;
CREATE POLICY "Users can update their own threads"
ON message_threads FOR UPDATE
USING (
    auth.uid() = agency_user_id OR
    auth.uid() = athlete_user_id
);

-- ============================================
-- 4. TRIGGER: Update thread on new message
-- ============================================

CREATE OR REPLACE FUNCTION update_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE message_threads
    SET
        last_message_text = LEFT(NEW.message_text, 100), -- Truncate for preview
        last_message_at = NEW.created_at,
        last_sender_id = NEW.sender_id,
        updated_at = NOW(),
        -- Increment unread for recipient, reset for sender
        agency_unread_count = CASE
            WHEN NEW.sender_id = agency_user_id THEN 0  -- Agency sent, reset their count
            ELSE agency_unread_count + 1                 -- Athlete sent, increment agency count
        END,
        athlete_unread_count = CASE
            WHEN NEW.sender_id = athlete_user_id THEN 0 -- Athlete sent, reset their count
            ELSE athlete_unread_count + 1                -- Agency sent, increment athlete count
        END
    WHERE id = NEW.thread_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_thread_on_message ON agency_athlete_messages;

-- Create trigger (only if agency_athlete_messages table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agency_athlete_messages') THEN
        CREATE TRIGGER trigger_update_thread_on_message
        AFTER INSERT ON agency_athlete_messages
        FOR EACH ROW
        EXECUTE FUNCTION update_thread_on_message();
    END IF;
END $$;

-- ============================================
-- 5. FUNCTION: Mark messages as read
-- ============================================

CREATE OR REPLACE FUNCTION mark_thread_messages_read(
    p_thread_id UUID,
    p_user_id UUID
)
RETURNS void AS $$
DECLARE
    v_is_agency BOOLEAN;
BEGIN
    -- Determine if user is agency or athlete in this thread
    SELECT (agency_user_id = p_user_id) INTO v_is_agency
    FROM message_threads
    WHERE id = p_thread_id;

    -- Mark individual messages as read (only messages not from this user)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agency_athlete_messages') THEN
        UPDATE agency_athlete_messages
        SET is_read = true, read_at = NOW()
        WHERE thread_id = p_thread_id
          AND sender_id != p_user_id
          AND is_read = false;
    END IF;

    -- Reset unread count for this user
    UPDATE message_threads
    SET
        agency_unread_count = CASE WHEN v_is_agency THEN 0 ELSE agency_unread_count END,
        athlete_unread_count = CASE WHEN NOT v_is_agency THEN 0 ELSE athlete_unread_count END,
        updated_at = NOW()
    WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. FUNCTION: Get or create thread
-- ============================================

CREATE OR REPLACE FUNCTION get_or_create_thread(
    p_agency_user_id UUID,
    p_athlete_user_id UUID
)
RETURNS TABLE (
    thread_id UUID,
    is_new BOOLEAN
) AS $$
DECLARE
    v_thread_id UUID;
    v_is_new BOOLEAN := false;
BEGIN
    -- Try to find existing thread
    SELECT id INTO v_thread_id
    FROM message_threads
    WHERE agency_user_id = p_agency_user_id
      AND athlete_user_id = p_athlete_user_id;

    -- If not found, create new thread
    IF v_thread_id IS NULL THEN
        INSERT INTO message_threads (agency_user_id, athlete_user_id)
        VALUES (p_agency_user_id, p_athlete_user_id)
        RETURNING id INTO v_thread_id;
        v_is_new := true;
    END IF;

    RETURN QUERY SELECT v_thread_id, v_is_new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Add thread_id to existing messages table (if needed)
-- ============================================

DO $$
BEGIN
    -- Check if agency_athlete_messages exists and needs thread_id
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agency_athlete_messages') THEN
        -- Add thread_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'agency_athlete_messages' AND column_name = 'thread_id'
        ) THEN
            ALTER TABLE agency_athlete_messages ADD COLUMN thread_id UUID REFERENCES message_threads(id);
        END IF;

        -- Add delivery_status column for read receipts if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'agency_athlete_messages' AND column_name = 'delivery_status'
        ) THEN
            ALTER TABLE agency_athlete_messages ADD COLUMN delivery_status TEXT DEFAULT 'sent'
                CHECK (delivery_status IN ('sending', 'sent', 'delivered', 'read'));
        END IF;
    END IF;
END $$;

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON message_threads TO authenticated;
GRANT EXECUTE ON FUNCTION mark_thread_messages_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_thread(UUID, UUID) TO authenticated;
