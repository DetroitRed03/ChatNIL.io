/**
 * Diagnostic Script: Check Chat Persistence
 * Verify that chat_sessions and chat_messages are being stored correctly
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

async function checkChatPersistence() {
  console.log('🔍 Checking Chat Persistence\n');
  console.log('=' .repeat(80));

  // 1. Check if tables exist
  console.log('\n📊 Step 1: Verify tables exist');
  const { data: tables, error: tablesError } = await supabase
    .from('chat_sessions')
    .select('id')
    .limit(1);

  if (tablesError) {
    console.error('❌ chat_sessions table error:', tablesError);
    return;
  }
  console.log('✅ chat_sessions table exists');

  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('id')
    .limit(1);

  if (messagesError) {
    console.error('❌ chat_messages table error:', messagesError);
    return;
  }
  console.log('✅ chat_messages table exists');

  // 2. Count total sessions
  console.log('\n📊 Step 2: Count chat sessions');
  const { count: sessionCount, error: countError } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting sessions:', countError);
  } else {
    console.log(`✅ Total chat sessions: ${sessionCount || 0}`);
  }

  // 3. Count total messages
  console.log('\n📊 Step 3: Count chat messages');
  const { count: messageCount, error: msgCountError } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });

  if (msgCountError) {
    console.error('❌ Error counting messages:', msgCountError);
  } else {
    console.log(`✅ Total chat messages: ${messageCount || 0}`);
  }

  // 4. List recent sessions with their message counts
  console.log('\n📊 Step 4: Recent chat sessions (last 10)');
  const { data: sessions, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select('id, title, user_id, created_at, updated_at, is_archived')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
  } else if (!sessions || sessions.length === 0) {
    console.log('⚠️  No chat sessions found in database');
  } else {
    console.log(`Found ${sessions.length} recent sessions:\n`);

    for (const session of sessions) {
      // Get message count for this session
      const { count: msgCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id);

      console.log(`📝 "${session.title}"`);
      console.log(`   ID: ${session.id}`);
      console.log(`   User: ${session.user_id}`);
      console.log(`   Messages: ${msgCount || 0}`);
      console.log(`   Created: ${new Date(session.created_at).toLocaleString()}`);
      console.log(`   Updated: ${new Date(session.updated_at).toLocaleString()}`);
      console.log(`   Archived: ${session.is_archived ? 'Yes' : 'No'}`);
      console.log('');
    }
  }

  // 5. Check RLS policies
  console.log('\n📊 Step 5: Check RLS policies');
  const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT schemaname, tablename, policyname, cmd, qual
      FROM pg_policies
      WHERE tablename IN ('chat_sessions', 'chat_messages')
      ORDER BY tablename, policyname;
    `
  });

  if (policiesError) {
    console.error('❌ Error checking RLS policies:', policiesError);
  } else if (policies && Array.isArray(policies)) {
    console.log(`✅ Found ${policies.length} RLS policies`);
  } else {
    console.log('✅ RLS policies exist (exact count unavailable)');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Diagnostic complete!\n');
}

checkChatPersistence();
