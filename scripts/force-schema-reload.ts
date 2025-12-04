#!/usr/bin/env tsx
/**
 * Force Supabase PostgREST to reload schema cache
 * This tries multiple methods to trigger a schema reload
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function forceSchemaReload() {
  console.log('🔄 Forcing Supabase schema cache reload...\n');

  // Method 1: NOTIFY command
  console.log('Method 1: Sending NOTIFY pgrst command...');
  const { error: notifyError } = await supabase.rpc('exec_sql', {
    query: "NOTIFY pgrst, 'reload schema';"
  });

  if (notifyError) {
    console.log('  ⚠️  NOTIFY failed:', notifyError.message);
  } else {
    console.log('  ✅ NOTIFY sent');
  }

  // Method 2: Trigger via OPTIONS request to force schema introspection
  console.log('\nMethod 2: Triggering OPTIONS request...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'OPTIONS',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    console.log('  ✅ OPTIONS request sent, status:', response.status);
  } catch (e: any) {
    console.log('  ⚠️  OPTIONS request failed:', e.message);
  }

  // Method 3: Make a dummy change to force cache invalidation
  console.log('\nMethod 3: Creating dummy comment to trigger refresh...');
  const { error: commentError } = await supabase.rpc('exec_sql', {
    query: "COMMENT ON TABLE users IS 'User profiles and account information';"
  });

  if (commentError) {
    console.log('  ⚠️  Comment failed:', commentError.message);
  } else {
    console.log('  ✅ Comment added');
  }

  console.log('\n⏳ Waiting 5 seconds for schema to propagate...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Test if it worked
  console.log('\n🧪 Testing if schema cache is refreshed...');
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role')
    .limit(1);

  if (error) {
    console.log('❌ Schema cache still not refreshed');
    console.log('   Error:', error.message);
    console.log('\n💡 Next steps:');
    console.log('   1. Wait another 1-2 minutes');
    console.log('   2. Or pause/unpause the Supabase project in dashboard');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS! Schema cache is refreshed!');
    console.log('📊 Users table is now accessible');
    console.log('\n🎉 You can now log in at http://localhost:3000');
  }
}

forceSchemaReload().catch(console.error);
