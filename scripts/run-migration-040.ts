#!/usr/bin/env tsx

/**
 * Run Migration 040: Agency Platform
 *
 * This script executes the agency platform migration SQL file
 * using the Supabase service role key for admin access.
 *
 * Usage: npx tsx scripts/run-migration-040.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running Migration 040: Agency Platform\n');
  console.log('='.repeat(60));

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '040_agency_platform.sql');
    console.log(`\n📄 Reading migration file: ${migrationPath}`);

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ Migration file loaded (${sql.length} characters)\n`);

    // Execute the migration
    console.log('⚡ Executing migration SQL...\n');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }) as any;

    if (error) {
      // Supabase might not have exec_sql function, try alternative approach
      // We'll need to execute statements one by one
      console.log('⚠️  exec_sql not available, executing via Postgres function...\n');

      // Split SQL into individual statements (rough split by semicolon)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`Found ${statements.length} SQL statements to execute\n`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        // Skip comments
        if (statement.startsWith('--') || statement.startsWith('/*')) {
          console.log('  Skipped (comment)');
          continue;
        }

        try {
          const { error: stmtError } = await supabase.rpc('exec', {
            sql: statement + ';'
          });

          if (stmtError) {
            console.error(`  ❌ Error: ${stmtError.message}`);
            throw stmtError;
          }

          console.log('  ✅ Success');
        } catch (err: any) {
          console.error(`  ❌ Failed to execute statement ${i + 1}`);
          console.error(`  Statement: ${statement.substring(0, 100)}...`);
          console.error(`  Error: ${err.message}`);
          throw err;
        }
      }

      console.log('\n✅ All statements executed successfully!\n');
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables were created...\n');

    const tables = [
      'athlete_public_profiles',
      'athlete_portfolio_items',
      'agency_saved_searches',
      'agency_athlete_lists',
      'agency_athlete_list_items',
      'agency_campaigns',
      'campaign_athlete_invites',
      'agency_athlete_messages'
    ];

    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Table "${table}" - NOT FOUND or ERROR: ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`✅ Table "${table}" - EXISTS`);
        }
      } catch (err: any) {
        console.log(`❌ Table "${table}" - ERROR: ${err.message}`);
        allTablesExist = false;
      }
    }

    console.log('\n' + '='.repeat(60));

    if (allTablesExist) {
      console.log('\n✅ Migration 040 completed successfully!');
      console.log('\nNext steps:');
      console.log('  1. Run: npx tsx scripts/migrate-athletes-to-public-profiles.ts');
      console.log('  2. Run: npx tsx scripts/verify-agency-platform.ts\n');
      return 0;
    } else {
      console.log('\n⚠️  Migration completed but some tables are missing.');
      console.log('Please check the errors above and run the migration manually in Supabase SQL Editor.\n');
      return 1;
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease run the migration manually:');
    console.error('  1. Open Supabase Dashboard → SQL Editor');
    console.error('  2. Copy contents of migrations/040_agency_platform.sql');
    console.error('  3. Execute the SQL\n');
    return 1;
  }
}

runMigration()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
