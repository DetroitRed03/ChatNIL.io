/**
 * Test Schema Cache - Verify Supabase schema cache is properly loaded
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSchemaCache() {
  console.log('🧪 Testing Supabase Schema Cache...\n');

  // Test 1: Check if users table is accessible
  console.log('1️⃣ Testing users table access...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, bio, achievements')
    .limit(1);

  if (usersError) {
    console.error('❌ Users table error:', usersError);
  } else {
    console.log('✅ Users table accessible');
    console.log('   Columns tested: id, email, bio, achievements');
  }

  // Test 2: Try a simple update
  console.log('\n2️⃣ Testing profile update...');
  const testUserId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc'; // Sarah's ID

  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({
      bio: 'Test bio update',
      updated_at: new Date().toISOString()
    })
    .eq('id', testUserId)
    .select();

  if (updateError) {
    console.error('❌ Update error:', updateError);
  } else {
    console.log('✅ Profile update successful');
  }

  // Test 3: Check chat_sessions table
  console.log('\n3️⃣ Testing chat_sessions table...');
  const { data: sessions, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select('id')
    .limit(1);

  if (sessionsError) {
    console.error('❌ Chat sessions table error:', sessionsError);
  } else {
    console.log('✅ Chat sessions table accessible');
  }

  console.log('\n✅ Schema cache test complete!');
}

testSchemaCache().catch(console.error);
