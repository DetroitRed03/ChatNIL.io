/**
 * Force PostgREST Schema Reload
 * Multiple approaches to force PostgREST to reload its schema cache
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function forceReload() {
  console.log('🔄 Forcing PostgREST Schema Reload\n');

  // Method 1: Send NOTIFY pgrst signal
  console.log('📡 Sending NOTIFY pgrst signal...');
  const { error: notifyError } = await supabase.rpc('exec_sql', {
    query: 'NOTIFY pgrst, \'reload schema\';'
  });

  if (notifyError) {
    console.log('❌ NOTIFY failed:', notifyError.message);
  } else {
    console.log('✅ NOTIFY sent successfully');
  }

  // Method 2: Check if knowledge_base is visible now
  console.log('\n🔍 Checking knowledge_base table visibility...');
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Still not visible:', error.message);
    console.log('\n⏳ PostgREST cache hasn\'t refreshed yet.');
    console.log('📋 Options:');
    console.log('   1. Wait 5-10 minutes for automatic refresh');
    console.log('   2. Restart Supabase project via dashboard');
    console.log('   3. Visit: https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/settings/general');
  } else {
    console.log('✅ knowledge_base table is now visible!');
    console.log(`📊 Found ${data?.length || 0} entries`);
  }

  // Method 3: Check what tables ARE visible
  console.log('\n📋 Checking other tables for comparison...');

  const tables = ['users', 'state_nil_rules', 'quiz_questions', 'athlete_profiles'];
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: ${data || 0} rows`);
    }
  }
}

forceReload().catch(console.error);
