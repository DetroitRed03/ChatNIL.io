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

async function listTables() {
  console.log('🔍 Checking for agency-related tables...\n');

  const tablesToCheck = [
    'agencies',
    'agency_campaigns',
    'agency_athlete_matches',
    'agency_budget_allocations',
    'agency_activity_log',
    'agency_pending_actions',
    'campaigns',
    'campaign_athletes'
  ];

  for (const table of tablesToCheck) {
    const { error: tableError, count } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true });

    if (tableError) {
      console.log(`❌ ${table}: ${tableError.message}`);
    } else {
      console.log(`✅ ${table}: exists (${count || 0} rows)`);
    }
  }
}

listTables();
