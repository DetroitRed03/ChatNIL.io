/**
 * Force PostgREST Schema Cache Reload
 * Sends multiple NOTIFY signals to PostgREST
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function reloadPostgREST() {
  console.log('🔄 Attempting to Reload PostgREST Schema Cache\n');

  // Try multiple NOTIFY signals
  const signals = [
    'NOTIFY pgrst, \'reload schema\';',
    'NOTIFY pgrst, \'reload config\';',
    'NOTIFY pgrst;',
  ];

  for (const signal of signals) {
    console.log(`📡 Sending: ${signal}`);
    const { error } = await supabase.rpc('exec_sql', { query: signal });

    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Sent successfully`);
    }
  }

  // Wait a moment for cache to refresh
  console.log('\n⏳ Waiting 3 seconds for cache to refresh...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Test if knowledge_base is now visible
  console.log('\n🔍 Testing if knowledge_base table is visible...');
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Still not visible:', error.message);
    console.log('\n📋 Manual steps required:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/settings/general');
    console.log('   2. Look for "Restart project" or "Pause project" button');
    console.log('   3. Click to restart (takes 2-3 minutes)');
    console.log('   4. Re-run this script to verify');
  } else {
    console.log('✅ SUCCESS! knowledge_base table is now visible!');
    console.log('\n🚀 Ready to seed! Run:');
    console.log('   npx tsx scripts/seed-kb-simple.ts');
  }
}

reloadPostgREST().catch(console.error);
