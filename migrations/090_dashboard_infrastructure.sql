-- ============================================================================
-- Migration 090: Dashboard Infrastructure
-- ============================================================================
-- Creates materialized views, tables, and indexes for athlete and agency dashboards
-- Performance optimizations for real-time dashboard metrics
-- ============================================================================

-- ============================================================================
-- PART 1: MATERIALIZED VIEWS FOR DASHBOARD METRICS
-- ============================================================================

-- Athlete Dashboard Metrics View
-- Aggregates all key metrics for athlete dashboard in a single query
CREATE MATERIALIZED VIEW IF NOT EXISTS athlete_dashboard_metrics AS
SELECT
  u.id as athlete_id,
  u.first_name,
  u.last_name,
  u.email,
  u.profile_photo_url as avatar_url,

  -- Match statistics
  COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'active') as active_matches,
  COUNT(DISTINCT m.id) as total_matches,

  -- Deal statistics
  COUNT(DISTINCT nd.id) FILTER (WHERE nd.status IN ('active', 'pending')) as active_deals,
  COUNT(DISTINCT nd.id) FILTER (WHERE nd.status = 'completed') as completed_deals,
  COUNT(DISTINCT nd.id) as total_deals,

  -- Financial metrics
  COALESCE(SUM(nd.deal_amount) FILTER (WHERE nd.status = 'completed'), 0) as lifetime_earnings,
  COALESCE(SUM(nd.deal_amount) FILTER (WHERE nd.status = 'active'), 0) as active_deal_value,
  COALESCE(SUM(nd.deal_amount) FILTER (WHERE nd.status IN ('active', 'pending')), 0) as pipeline_value,

  -- FMV data
  afd.fmv_score as current_fmv_score,
  afd.fmv_tier as current_fmv_tier,
  afd.estimated_deal_value_low,
  afd.estimated_deal_value_high,

  -- Social media totals
  COALESCE((
    SELECT SUM(followers)
    FROM social_media_stats
    WHERE user_id = u.id
  ), 0) as total_followers,

  COALESCE((
    SELECT AVG(engagement_rate)
    FROM social_media_stats
    WHERE user_id = u.id
  ), 0) as avg_engagement_rate,

  -- Notification counts
  (
    SELECT COUNT(*)
    FROM notifications n
    WHERE n.user_id = u.id AND n.read_at IS NULL
  ) as unread_notifications,

  -- Message counts
  (
    SELECT COUNT(*)
    FROM messages msg
    WHERE msg.recipient_id = u.id AND msg.read_at IS NULL
  ) as unread_messages,

  -- Profile completion (approximation based on key fields)
  (
    CASE WHEN u.first_name IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN u.last_name IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN u.primary_sport IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN u.school_name IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN u.graduation_year IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN u.profile_photo_url IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN EXISTS(SELECT 1 FROM social_media_stats WHERE user_id = u.id) THEN 20 ELSE 0 END +
    CASE WHEN afd.fmv_score IS NOT NULL THEN 10 ELSE 0 END
  ) as profile_completion_score,

  -- Last activity timestamp
  GREATEST(
    u.updated_at,
    COALESCE((SELECT MAX(created_at) FROM matches WHERE athlete_id = u.id), u.created_at),
    COALESCE((SELECT MAX(created_at) FROM nil_deals WHERE athlete_id = u.id), u.created_at),
    COALESCE((SELECT MAX(created_at) FROM messages WHERE sender_id = u.id OR recipient_id = u.id), u.created_at)
  ) as last_activity_at,

  -- Timestamp
  NOW() as last_refreshed_at

FROM users u
LEFT JOIN matches m ON u.id = m.athlete_id
LEFT JOIN nil_deals nd ON u.id = nd.athlete_id
LEFT JOIN athlete_fmv_data afd ON u.id = afd.athlete_id
WHERE u.role = 'athlete'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile_photo_url,
         afd.fmv_score, afd.fmv_tier, afd.estimated_deal_value_low, afd.estimated_deal_value_high;

-- Create unique index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_athlete_dashboard_metrics_id
ON athlete_dashboard_metrics(athlete_id);

-- Add additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_athlete_dashboard_metrics_fmv
ON athlete_dashboard_metrics(current_fmv_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_athlete_dashboard_metrics_earnings
ON athlete_dashboard_metrics(lifetime_earnings DESC);

-- ============================================================================

-- Agency Dashboard Metrics View
-- Aggregates all key metrics for agency dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS agency_dashboard_metrics AS
SELECT
  a.id as agency_id,
  a.agency_name,
  a.logo_url,
  a.owner_id,

  -- Athlete statistics
  COUNT(DISTINCT m.athlete_id) FILTER (WHERE m.status = 'active') as active_athletes,
  COUNT(DISTINCT m.athlete_id) as total_athletes_contacted,

  -- Campaign statistics (if agency_campaigns table exists)
  COALESCE((
    SELECT COUNT(*)
    FROM agency_campaigns ac
    WHERE ac.agency_id = a.id AND ac.status = 'active'
  ), 0) as active_campaigns,

  -- Deal statistics
  COUNT(DISTINCT nd.id) FILTER (WHERE nd.status = 'pending') as pending_deals,
  COUNT(DISTINCT nd.id) FILTER (WHERE nd.status = 'active') as active_deals,
  COUNT(DISTINCT nd.id) FILTER (WHERE nd.status = 'completed') as completed_deals,
  COUNT(DISTINCT nd.id) FILTER (WHERE nd.status IN ('rejected', 'expired')) as failed_deals,

  -- Financial metrics
  COALESCE(SUM(nd.deal_amount) FILTER (WHERE nd.status IN ('pending', 'active')), 0) as pipeline_value,
  COALESCE(SUM(nd.deal_amount) FILTER (WHERE nd.status = 'completed' AND nd.created_at >= NOW() - INTERVAL '30 days'), 0) as monthly_revenue,
  COALESCE(SUM(nd.deal_amount) FILTER (WHERE nd.status = 'completed' AND nd.created_at >= NOW() - INTERVAL '90 days'), 0) as quarterly_revenue,
  COALESCE(SUM(nd.deal_amount) FILTER (WHERE nd.status = 'completed'), 0) as lifetime_revenue,

  -- Averages and rates
  COALESCE(AVG(nd.deal_amount) FILTER (WHERE nd.status = 'completed'), 0) as avg_deal_size,

  -- Response rate (athlete accepts vs total invites)
  CASE
    WHEN COUNT(DISTINCT m.id) > 0
    THEN (COUNT(DISTINCT m.id) FILTER (WHERE m.status IN ('active', 'converted'))::DECIMAL / COUNT(DISTINCT m.id)::DECIMAL) * 100
    ELSE 0
  END as response_rate_percentage,

  -- Conversion rate (completed deals vs total matches)
  CASE
    WHEN COUNT(DISTINCT m.id) > 0
    THEN (COUNT(DISTINCT nd.id) FILTER (WHERE nd.status = 'completed')::DECIMAL / COUNT(DISTINCT m.id)::DECIMAL) * 100
    ELSE 0
  END as conversion_rate_percentage,

  -- Message statistics
  (
    SELECT COUNT(*)
    FROM messages msg
    WHERE msg.sender_id = a.owner_id AND msg.read_at IS NULL
  ) as unread_messages,

  -- Recent deal pipeline (top 10 most recent pending/active deals as JSON)
  (
    SELECT json_agg(
      json_build_object(
        'id', nd2.id,
        'athlete_id', nd2.athlete_id,
        'athlete_name', u2.first_name || ' ' || u2.last_name,
        'athlete_avatar', u2.profile_photo_url,
        'brand_name', nd2.brand_name,
        'deal_amount', nd2.deal_amount,
        'status', nd2.status,
        'created_at', nd2.created_at,
        'updated_at', nd2.updated_at
      ) ORDER BY nd2.created_at DESC
    )
    FROM nil_deals nd2
    JOIN users u2 ON nd2.athlete_id = u2.id
    WHERE nd2.agency_id = a.id
      AND nd2.status IN ('pending', 'active')
    LIMIT 10
  ) as recent_deals_pipeline,

  -- Last activity
  GREATEST(
    a.updated_at,
    COALESCE((SELECT MAX(created_at) FROM matches WHERE agency_id = a.id), a.created_at),
    COALESCE((SELECT MAX(created_at) FROM nil_deals WHERE agency_id = a.id), a.created_at)
  ) as last_activity_at,

  -- Timestamp
  NOW() as last_refreshed_at

FROM agencies a
LEFT JOIN matches m ON a.id = m.agency_id
LEFT JOIN nil_deals nd ON a.id = nd.agency_id
GROUP BY a.id, a.agency_name, a.logo_url, a.owner_id;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_agency_dashboard_metrics_id
ON agency_dashboard_metrics(agency_id);

-- Create index for owner lookups
CREATE INDEX IF NOT EXISTS idx_agency_dashboard_metrics_owner
ON agency_dashboard_metrics(owner_id);

-- ============================================================================

-- Activity Feed View
-- Unified event stream for user activity feeds
CREATE MATERIALIZED VIEW IF NOT EXISTS activity_feed AS
-- Match events
SELECT
  'match' as event_type,
  m.athlete_id as user_id,
  m.id as event_id,
  json_build_object(
    'match_id', m.id,
    'agency_id', m.agency_id,
    'agency_name', ag.agency_name,
    'agency_logo', ag.logo_url,
    'match_score', m.overall_score,
    'status', m.status
  ) as event_data,
  m.created_at,
  m.created_at as sort_timestamp
FROM matches m
JOIN agencies ag ON m.agency_id = ag.id

UNION ALL

-- Deal status updates
SELECT
  'deal_update' as event_type,
  nd.athlete_id as user_id,
  nd.id as event_id,
  json_build_object(
    'deal_id', nd.id,
    'brand_name', nd.brand_name,
    'deal_amount', nd.deal_amount,
    'status', nd.status,
    'previous_status', nd.status
  ) as event_data,
  nd.updated_at as created_at,
  nd.updated_at as sort_timestamp
FROM nil_deals nd

UNION ALL

-- New messages (for recipient)
SELECT
  'message' as event_type,
  msg.recipient_id as user_id,
  msg.id as event_id,
  json_build_object(
    'message_id', msg.id,
    'sender_id', msg.sender_id,
    'sender_name', u.first_name || ' ' || u.last_name,
    'sender_avatar', u.profile_photo_url,
    'preview', LEFT(msg.content, 100),
    'read', msg.read_at IS NOT NULL
  ) as event_data,
  msg.created_at,
  msg.created_at as sort_timestamp
FROM messages msg
JOIN users u ON msg.sender_id = u.id

ORDER BY sort_timestamp DESC;

-- Indexes for activity feed
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_type_timestamp
ON activity_feed(user_id, event_type, sort_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user_timestamp
ON activity_feed(user_id, sort_timestamp DESC);

-- ============================================================================
-- PART 2: NEW TABLES
-- ============================================================================

-- Message Threads Table (Denormalized for performance)
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, participant_id)
);

-- Indexes for message threads
CREATE INDEX IF NOT EXISTS idx_message_threads_user_updated
ON message_threads(user_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_threads_unread
ON message_threads(user_id, unread_count) WHERE unread_count > 0;

-- Enable RLS
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_threads
CREATE POLICY "Users can view own threads"
ON message_threads FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own threads"
ON message_threads FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  -- Types: 'deal_status_change', 'new_message', 'match_update', 'deal_proposed',
  --        'deal_requires_approval', 'deal_compliance_review', 'badge_unlocked', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  action_url TEXT, -- Optional URL for CTA
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created
ON notifications(user_id, read_at, created_at DESC) WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_type_created
ON notifications(user_id, type, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true); -- Will be called from API with service role

-- ============================================================================

-- Analytics Export Jobs Table
CREATE TABLE IF NOT EXISTS analytics_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'csv', 'excel')),
  date_range JSONB NOT NULL,
  metrics JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  file_url TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_status_created
ON analytics_export_jobs(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_export_jobs_expires
ON analytics_export_jobs(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE analytics_export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own export jobs"
ON analytics_export_jobs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own export jobs"
ON analytics_export_jobs FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================================================

-- Deal Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS deal_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES nil_deals(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deal_status_history_deal_created
ON deal_status_history(deal_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deal_status_history_changed_by
ON deal_status_history(changed_by, created_at DESC);

-- Enable RLS
ALTER TABLE deal_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - anyone who can view the deal can view its history
CREATE POLICY "Stakeholders can view deal history"
ON deal_status_history FOR SELECT
USING (
  deal_id IN (
    SELECT id FROM nil_deals WHERE
      athlete_id = auth.uid()
      OR agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
      OR athlete_id IN (SELECT id FROM users WHERE parent_id = auth.uid())
  )
);

-- ============================================================================
-- PART 3: PERFORMANCE INDEXES
-- ============================================================================

-- Optimize matches queries
CREATE INDEX IF NOT EXISTS idx_matches_athlete_status_created
ON matches(athlete_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_matches_agency_status_created
ON matches(agency_id, status, created_at DESC);

-- Optimize NIL deals queries
CREATE INDEX IF NOT EXISTS idx_nil_deals_athlete_status_created
ON nil_deals(athlete_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nil_deals_agency_status_created
ON nil_deals(agency_id, status, created_at DESC);

-- Composite index for deal pipeline queries
CREATE INDEX IF NOT EXISTS idx_nil_deals_pipeline
ON nil_deals(agency_id, status, deal_amount DESC, created_at DESC)
WHERE status IN ('pending', 'active');

-- Optimize messaging queries
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread_created
ON messages(recipient_id, read_at, created_at DESC) WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender_created
ON messages(sender_id, created_at DESC);

-- Covering index for messages (includes columns in SELECT to avoid table lookup)
CREATE INDEX IF NOT EXISTS idx_messages_unread_covering
ON messages(recipient_id, created_at DESC)
INCLUDE (sender_id, content, read_at)
WHERE read_at IS NULL;

-- ============================================================================
-- PART 4: TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update message_threads when new message is sent
CREATE OR REPLACE FUNCTION update_message_threads()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sender's thread
  INSERT INTO message_threads (user_id, participant_id, last_message_id, last_message_at, last_message_preview)
  VALUES (NEW.sender_id, NEW.recipient_id, NEW.id, NEW.created_at, LEFT(NEW.content, 100))
  ON CONFLICT (user_id, participant_id)
  DO UPDATE SET
    last_message_id = NEW.id,
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW();

  -- Update recipient's thread with unread count increment
  INSERT INTO message_threads (user_id, participant_id, last_message_id, last_message_at, last_message_preview, unread_count)
  VALUES (NEW.recipient_id, NEW.sender_id, NEW.id, NEW.created_at, LEFT(NEW.content, 100), 1)
  ON CONFLICT (user_id, participant_id)
  DO UPDATE SET
    last_message_id = NEW.id,
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    unread_count = message_threads.unread_count + 1,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message_threads update
DROP TRIGGER IF EXISTS trigger_update_message_threads ON messages;
CREATE TRIGGER trigger_update_message_threads
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_message_threads();

-- ============================================================================

-- Function to reset unread count when messages are marked as read
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
    UPDATE message_threads
    SET unread_count = GREATEST(unread_count - 1, 0),
        updated_at = NOW()
    WHERE user_id = NEW.recipient_id
      AND participant_id = NEW.sender_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for unread count reset
DROP TRIGGER IF EXISTS trigger_reset_unread_count ON messages;
CREATE TRIGGER trigger_reset_unread_count
AFTER UPDATE ON messages
FOR EACH ROW
WHEN (OLD.read_at IS DISTINCT FROM NEW.read_at)
EXECUTE FUNCTION reset_unread_count();

-- ============================================================================

-- Function to log deal status changes
CREATE OR REPLACE FUNCTION log_deal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO deal_status_history (deal_id, from_status, to_status, changed_by, notes)
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for deal status logging
DROP TRIGGER IF EXISTS trigger_log_deal_status_change ON nil_deals;
CREATE TRIGGER trigger_log_deal_status_change
AFTER UPDATE ON nil_deals
FOR EACH ROW
EXECUTE FUNCTION log_deal_status_change();

-- ============================================================================
-- PART 5: AUTO-REFRESH SETUP (requires pg_cron extension)
-- ============================================================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule materialized view refresh every 5 minutes
-- Remove existing schedules first to avoid duplicates
SELECT cron.unschedule('refresh-athlete-dashboard-metrics');
SELECT cron.unschedule('refresh-agency-dashboard-metrics');
SELECT cron.unschedule('refresh-activity-feed');

-- Schedule new refreshes
SELECT cron.schedule(
  'refresh-athlete-dashboard-metrics',
  '*/5 * * * *', -- Every 5 minutes
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY athlete_dashboard_metrics$$
);

SELECT cron.schedule(
  'refresh-agency-dashboard-metrics',
  '*/5 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY agency_dashboard_metrics$$
);

SELECT cron.schedule(
  'refresh-activity-feed',
  '*/5 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY activity_feed$$
);

-- ============================================================================
-- PART 6: GRANT PERMISSIONS
-- ============================================================================

-- Grant select on materialized views
GRANT SELECT ON athlete_dashboard_metrics TO authenticated;
GRANT SELECT ON agency_dashboard_metrics TO authenticated;
GRANT SELECT ON activity_feed TO authenticated;

-- Grant permissions on new tables
GRANT SELECT, INSERT, UPDATE ON message_threads TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT ON analytics_export_jobs TO authenticated;
GRANT SELECT ON deal_status_history TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON MATERIALIZED VIEW athlete_dashboard_metrics IS
'Aggregated dashboard metrics for athletes. Refreshed every 5 minutes via pg_cron.';

COMMENT ON MATERIALIZED VIEW agency_dashboard_metrics IS
'Aggregated dashboard metrics for agencies. Refreshed every 5 minutes via pg_cron.';

COMMENT ON MATERIALIZED VIEW activity_feed IS
'Unified activity feed showing matches, deals, and messages. Refreshed every 5 minutes via pg_cron.';

COMMENT ON TABLE message_threads IS
'Denormalized message threads for fast inbox queries. Automatically updated via triggers.';

COMMENT ON TABLE notifications IS
'User notifications for deals, matches, messages, and system events.';

COMMENT ON TABLE analytics_export_jobs IS
'Tracks background jobs for analytics report generation (PDF, Excel, CSV).';

COMMENT ON TABLE deal_status_history IS
'Audit trail for all NIL deal status changes. Automatically populated via trigger.';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
