/**
 * Quick check for user's chats in database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Sarah's user ID from the logs
const SARAH_USER_ID = '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1';

async function checkChats() {
  console.log('\n🔍 Checking chats for user: sarah.johnson@test.com');
  console.log('User ID:', SARAH_USER_ID);
  console.log('='.repeat(60), '\n');

  // Get chat sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', SARAH_USER_ID)
    .order('updated_at', { ascending: false });

  if (sessionsError) {
    console.error('❌ Error:', sessionsError.message);
    return;
  }

  if (!sessions || sessions.length === 0) {
    console.log('⚠️  No chat sessions found');
    console.log('\nThis is normal if you haven\'t sent any messages in the main app yet.');
    console.log('The test chat from the diagnostic tool was likely created with a different user ID.\n');
    return;
  }

  console.log(`✅ Found ${sessions.length} chat session(s):\n`);

  for (const session of sessions) {
    console.log(`📝 "${session.title}"`);
    console.log(`   ID: ${session.id}`);
    console.log(`   Created: ${new Date(session.created_at).toLocaleString()}`);
    console.log(`   Updated: ${new Date(session.updated_at).toLocaleString()}`);

    // Get messages for this session
    const { data: messages, count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    console.log(`   Messages: ${count || 0}`);

    if (messages && messages.length > 0) {
      messages.forEach((msg, idx) => {
        const preview = msg.content.substring(0, 50);
        console.log(`      ${idx + 1}. [${msg.role}] ${preview}${msg.content.length > 50 ? '...' : ''}`);
      });
    }
    console.log('');
  }
}

checkChats();
