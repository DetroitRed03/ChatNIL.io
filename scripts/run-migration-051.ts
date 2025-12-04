import { createServiceRoleClient } from '../lib/supabase/server';
import fs from 'fs';
import path from 'path';

const supabase = createServiceRoleClient();

async function runMigration() {
  console.log('📋 Running Migration 051: Dashboard support tables\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '051_dashboard_support_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Execute via exec_sql RPC function (parameter name is 'query')
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }

    console.log('✅ Migration 051 complete!');
    console.log('\nTables created:');
    console.log('  - notifications');
    console.log('  - events');
    console.log('  - quiz_progress');
    console.log('  - badges');
    console.log('\n✨ Ready to seed data!');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
