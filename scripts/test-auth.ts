#!/usr/bin/env tsx
/**
 * Test authentication with the configured keys
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔐 Testing Supabase Authentication\n');
console.log('═'.repeat(80));
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('═'.repeat(80));
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('🧪 Testing sign in with Nike account...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'nike.agency@test.com',
    password: 'TestPassword123!',
  });

  if (error) {
    console.error('❌ Authentication failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.status);
    console.error('   Full error:', error);
    console.log('\n💡 This might mean:');
    console.log('   - The API key is invalid for this project');
    console.log('   - The password is incorrect');
    console.log('   - The user doesn\'t exist');
    process.exit(1);
  }

  console.log('✅ Authentication successful!');
  console.log(`   User ID: ${data.user?.id}`);
  console.log(`   Email: ${data.user?.email}`);
  console.log(`   Role: ${data.user?.role}`);
  console.log('\n🎉 The API key and credentials are working correctly!');
}

testAuth();
