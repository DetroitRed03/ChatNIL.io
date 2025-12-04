import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

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

async function checkTables() {
  console.log('🔍 Checking for campaign and agency tables...\n');

  const tables = [
    'campaigns',
    'campaign_athletes',
    'campaign_metrics',
    'agency_budget_allocations',
    'agency_activity_log',
    'agency_pending_actions',
    'agencies'
  ];

  for (const table of tables) {
    const { error, count } = await supabase.from(table).select('id', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists (${count} rows)`);
    }
  }

  console.log('\n🔍 Checking views...\n');

  const views = [
    'agency_dashboard_stats',
    'campaign_performance_detail',
    'agency_athlete_roster'
  ];

  for (const view of views) {
    const { error } = await supabase.from(view).select('*').limit(1);
    if (error) {
      console.log(`❌ ${view}: ${error.message}`);
    } else {
      console.log(`✅ ${view}: exists`);
    }
  }
}

checkTables();
