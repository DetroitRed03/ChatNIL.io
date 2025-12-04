import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🚀 Applying Migration 100: Messaging Infrastructure\n');

  const sql = `
-- Migration 100: Messaging Infrastructure
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT
  m.match_id,
  m.match_id as conversation_id,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE m.read_at IS NULL AND m.sender_id != auth.uid()) as unread_count,
  MAX(m.created_at) as last_message_at,
  (SELECT content FROM agency_athlete_messages WHERE match_id = m.match_id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT sender_id FROM agency_athlete_messages WHERE match_id = m.match_id ORDER BY created_at DESC LIMIT 1) as last_sender_id,
  ma.agency_id,
  ma.athlete_id,
  ma.status as match_status,
  ma.match_score,
  ma.tier,
  ag.company_name as agency_name,
  ag.logo_url as agency_logo,
  ag.agency_type,
  CONCAT(u_athlete.first_name, ' ', u_athlete.last_name) as athlete_name,
  u_athlete.profile_photo_url as athlete_photo,
  ap.sport as athlete_sport,
  ap.school as athlete_school
FROM agency_athlete_messages m
JOIN agency_athlete_matches ma ON ma.id = m.match_id
LEFT JOIN agencies ag ON ag.id = ma.agency_id
LEFT JOIN users u_athlete ON u_athlete.id = ma.athlete_id
LEFT JOIN athlete_profiles ap ON ap.user_id = ma.athlete_id
WHERE ma.agency_id = auth.uid() OR ma.athlete_id = auth.uid()
GROUP BY m.match_id, ma.agency_id, ma.athlete_id, ma.status, ma.match_score, ma.tier,
         ag.company_name, ag.logo_url, ag.agency_type,
         u_athlete.first_name, u_athlete.last_name, u_athlete.profile_photo_url,
         ap.sport, ap.school
ORDER BY last_message_at DESC NULLS LAST;

GRANT SELECT ON conversation_summaries TO authenticated;

CREATE OR REPLACE FUNCTION mark_messages_read(p_match_id UUID)
RETURNS TABLE (updated_count INTEGER, success BOOLEAN, error_message TEXT) AS $$
DECLARE
  v_user_id UUID;
  v_is_participant BOOLEAN;
  v_updated_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 0, FALSE, 'Not authenticated';
    RETURN;
  END IF;
  SELECT EXISTS(SELECT 1 FROM agency_athlete_matches WHERE id = p_match_id AND (agency_id = v_user_id OR athlete_id = v_user_id)) INTO v_is_participant;
  IF NOT v_is_participant THEN
    RETURN QUERY SELECT 0, FALSE, 'Not authorized';
    RETURN;
  END IF;
  WITH updated AS (UPDATE agency_athlete_messages SET read_at = NOW() WHERE match_id = p_match_id AND sender_id != v_user_id AND read_at IS NULL RETURNING id)
  SELECT COUNT(*)::INTEGER INTO v_updated_count FROM updated;
  RETURN QUERY SELECT v_updated_count, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_messages_read(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS TABLE (total_unread INTEGER, conversations_with_unread INTEGER) AS $$
DECLARE
  v_user_id UUID;
  v_total_unread INTEGER;
  v_conversations_with_unread INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;
  SELECT COUNT(*)::INTEGER INTO v_total_unread
  FROM agency_athlete_messages m
  JOIN agency_athlete_matches ma ON ma.id = m.match_id
  WHERE (ma.agency_id = v_user_id OR ma.athlete_id = v_user_id)
    AND m.sender_id != v_user_id
    AND m.read_at IS NULL;
  SELECT COUNT(DISTINCT m.match_id)::INTEGER INTO v_conversations_with_unread
  FROM agency_athlete_messages m
  JOIN agency_athlete_matches ma ON ma.id = m.match_id
  WHERE (ma.agency_id = v_user_id OR ma.athlete_id = v_user_id)
    AND m.sender_id != v_user_id
    AND m.read_at IS NULL;
  RETURN QUERY SELECT v_total_unread, v_conversations_with_unread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_unread_count() TO authenticated;

CREATE INDEX IF NOT EXISTS idx_messages_match_created ON agency_athlete_messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON agency_athlete_messages(sender_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender ON agency_athlete_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_match_sender_read ON agency_athlete_messages(match_id, sender_id, read_at);
`;

  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('✅ Migration 100 applied successfully!');
  console.log('\n📋 Created:');
  console.log('  - conversation_summaries view');
  console.log('  - mark_messages_read() function');
  console.log('  - get_unread_count() function');
  console.log('  - 4 performance indexes');
}

main();
