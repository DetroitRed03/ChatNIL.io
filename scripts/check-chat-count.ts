import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChatCount() {
  console.log('🔍 Checking chat database state...\n');

  // Get test user
  const testUserEmail = 'sarah.johnson@test.com';
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('email', testUserEmail)
    .single();

  if (userError || !user) {
    console.error('❌ Could not find test user:', testUserEmail);
    return;
  }

  console.log('👤 User:', user.email);
  console.log('🆔 User ID:', user.id);
  console.log('');

  // Count chat sessions
  const { data: sessions, error: sessionsError, count: sessionCount } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
    return;
  }

  console.log('📊 CHAT SESSIONS IN DATABASE:', sessionCount);
  console.log('');

  if (sessions && sessions.length > 0) {
    console.log('📝 Session Details:');
    sessions.forEach((session, index) => {
      console.log(`  ${index + 1}. "${session.title}" (ID: ${session.id.substring(0, 8)}...)`);
      console.log(`     Created: ${new Date(session.created_at).toLocaleString()}`);
      console.log(`     Updated: ${new Date(session.updated_at).toLocaleString()}`);
    });
    console.log('');
  }

  // Count messages
  const { data: messages, error: messagesError, count: messageCount } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  if (messagesError) {
    console.error('❌ Error fetching messages:', messagesError);
    return;
  }

  console.log('💬 TOTAL MESSAGES IN DATABASE:', messageCount);
  console.log('');

  // Group messages by session
  if (messages && messages.length > 0) {
    const messagesBySession = messages.reduce((acc, msg) => {
      if (!acc[msg.session_id]) {
        acc[msg.session_id] = [];
      }
      acc[msg.session_id].push(msg);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('📊 Messages per session:');
    Object.entries(messagesBySession).forEach(([sessionId, msgs]) => {
      const session = sessions?.find(s => s.id === sessionId);
      console.log(`  ${session?.title || 'Unknown'} (${sessionId.substring(0, 8)}...): ${msgs.length} messages`);
    });
  }

  console.log('');
  console.log('=' .repeat(60));
  console.log('SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Chat Sessions: ${sessionCount}`);
  console.log(`Total Messages: ${messageCount}`);
  console.log('');
}

checkChatCount().catch(console.error);
