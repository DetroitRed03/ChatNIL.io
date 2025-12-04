/**
 * Verify knowledge_base table exists directly in PostgreSQL
 * Bypasses PostgREST to check raw database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function verifyTable() {
  console.log('🔍 Checking if knowledge_base table exists in PostgreSQL\n');

  // Query information_schema directly
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'knowledge_base'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.log('❌ Error querying database:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ knowledge_base table does NOT exist in PostgreSQL!');
    console.log('\n📋 This means migration 012 was not applied.');
    console.log('   Run: npx tsx scripts/apply-migration-012.ts');
    return;
  }

  console.log('✅ knowledge_base table EXISTS in PostgreSQL!');
  console.log(`\n📊 Found ${data.length} columns:\n`);

  data.forEach((col: any) => {
    console.log(`   ${col.column_name.padEnd(20)} ${col.data_type}`);
  });

  console.log('\n⚠️  Table exists in PostgreSQL but NOT in PostgREST cache');
  console.log('\n📋 Solutions:');
  console.log('   1. Wait another 5 minutes for cache to refresh');
  console.log('   2. Contact Supabase support about PostgREST cache');
  console.log('   3. Try pausing AND resuming project (not just restart)');
}

verifyTable().catch(console.error);
