/**
 * Apply Migration 012 - Enable pgvector and create knowledge_base table
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function applyMigration012() {
  console.log('🚀 Applying Migration 012: pgvector + knowledge_base\n');

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/012_enable_vector_and_knowledge_base.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded');
  console.log(`📊 SQL length: ${sql.length} characters\n`);

  // Execute via exec_sql RPC
  console.log('⚡ Executing migration via exec_sql...\n');

  const { data, error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);

    if (error.message.includes('permission denied')) {
      console.log('\n⚠️  PERMISSION ERROR DETECTED');
      console.log('📋 The pgvector extension requires superuser privileges.');
      console.log('\n🔧 SOLUTION: Apply migration via Supabase Dashboard');
      console.log('   1. Visit: https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql/new');
      console.log('   2. Copy the contents of: supabase/migrations/012_enable_vector_and_knowledge_base.sql');
      console.log('   3. Paste into SQL editor');
      console.log('   4. Click "Run"');
      console.log('\n   The dashboard SQL editor has superuser privileges needed for CREATE EXTENSION.');
    }

    return;
  }

  console.log('✅ Migration executed successfully!\n');
  console.log('📦 Results:', data);

  // Verify knowledge_base table is now visible
  console.log('\n🔍 Verifying knowledge_base table...');

  const { data: kbData, error: kbError } = await supabase
    .from('knowledge_base')
    .select('id')
    .limit(1);

  if (kbError) {
    console.log('⏳ Table not yet visible via PostgREST:', kbError.message);
    console.log('   Waiting for schema cache to refresh...');

    // Send NOTIFY to force refresh
    await supabase.rpc('exec_sql', { query: "NOTIFY pgrst, 'reload schema';" });
    console.log('   📡 NOTIFY signal sent');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Retry
    const { data: retryData, error: retryError } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);

    if (retryError) {
      console.log('   ⏳ Still not visible. Cache may take 5-10 minutes to refresh.');
    } else {
      console.log('   ✅ Table is now visible!');
    }
  } else {
    console.log('✅ knowledge_base table is visible via PostgREST!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 MIGRATION 012 COMPLETE');
  console.log('='.repeat(60));
  console.log('Next steps:');
  console.log('1. Verify: npx tsx scripts/force-postgrest-reload.ts');
  console.log('2. Seed: npx tsx scripts/seed-kb-simple.ts');
  console.log('='.repeat(60));
}

applyMigration012().catch(console.error);
