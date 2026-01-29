import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Manually load .env.local
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAudit() {
  console.log("=== DATABASE SCHEMA AUDIT ===\n");

  // Get users table sample with all columns
  console.log("--- USERS TABLE SAMPLE (with columns) ---");
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('*')
    .limit(5);

  if (users && users.length > 0) {
    console.log("COLUMNS:", Object.keys(users[0]).join(', '));
    console.log("\nSAMPLE DATA:");
    users.forEach((u, i) => {
      console.log(`User ${i + 1}:`, {
        id: u.id,
        email: u.email,
        role: u.role,
        minor_status: u.minor_status,
        onboarding_completed: u.onboarding_completed,
        is_minor: u.is_minor
      });
    });
  } else {
    console.log("Error or no data:", usersErr);
  }

  // Get distinct roles
  console.log("\n--- DISTINCT ROLES IN DATABASE ---");
  const { data: allUsers } = await supabase
    .from('users')
    .select('role');

  const uniqueRoles = [...new Set(allUsers?.map(r => r.role).filter(Boolean))];
  console.log("Roles found:", uniqueRoles);

  // Check for profile tables
  console.log("\n--- CHECKING ALL PROFILE-RELATED TABLES ---");

  const tablesToCheck = [
    'users',
    'profiles',
    'athlete_profiles',
    'student_discovery_profiles',
    'parent_profiles',
    'compliance_officer_profiles',
    'brand_profiles',
    'agent_profiles',
    'user_settings',
    'notification_settings',
    'parent_notification_preferences',
    'compliance_settings',
    'parent_child_relationships',
    'compliance_athletes',
    'compliance_deals',
    'deals',
    'deal_validations',
    'nil_deals',
    'institutions',
    'school_invitations',
    'user_activity',
    'activity_log',
    'badges',
    'user_badges',
    'streaks',
    'user_streaks',
    'daily_questions',
    'user_daily_responses',
    'chapters',
    'chapter_progress',
    'discovery_progress',
    'discovery_responses',
    'invitations',
    'parent_invitations',
    'consent_requests',
    'minor_consent',
    'family_invites',
    'co_parent_invites',
  ];

  const existingTables: string[] = [];
  const missingTables: string[] = [];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (!error) {
      existingTables.push(table);
      const columns = data?.length ? Object.keys(data[0]) : [];
      console.log(`✓ ${table} - Columns: ${columns.slice(0, 8).join(', ')}${columns.length > 8 ? '...' : ''}`);
    } else if (error.message.includes('does not exist') || error.code === '42P01') {
      missingTables.push(table);
      console.log(`✗ ${table} - DOES NOT EXIST`);
    } else {
      console.log(`? ${table} - ERROR: ${error.message}`);
    }
  }

  console.log("\n--- SUMMARY ---");
  console.log("Existing tables:", existingTables.length);
  console.log("Missing tables:", missingTables.length);

  // Check parent_child_relationships structure
  console.log("\n--- PARENT-CHILD RELATIONSHIPS STRUCTURE ---");
  const { data: relationships } = await supabase
    .from('parent_child_relationships')
    .select('*')
    .limit(3);
  if (relationships && relationships.length > 0) {
    console.log("Columns:", Object.keys(relationships[0]).join(', '));
    console.log("Sample:", JSON.stringify(relationships[0], null, 2));
  }

  // Check compliance_athletes structure
  console.log("\n--- COMPLIANCE ATHLETES STRUCTURE ---");
  const { data: compAthletes } = await supabase
    .from('compliance_athletes')
    .select('*')
    .limit(3);
  if (compAthletes && compAthletes.length > 0) {
    console.log("Columns:", Object.keys(compAthletes[0]).join(', '));
    console.log("Sample:", JSON.stringify(compAthletes[0], null, 2));
  }

  // Check student_discovery_profiles structure
  console.log("\n--- STUDENT DISCOVERY PROFILES STRUCTURE ---");
  const { data: studentProfiles } = await supabase
    .from('student_discovery_profiles')
    .select('*')
    .limit(2);
  if (studentProfiles && studentProfiles.length > 0) {
    console.log("Columns:", Object.keys(studentProfiles[0]).join(', '));
    console.log("Sample:", JSON.stringify(studentProfiles[0], null, 2));
  }

  // Check deals structure
  console.log("\n--- DEALS TABLE STRUCTURE ---");
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .limit(2);
  if (deals && deals.length > 0) {
    console.log("Columns:", Object.keys(deals[0]).join(', '));
  } else {
    const { data: nilDeals } = await supabase
      .from('nil_deals')
      .select('*')
      .limit(2);
    if (nilDeals && nilDeals.length > 0) {
      console.log("(nil_deals) Columns:", Object.keys(nilDeals[0]).join(', '));
    }
  }

  // Check user_settings or notification_settings
  console.log("\n--- SETTINGS TABLES STRUCTURE ---");
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .limit(2);
  if (userSettings && userSettings.length > 0) {
    console.log("user_settings Columns:", Object.keys(userSettings[0]).join(', '));
  }

  const { data: notifSettings } = await supabase
    .from('notification_settings')
    .select('*')
    .limit(2);
  if (notifSettings && notifSettings.length > 0) {
    console.log("notification_settings Columns:", Object.keys(notifSettings[0]).join(', '));
  }

  const { data: parentNotif } = await supabase
    .from('parent_notification_preferences')
    .select('*')
    .limit(2);
  if (parentNotif && parentNotif.length > 0) {
    console.log("parent_notification_preferences Columns:", Object.keys(parentNotif[0]).join(', '));
  }

  // Check institutions
  console.log("\n--- INSTITUTIONS TABLE STRUCTURE ---");
  const { data: institutions } = await supabase
    .from('institutions')
    .select('*')
    .limit(2);
  if (institutions && institutions.length > 0) {
    console.log("Columns:", Object.keys(institutions[0]).join(', '));
  }
}

runAudit().catch(console.error);
