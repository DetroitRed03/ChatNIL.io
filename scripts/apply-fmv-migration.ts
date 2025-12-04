import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function applyFmvMigration() {
  console.log('📦 APPLYING FMV MIGRATION\n');
  console.log('='.repeat(80));
  console.log('\n');

  // Read migration file
  const migrationPath = join(process.cwd(), 'migrations/phase-5-fmv-system/022_athlete_fmv_data.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file: 022_athlete_fmv_data.sql');
  console.log(`📏 SQL length: ${migrationSQL.length} characters`);
  console.log('\n');

  // Split SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

  console.log(`🔢 Found ${statements.length} SQL statements\n`);

  // Execute each statement
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 100).replace(/\n/g, ' ');

    console.log(`\n${i + 1}/${statements.length}: ${preview}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Check if it's a "already exists" error (which is fine)
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate')
        ) {
          console.log(`   ⚠️  Already exists (skipping): ${error.message.substring(0, 80)}`);
          successCount++;
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
    } catch (e: any) {
      console.error(`   💥 Exception: ${e.message}`);
      errorCount++;
    }
  }

  console.log('\n');
  console.log('='.repeat(80));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`   ✅ Successful: ${successCount}/${statements.length}`);
  console.log(`   ❌ Failed: ${errorCount}/${statements.length}`);
  console.log('\n');

  if (errorCount === 0) {
    console.log('✅ FMV migration applied successfully!');
    console.log('\n🔄 Reloading PostgREST schema cache...\n');

    // Reload schema cache
    const reloadUrl = `${supabaseUrl}/rest/v1/?select=*`;
    try {
      await fetch(reloadUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Accept-Profile': 'public',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Schema cache reloaded');
    } catch (e) {
      console.log('⚠️  Schema cache reload failed (may need manual restart)');
    }
  } else {
    console.log('⚠️  Some statements failed. Check errors above.');
  }

  console.log('\n');
}

applyFmvMigration().catch(console.error);
