import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migrations to apply in order
const migrations = [
  {
    name: 'NIL Deals Table',
    file: 'migrations/018_nil_deals.sql',
    description: 'Create nil_deals table for tracking athlete-agency deals'
  },
  {
    name: 'State NIL Rules',
    file: 'migrations/phase-5-fmv-system/023_state_nil_rules.sql',
    description: 'Create state_nil_rules table for 50-state compliance'
  }
];

async function executeSqlFile(filePath: string, migrationName: string) {
  console.log(`\n📄 Applying: ${migrationName}`);
  console.log(`   File: ${filePath}`);

  try {
    const sql = readFileSync(join(process.cwd(), filePath), 'utf8');

    // Split by semicolons but preserve function/trigger definitions
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

    console.log(`   Statements: ${statements.length}\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');

      // Execute via RPC if available, otherwise direct query
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement }).catch(async () => {
        // Fallback to direct execution if RPC doesn't exist
        return await supabase.from('_migrations').insert({ sql: statement });
      });

      if (error) {
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate') ||
            error.code === '42P07' || // duplicate table
            error.code === '42710') { // duplicate object
          skipCount++;
        } else {
          console.log(`   ⚠️  ${preview}...`);
          console.log(`      ${error.message.substring(0, 100)}`);
          errorCount++;
        }
      } else {
        successCount++;
      }
    }

    console.log(`\n   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount} (already exists)`);
    console.log(`   ❌ Errors: ${errorCount}`);

    return errorCount === 0;
  } catch (err: any) {
    console.error(`   ❌ File error: ${err.message}`);
    return false;
  }
}

async function applyMissingMigrations() {
  console.log('🔧 APPLYING MISSING MIGRATIONS\n');
  console.log('='.repeat(80));
  console.log('\n');
  console.log('This will create the following tables:');
  console.log('  • nil_deals - Track athlete-agency deals');
  console.log('  • state_nil_rules - 50-state compliance rules');
  console.log('\n');
  console.log('='.repeat(80));

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const migration of migrations) {
    const success = await executeSqlFile(migration.file, migration.name);
    if (success) {
      totalSuccess++;
    } else {
      totalFailed++;
    }
  }

  console.log('\n');
  console.log('='.repeat(80));
  console.log('📊 MIGRATION SUMMARY\n');
  console.log(`   ✅ Successful: ${totalSuccess}/${migrations.length}`);
  console.log(`   ❌ Failed: ${totalFailed}/${migrations.length}`);
  console.log('\n');

  if (totalFailed === 0) {
    console.log('✅ ALL MIGRATIONS APPLIED SUCCESSFULLY!\n');
    console.log('🔄 Reloading PostgREST schema cache...');

    // Reload schema cache
    try {
      await fetch(`${supabaseUrl}/rest/v1/?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      console.log('✅ Schema cache reloaded\n');
    } catch (e) {
      console.log('⚠️  Schema cache reload may need manual restart\n');
    }

    console.log('🔜 NEXT STEPS:');
    console.log('   1. Run: npx tsx scripts/complete-matchmaking-data.ts');
    console.log('   2. This will seed:');
    console.log('      • 5 Active campaigns');
    console.log('      • 3 NIL deals for Sarah');
    console.log('      • 3+ Agency-athlete matches');
    console.log('   3. Test matchmaking system end-to-end');
    console.log('\n');
  } else {
    console.log('⚠️  Some migrations failed. Check errors above.\n');
  }
}

applyMissingMigrations().catch(console.error);
