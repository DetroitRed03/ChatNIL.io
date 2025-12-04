import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  env[key] = valueParts.join('=');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyMigration() {
  console.log('🔄 Applying Migration 100: Agency Dashboard Infrastructure\n');
  console.log('🎯 Target:', env.NEXT_PUBLIC_SUPABASE_URL, '\n');

  // Read the migration file
  const migrationPath = join(process.cwd(), 'migrations', '100_agency_dashboard_infrastructure.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log('📦 Applying consolidated migration...\n');

  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }

  console.log('\n🎉 Migration 100 applied successfully!\n');
  console.log('✅ Created:');
  console.log('  - campaigns table');
  console.log('  - campaign_athletes table');
  console.log('  - campaign_metrics table');
  console.log('  - agency_budget_allocations table');
  console.log('  - agency_activity_log table');
  console.log('  - agency_pending_actions table');
  console.log('  - agency_dashboard_stats view');
  console.log('  - campaign_performance_detail view');
  console.log('  - agency_athlete_roster view');
  console.log('  - update_campaign_metrics() function');
  console.log('  - log_agency_activity() function');
  console.log('  - get_agency_dashboard_stats() function');
  console.log('  - All RLS policies and indexes\n');
}

applyMigration().catch(console.error);
