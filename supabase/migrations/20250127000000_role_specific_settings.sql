-- ============================================
-- ROLE-SPECIFIC SETTINGS MIGRATION
-- Created: January 27, 2026
-- Purpose: Add settings tables for all user roles
-- ============================================

-- ============================================
-- 1. UNIVERSAL USER SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Display
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),

  -- Privacy (universal)
  profile_visible BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,

  -- Notifications (universal)
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- RLS Policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 2. COMPLIANCE OFFICER SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Institution
  institution_id UUID REFERENCES institutions(id),

  -- Workflow Settings
  default_review_deadline_days INT DEFAULT 3,
  auto_flag_deal_threshold DECIMAL(10,2) DEFAULT 5000,
  require_second_approval_threshold DECIMAL(10,2) DEFAULT 10000,
  enable_ai_deal_analysis BOOLEAN DEFAULT true,

  -- Notification Preferences
  notify_new_deal_submitted BOOLEAN DEFAULT true,
  notify_deal_deadline_approaching BOOLEAN DEFAULT true,
  notify_athlete_flagged BOOLEAN DEFAULT true,
  notify_weekly_summary BOOLEAN DEFAULT true,
  notify_state_rule_changes BOOLEAN DEFAULT true,
  notify_team_activity BOOLEAN DEFAULT false,

  -- Delivery Methods
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,

  -- Reporting
  weekly_report_day VARCHAR(10) DEFAULT 'monday',
  include_pending_in_report BOOLEAN DEFAULT true,
  include_approved_in_report BOOLEAN DEFAULT true,
  include_flagged_in_report BOOLEAN DEFAULT true,
  auto_send_to_ad BOOLEAN DEFAULT false,
  ad_email VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_settings_user ON compliance_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_settings_institution ON compliance_settings(institution_id);

-- RLS Policies for compliance_settings
ALTER TABLE compliance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compliance settings" ON compliance_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compliance settings" ON compliance_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compliance settings" ON compliance_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 3. ATHLETE SETTINGS (HS & College)
-- ============================================

CREATE TABLE IF NOT EXISTS athlete_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Profile Visibility
  profile_visibility VARCHAR(20) DEFAULT 'private',
  show_contact_info BOOLEAN DEFAULT false,
  allow_brand_contact BOOLEAN DEFAULT false,
  show_follower_counts BOOLEAN DEFAULT true,

  -- NIL Preferences (College Athletes)
  nil_interests TEXT[],
  excluded_categories TEXT[],
  min_deal_value DECIMAL(10,2),
  willing_to_travel BOOLEAN DEFAULT false,
  travel_radius_miles INT,
  appearance_availability VARCHAR(50),
  response_time_goal VARCHAR(50),

  -- Notification Preferences
  notify_new_opportunity BOOLEAN DEFAULT true,
  notify_brand_viewed_profile BOOLEAN DEFAULT true,
  notify_deal_status_changed BOOLEAN DEFAULT true,
  notify_payment_received BOOLEAN DEFAULT true,
  notify_compliance_update BOOLEAN DEFAULT true,
  notify_learning_content BOOLEAN DEFAULT true,

  -- Delivery Methods
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,

  -- Learning Preferences (HS Students)
  daily_reminder_time TIME,
  difficulty_level VARCHAR(20) DEFAULT 'standard',
  show_explanations BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_settings_user ON athlete_settings(user_id);

-- RLS Policies for athlete_settings
ALTER TABLE athlete_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own athlete settings" ON athlete_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own athlete settings" ON athlete_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own athlete settings" ON athlete_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Parents can view their children's settings
CREATE POLICY "Parents can view child athlete settings" ON athlete_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_child_relationships pcr
      WHERE pcr.parent_id = auth.uid()
        AND pcr.child_id = athlete_settings.user_id
        AND pcr.status = 'active'
    )
  );

-- ============================================
-- 4. BRAND SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Discovery Preferences
  interested_sports TEXT[],
  interested_divisions TEXT[],
  min_follower_count INT,
  max_budget_per_deal DECIMAL(10,2),
  preferred_deal_types TEXT[],
  geographic_focus TEXT[],

  -- Notification Preferences
  notify_new_athlete_matches BOOLEAN DEFAULT true,
  notify_athlete_response BOOLEAN DEFAULT true,
  notify_deal_status BOOLEAN DEFAULT true,
  notify_weekly_digest BOOLEAN DEFAULT true,

  -- Delivery Methods
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_settings_user ON brand_settings(user_id);

-- RLS Policies for brand_settings
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand settings" ON brand_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand settings" ON brand_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand settings" ON brand_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 5. COMPLIANCE TEAM MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Team Structure
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),

  -- Role & Permissions
  role VARCHAR(50) NOT NULL DEFAULT 'officer',

  -- Granular Permissions
  can_view_athletes BOOLEAN DEFAULT true,
  can_view_deals BOOLEAN DEFAULT true,
  can_flag_deals BOOLEAN DEFAULT true,
  can_approve_deals BOOLEAN DEFAULT false,
  can_reject_deals BOOLEAN DEFAULT false,
  can_invite_members BOOLEAN DEFAULT false,
  can_manage_members BOOLEAN DEFAULT false,
  can_access_reports BOOLEAN DEFAULT true,
  can_export_data BOOLEAN DEFAULT false,

  -- Sports Access
  all_sports_access BOOLEAN DEFAULT true,
  sports_access TEXT[],

  -- Status
  status VARCHAR(20) DEFAULT 'active',

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(institution_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_compliance_team_institution ON compliance_team_members(institution_id);
CREATE INDEX IF NOT EXISTS idx_compliance_team_user ON compliance_team_members(user_id);

-- RLS Policies for compliance_team_members
ALTER TABLE compliance_team_members ENABLE ROW LEVEL SECURITY;

-- Team members can view their own team
CREATE POLICY "Team members can view own team" ON compliance_team_members
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM compliance_team_members WHERE user_id = auth.uid()
    )
  );

-- Only admins/managers can insert team members
CREATE POLICY "Admins can insert team members" ON compliance_team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM compliance_team_members ctm
      WHERE ctm.user_id = auth.uid()
        AND ctm.institution_id = compliance_team_members.institution_id
        AND ctm.can_invite_members = true
    )
  );

-- Only admins/managers can update team members
CREATE POLICY "Admins can update team members" ON compliance_team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM compliance_team_members ctm
      WHERE ctm.user_id = auth.uid()
        AND ctm.institution_id = compliance_team_members.institution_id
        AND ctm.can_manage_members = true
    )
  );

-- ============================================
-- 6. COMPLIANCE TEAM INVITES
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Invite Details
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  invitee_email VARCHAR(255) NOT NULL,
  invitee_name VARCHAR(255),

  -- Role & Permissions
  role VARCHAR(50) NOT NULL DEFAULT 'officer',
  permissions JSONB DEFAULT '{}',
  sports_access TEXT[],

  -- Invite Management
  invite_token UUID UNIQUE DEFAULT gen_random_uuid(),
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(institution_id, invitee_email)
);

CREATE INDEX IF NOT EXISTS idx_compliance_invites_token ON compliance_team_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_compliance_invites_email ON compliance_team_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_compliance_invites_institution ON compliance_team_invites(institution_id);

-- RLS Policies for compliance_team_invites
ALTER TABLE compliance_team_invites ENABLE ROW LEVEL SECURITY;

-- Team members can view invites for their institution
CREATE POLICY "Team members can view invites" ON compliance_team_invites
  FOR SELECT USING (
    institution_id IN (
      SELECT institution_id FROM compliance_team_members WHERE user_id = auth.uid()
    )
    OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Members with invite permission can insert
CREATE POLICY "Inviters can create invites" ON compliance_team_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM compliance_team_members ctm
      WHERE ctm.user_id = auth.uid()
        AND ctm.institution_id = compliance_team_invites.institution_id
        AND ctm.can_invite_members = true
    )
  );

-- Inviter or managers can delete invites
CREATE POLICY "Inviters can delete invites" ON compliance_team_invites
  FOR DELETE USING (
    invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM compliance_team_members ctm
      WHERE ctm.user_id = auth.uid()
        AND ctm.institution_id = compliance_team_invites.institution_id
        AND ctm.can_manage_members = true
    )
  );

-- ============================================
-- 7. UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all new settings tables
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_settings_updated_at ON compliance_settings;
CREATE TRIGGER update_compliance_settings_updated_at
  BEFORE UPDATE ON compliance_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_settings_updated_at ON athlete_settings;
CREATE TRIGGER update_athlete_settings_updated_at
  BEFORE UPDATE ON athlete_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_settings_updated_at ON brand_settings;
CREATE TRIGGER update_brand_settings_updated_at
  BEFORE UPDATE ON brand_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_team_members_updated_at ON compliance_team_members;
CREATE TRIGGER update_compliance_team_members_updated_at
  BEFORE UPDATE ON compliance_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON compliance_settings TO authenticated;
GRANT ALL ON athlete_settings TO authenticated;
GRANT ALL ON brand_settings TO authenticated;
GRANT ALL ON compliance_team_members TO authenticated;
GRANT ALL ON compliance_team_invites TO authenticated;
