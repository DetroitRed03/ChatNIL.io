#!/usr/bin/env tsx
/**
 * Quick test to see if exec_sql function exists and works
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function test() {
  console.log('🧪 Testing exec_sql function...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: 'SELECT 1 as test'
  });

  if (error) {
    console.error('❌ exec_sql function does not exist or failed:');
    console.error(error);
    console.log('\n⚠️  You need to run the setup SQL in Supabase first.');
    console.log('   Run: npm run migrate:init');
    process.exit(1);
  }

  console.log('✅ exec_sql function exists and works!');
  console.log('📊 Result:', data);
  console.log('\n🎉 Migration system is ready to use!');
}

test();
