import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLQuery(sql: string, description: string) {
  console.log(`\n🔄 ${description}...`);

  try {
    // Use the REST API directly to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Failed: ${errorText}`);
      return false;
    }

    console.log(`✅ ${description} - Success`);
    return true;
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function applyMigration() {
  console.log('📝 Applying Migration 070: Profile and Cover Photo Support\n');
  console.log('=' .repeat(70));

  const migrationPath = path.join(process.cwd(), 'migrations', '070_add_profile_cover_photos.sql');
  const fullSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('\n📋 Attempting to execute migration via direct SQL query...\n');

  // Try executing the full SQL
  const success = await executeSQLQuery(fullSQL, 'Executing complete migration');

  if (success) {
    console.log('\n✅ Migration 070 completed successfully!\n');
  } else {
    console.log('\n⚠️  Direct SQL execution not available.');
    console.log('\n📝 Please use one of these methods:\n');
    console.log('1. Open Supabase Dashboard SQL Editor:');
    console.log('   https://enbuwffusjhpcyoveewb.supabase.co/project/default/sql/new\n');
    console.log('2. Copy migration SQL (already in clipboard if you ran previous script)\n');
    console.log('3. Or run: cat migrations/070_add_profile_cover_photos.sql | pbcopy\n');
  }
}

applyMigration();
