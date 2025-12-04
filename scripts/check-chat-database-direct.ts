/**
 * Check chat database directly using exec_sql (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkDatabase() {
  console.log('🔍 Checking Chat Database (Direct SQL)\n');

  // 1. Count sessions
  console.log('📊 Counting chat sessions...');
  const { data: sessionData, error: sessionError } = await supabase.rpc('exec_sql', {
    query: 'SELECT COUNT(*) as count FROM chat_sessions;'
  });

  if (sessionError) {
    console.error('❌ Error:', sessionError);
  } else {
    console.log('Result:', JSON.stringify(sessionData, null, 2));
  }

  // 2. Count messages
  console.log('\n📊 Counting chat messages...');
  const { data: messageData, error: messageError } = await supabase.rpc('exec_sql', {
    query: 'SELECT COUNT(*) as count FROM chat_messages;'
  });

  if (messageError) {
    console.error('❌ Error:', messageError);
  } else {
    console.log('Result:', JSON.stringify(messageData, null, 2));
  }

  // 3. Check recent sessions
  console.log('\n📊 Recent sessions:');
  const { data: recentData, error: recentError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT id, title, user_id, created_at, updated_at
      FROM chat_sessions
      ORDER BY updated_at DESC
      LIMIT 5;
    `
  });

  if (recentError) {
    console.error('❌ Error:', recentError);
  } else {
    console.log('Result:', JSON.stringify(recentData, null, 2));
  }

  console.log('\n✅ Check complete!');
}

checkDatabase();
