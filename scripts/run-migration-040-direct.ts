import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  try {
    console.log('🚀 Running migration 040: Agency Platform\n');

    // Read migration file
    const migrationPath = join(process.cwd(), 'migrations', '040_agency_platform_minimal.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing SQL migration...\n');

    // Execute the entire migration as one batch
    // Note: Supabase client doesn't have direct SQL execution, so we need to use the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Migration failed:', error);

      // Try alternative approach: execute statements one by one
      console.log('\n⚠️  Trying alternative approach: executing statements individually...\n');

      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];

        if (!statement || statement.startsWith('--')) continue;

        try {
          // Use Supabase's query builder for schema operations
          const { error: stmtError } = await (supabase as any).rpc('exec', {
            query: statement + ';'
          });

          if (stmtError) {
            if (stmtError.message.includes('already exists')) {
              console.log(`⚠️  Statement ${i + 1}: Already exists (skipping)`);
            } else {
              console.error(`❌ Statement ${i + 1} failed:`, stmtError.message.substring(0, 100));
              errorCount++;
            }
          } else {
            successCount++;
            if ((i + 1) % 10 === 0) {
              console.log(`✓ Processed ${i + 1} statements...`);
            }
          }
        } catch (err: any) {
          console.error(`❌ Statement ${i + 1} error:`, err.message);
          errorCount++;
        }
      }

      console.log(`\n📊 Results:`);
      console.log(`   Successful: ${successCount}`);
      console.log(`   Errors: ${errorCount}`);

      if (errorCount > successCount) {
        console.error('\n❌ Too many errors. Please run the migration manually in Supabase SQL editor.');
        console.error('   1. Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql/new');
        console.error('   2. Copy contents of: migrations/040_agency_platform_minimal.sql');
        console.error('   3. Paste and click Run\n');
        process.exit(1);
      }
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const tables = [
      'athlete_public_profiles',
      'agency_campaigns',
      'campaign_athlete_invites',
      'agency_athlete_messages'
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table ${table}: NOT FOUND`);
      } else {
        console.log(`✅ Table ${table}: EXISTS`);
      }
    }

    console.log('\n✅ Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npx tsx scripts/seed-demo-data.ts');
    console.log('   2. Open: http://localhost:3000/demo/athlete\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n📝 Manual migration required:');
    console.error('   1. Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql/new');
    console.error('   2. Copy contents of: migrations/040_agency_platform_minimal.sql');
    console.error('   3. Paste and click Run\n');
    process.exit(1);
  }
}

runMigration();
