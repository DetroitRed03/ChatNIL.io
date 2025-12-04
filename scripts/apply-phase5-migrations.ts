/**
 * Migration Runner: Apply Phase 5 FMV System Migrations
 * Applies all Phase 5 migrations (022-029) to production Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migrations to apply in order
const migrations = [
  { file: '022_athlete_fmv_data.sql', name: 'Athlete FMV Data Table' },
  { file: '023_state_nil_rules.sql', name: 'State NIL Rules Table' },
  { file: '024_scraped_athlete_data.sql', name: 'Scraped Athlete Data Table' },
  { file: '025_institution_profiles.sql', name: 'Institution Profiles Table' },
  { file: '026_business_profiles.sql', name: 'Business Profiles Table (NOT IMPLEMENTED)' },
  { file: '027_update_user_roles.sql', name: 'Update User Roles' },
  { file: '028_seed_all_state_nil_rules.sql', name: 'Seed All 50 State NIL Rules' },
  { file: '029_seed_sample_fmv_data.sql', name: 'Seed Sample FMV Data (Optional)' },
];

async function executeSQLFile(filePath: string, migrationName: string): Promise<boolean> {
  try {
    console.log(`📂 Reading: ${filePath}`);
    const sql = readFileSync(filePath, 'utf-8');

    // Split SQL into individual statements (handle semicolons in strings properly)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);
    console.log('🔄 Executing...\n');

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          // Check if it's a "already exists" error - these are safe to ignore
          if (
            error.message?.includes('already exists') ||
            error.message?.includes('duplicate key') ||
            error.code === '42P07' || // duplicate table
            error.code === '42710' || // duplicate object
            error.code === '42723'    // duplicate function
          ) {
            console.log(`   ⚠️  Statement ${i + 1}/${statements.length}: Already exists (skipping)`);
            continue;
          }

          console.error(`   ❌ Statement ${i + 1}/${statements.length} failed:`, error);
          return false;
        }

        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ Completed ${i + 1}/${statements.length} statements...`);
        }
      } catch (err) {
        console.error(`   ❌ Unexpected error on statement ${i + 1}:`, err);
        return false;
      }
    }

    console.log(`   ✅ All ${statements.length} statements executed successfully!\n`);
    return true;

  } catch (error) {
    console.error('❌ Failed to read or execute migration:', error);
    return false;
  }
}

async function checkExecSqlFunction(): Promise<boolean> {
  // Try to execute a simple query to check if exec_sql exists
  const { error } = await supabase.rpc('exec_sql', {
    sql_query: 'SELECT 1;'
  });

  if (error) {
    if (error.code === 'PGRST202' || error.message.includes('exec_sql')) {
      console.error('❌ The exec_sql function does not exist in your database.\n');
      console.log('You need to create it first. Run this SQL in Supabase Dashboard:\n');
      console.log('----------------------------------------');
      console.log(`CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;`);
      console.log('----------------------------------------\n');
      console.log('Or use Option 2 below to apply migrations manually.\n');
      return false;
    }
  }

  return true;
}

async function runMigrations() {
  console.log('🚀 Starting Phase 5 FMV System Migrations');
  console.log('📊 Supabase URL:', SUPABASE_URL);
  console.log('');

  // Check if exec_sql function exists
  console.log('🔍 Checking for exec_sql function...');
  const hasExecSql = await checkExecSqlFunction();

  if (!hasExecSql) {
    console.log('\n💡 Alternative Options:\n');
    console.log('Option 1: Create exec_sql function (see SQL above)');
    console.log('Option 2: Manual Application via Supabase Dashboard');
    console.log('  1. Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql');
    console.log('  2. Copy each migration file from migrations/phase-5-fmv-system/');
    console.log('  3. Paste into SQL editor and run in order (022 → 029)');
    console.log('');
    process.exit(1);
  }

  console.log('✅ exec_sql function found!\n');

  try {
    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
      const filePath = join(process.cwd(), 'migrations', 'phase-5-fmv-system', migration.file);

      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 Migration: ${migration.name}`);
      console.log(`📄 File: ${migration.file}`);
      console.log('='.repeat(80));
      console.log('');

      const success = await executeSQLFile(filePath, migration.name);

      if (success) {
        console.log(`✅ ${migration.name} - COMPLETE\n`);
        successCount++;
      } else {
        console.log(`❌ ${migration.name} - FAILED\n`);
        failCount++;

        // Ask if we should continue
        console.log('⚠️  Migration failed. Stopping here to prevent cascade failures.\n');
        break;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successful: ${successCount}/${migrations.length}`);
    console.log(`❌ Failed: ${failCount}/${migrations.length}`);
    console.log('');

    if (failCount === 0) {
      console.log('🎉 All Phase 5 migrations completed successfully!\n');
      console.log('Next steps:');
      console.log('  1. Run: npm run seed:phase5');
      console.log('  2. Test login: sarah.johnson@test.com / TestPassword123!');
      console.log('  3. Navigate to FMV dashboard to see calculated scores\n');
    } else {
      console.log('⚠️  Some migrations failed. Please review errors above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error during migration:', error);
    process.exit(1);
  }
}

runMigrations();
