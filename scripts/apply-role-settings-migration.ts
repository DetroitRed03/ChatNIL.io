#!/usr/bin/env npx tsx
/**
 * Apply Role-Specific Settings Migration
 * Creates tables: user_settings, compliance_settings, athlete_settings,
 * brand_settings, compliance_team_members, compliance_team_invites
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env vars
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL statements to execute (split to avoid transaction issues)
const migrations = [
  // 1. User Settings Table
  `CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50),
    profile_visible BOOLEAN DEFAULT true,
    show_email BOOLEAN DEFAULT false,
    show_phone BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id)`,

  // 2. Compliance Settings Table
  `CREATE TABLE IF NOT EXISTS compliance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    institution_id UUID REFERENCES institutions(id),
    default_review_deadline_days INT DEFAULT 3,
    auto_flag_deal_threshold DECIMAL(10,2) DEFAULT 5000,
    require_second_approval_threshold DECIMAL(10,2) DEFAULT 10000,
    enable_ai_deal_analysis BOOLEAN DEFAULT true,
    notify_new_deal_submitted BOOLEAN DEFAULT true,
    notify_deal_deadline_approaching BOOLEAN DEFAULT true,
    notify_athlete_flagged BOOLEAN DEFAULT true,
    notify_weekly_summary BOOLEAN DEFAULT true,
    notify_state_rule_changes BOOLEAN DEFAULT true,
    notify_team_activity BOOLEAN DEFAULT false,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    weekly_report_day VARCHAR(10) DEFAULT 'monday',
    include_pending_in_report BOOLEAN DEFAULT true,
    include_approved_in_report BOOLEAN DEFAULT true,
    include_flagged_in_report BOOLEAN DEFAULT true,
    auto_send_to_ad BOOLEAN DEFAULT false,
    ad_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_compliance_settings_user ON compliance_settings(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_compliance_settings_institution ON compliance_settings(institution_id)`,

  // 3. Athlete Settings Table
  `CREATE TABLE IF NOT EXISTS athlete_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    profile_visibility VARCHAR(20) DEFAULT 'private',
    show_contact_info BOOLEAN DEFAULT false,
    allow_brand_contact BOOLEAN DEFAULT false,
    show_follower_counts BOOLEAN DEFAULT true,
    nil_interests TEXT[],
    excluded_categories TEXT[],
    min_deal_value DECIMAL(10,2),
    willing_to_travel BOOLEAN DEFAULT false,
    travel_radius_miles INT,
    appearance_availability VARCHAR(50),
    response_time_goal VARCHAR(50),
    notify_new_opportunity BOOLEAN DEFAULT true,
    notify_brand_viewed_profile BOOLEAN DEFAULT true,
    notify_deal_status_changed BOOLEAN DEFAULT true,
    notify_payment_received BOOLEAN DEFAULT true,
    notify_compliance_update BOOLEAN DEFAULT true,
    notify_learning_content BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    daily_reminder_time TIME,
    difficulty_level VARCHAR(20) DEFAULT 'standard',
    show_explanations BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_athlete_settings_user ON athlete_settings(user_id)`,

  // 4. Brand Settings Table
  `CREATE TABLE IF NOT EXISTS brand_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    interested_sports TEXT[],
    interested_divisions TEXT[],
    min_follower_count INT,
    max_budget_per_deal DECIMAL(10,2),
    preferred_deal_types TEXT[],
    geographic_focus TEXT[],
    notify_new_athlete_matches BOOLEAN DEFAULT true,
    notify_athlete_response BOOLEAN DEFAULT true,
    notify_deal_status BOOLEAN DEFAULT true,
    notify_weekly_digest BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_brand_settings_user ON brand_settings(user_id)`,

  // 5. Compliance Team Members Table
  `CREATE TABLE IF NOT EXISTS compliance_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES auth.users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'officer',
    can_view_athletes BOOLEAN DEFAULT true,
    can_view_deals BOOLEAN DEFAULT true,
    can_flag_deals BOOLEAN DEFAULT true,
    can_approve_deals BOOLEAN DEFAULT false,
    can_reject_deals BOOLEAN DEFAULT false,
    can_invite_members BOOLEAN DEFAULT false,
    can_manage_members BOOLEAN DEFAULT false,
    can_access_reports BOOLEAN DEFAULT true,
    can_export_data BOOLEAN DEFAULT false,
    all_sports_access BOOLEAN DEFAULT true,
    sports_access TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, user_id)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_compliance_team_institution ON compliance_team_members(institution_id)`,
  `CREATE INDEX IF NOT EXISTS idx_compliance_team_user ON compliance_team_members(user_id)`,

  // 6. Compliance Team Invites Table
  `CREATE TABLE IF NOT EXISTS compliance_team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES auth.users(id),
    invitee_email VARCHAR(255) NOT NULL,
    invitee_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'officer',
    permissions JSONB DEFAULT '{}',
    sports_access TEXT[],
    invite_token UUID UNIQUE DEFAULT gen_random_uuid(),
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, invitee_email)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_compliance_invites_token ON compliance_team_invites(invite_token)`,
  `CREATE INDEX IF NOT EXISTS idx_compliance_invites_email ON compliance_team_invites(invitee_email)`,
  `CREATE INDEX IF NOT EXISTS idx_compliance_invites_institution ON compliance_team_invites(institution_id)`,

  // 7. Enable RLS
  `ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE compliance_settings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE athlete_settings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE compliance_team_members ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE compliance_team_invites ENABLE ROW LEVEL SECURITY`,

  // 8. Grant permissions
  `GRANT ALL ON user_settings TO authenticated`,
  `GRANT ALL ON compliance_settings TO authenticated`,
  `GRANT ALL ON athlete_settings TO authenticated`,
  `GRANT ALL ON brand_settings TO authenticated`,
  `GRANT ALL ON compliance_team_members TO authenticated`,
  `GRANT ALL ON compliance_team_invites TO authenticated`,
];

async function applyMigration() {
  console.log('='.repeat(60));
  console.log('Applying Role-Specific Settings Migration');
  console.log('='.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    const preview = sql.substring(0, 60).replace(/\n/g, ' ') + '...';

    console.log(`\n[${i + 1}/${migrations.length}] ${preview}`);

    try {
      const { error } = await supabase.rpc('exec_sql', { query: sql });

      if (error) {
        // Check if it's a "already exists" type error
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`  ⏭️  Already exists (skipped)`);
          successCount++;
        } else {
          console.log(`  ❌ Error: ${error.message}`);
          failCount++;
        }
      } else {
        console.log(`  ✅ Success`);
        successCount++;
      }
    } catch (e: any) {
      console.log(`  ❌ Exception: ${e.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Migration Summary: ${successCount} succeeded, ${failCount} failed`);
  console.log('='.repeat(60));

  // Verify tables exist
  console.log('\nVerifying tables...');

  const tables = [
    'user_settings',
    'compliance_settings',
    'athlete_settings',
    'brand_settings',
    'compliance_team_members',
    'compliance_team_invites'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`  ❌ ${table}: ${error.message}`);
    } else {
      console.log(`  ✅ ${table}: OK`);
    }
  }

  console.log('\n✅ Migration complete!');
}

applyMigration().catch(console.error);
