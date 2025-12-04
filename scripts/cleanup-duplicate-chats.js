const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Supabase URL:', supabaseUrl);
console.log('🔐 Service role key configured:', !!supabaseServiceRoleKey);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function cleanupDuplicateChats() {
  const userId = '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1';

  console.log('\n📊 Step 1: Count current chats...\n');

  const { data: sessions, error: countError } = await supabase
    .from('chat_sessions')
    .select('id, title, created_at')
    .eq('user_id', userId);

  if (countError) {
    console.error('❌ Error counting sessions:', countError.message);
    return;
  }

  console.log(`Found ${sessions.length} chat sessions\n`);

  if (sessions.length === 0) {
    console.log('✅ No chats to clean up!');
    return;
  }

  // Show first few for reference
  console.log('Sample sessions:');
  sessions.slice(0, 5).forEach(s => {
    console.log(`  - ${s.title} (${s.created_at})`);
  });

  console.log('\n🗑️ Step 2: Delete ALL chat messages...\n');

  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', userId);

  if (messagesError) {
    console.error('❌ Error deleting messages:', messagesError.message);
    return;
  }

  console.log('✅ Deleted all chat messages\n');

  console.log('🗑️ Step 3: Delete ALL chat sessions...\n');

  const { error: sessionsError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('user_id', userId);

  if (sessionsError) {
    console.error('❌ Error deleting sessions:', sessionsError.message);
    return;
  }

  console.log('✅ Deleted all chat sessions\n');

  console.log('🔍 Step 4: Verify cleanup...\n');

  const { data: remainingSessions } = await supabase
    .from('chat_sessions')
    .select('count')
    .eq('user_id', userId);

  const { data: remainingMessages } = await supabase
    .from('chat_messages')
    .select('count')
    .eq('user_id', userId);

  console.log(`Remaining sessions: ${remainingSessions?.length || 0}`);
  console.log(`Remaining messages: ${remainingMessages?.length || 0}`);

  console.log('\n✅ Cleanup complete!\n');
  console.log('Next steps:');
  console.log('1. Clear browser localStorage: localStorage.clear()');
  console.log('2. Refresh the page');
  console.log('3. Send a test message');
  console.log('4. Refresh again - message should persist without duplicates');
}

cleanupDuplicateChats();
