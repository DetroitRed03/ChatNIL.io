import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://enbuwffusjhpcyoveewb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnV3ZmZ1c2pocGN5b3ZlZXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjcwOSwiZXhwIjoyMDc0MjYyNzA5fQ.fXvyvHrUoNLdAr1expbRsguM8fkmurrNQi3-7xk8-TM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('🚀 Starting Migration 090: Dashboard Infrastructure');
  console.log('================================================\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '090_dashboard_infrastructure.sql');
    console.log('📥 Reading migration file:', migrationPath);
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${sql.length} characters)\n`);

    // Execute the migration
    console.log('🔧 Executing migration SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('\n✅ Migration 090 applied successfully!\n');
    console.log('📊 Created:');
    console.log('  - athlete_dashboard_metrics (materialized view)');
    console.log('  - agency_dashboard_metrics (materialized view)');
    console.log('  - activity_feed (materialized view)');
    console.log('  - Indexes for performance');
    console.log('  - Auto-refresh jobs (pg_cron)\n');
    console.log('✨ Dashboard infrastructure is ready!\n');
    
    console.log('🔄 Next steps:');
    console.log('  1. Refresh materialized views (or wait 5 minutes for auto-refresh)');
    console.log('  2. Reload the dashboard page to see data\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  }
}

runMigration();
