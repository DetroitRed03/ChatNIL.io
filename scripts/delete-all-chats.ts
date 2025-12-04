import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllChats() {
  console.log('🗑️  DELETING ALL CHAT DATA...\n');

  // Get test user
  const testUserEmail = 'sarah.johnson@test.com';
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', testUserEmail)
    .single();

  if (userError || !user) {
    console.error('❌ Could not find test user:', testUserEmail);
    return;
  }

  console.log('👤 User:', user.email);
  console.log('🆔 User ID:', user.id);
  console.log('');

  // Count before deletion
  const { count: sessionsBefore } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: messagesBefore } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  console.log('📊 BEFORE DELETION:');
  console.log(`   Chat Sessions: ${sessionsBefore}`);
  console.log(`   Messages: ${messagesBefore}`);
  console.log('');

  // Delete messages first (foreign key constraint)
  console.log('🗑️  Deleting all messages...');
  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', user.id);

  if (messagesError) {
    console.error('❌ Error deleting messages:', messagesError);
    return;
  }
  console.log('✅ All messages deleted');

  // Delete sessions
  console.log('🗑️  Deleting all chat sessions...');
  const { error: sessionsError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('user_id', user.id);

  if (sessionsError) {
    console.error('❌ Error deleting sessions:', sessionsError);
    return;
  }
  console.log('✅ All chat sessions deleted');
  console.log('');

  // Count after deletion
  const { count: sessionsAfter } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: messagesAfter } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  console.log('📊 AFTER DELETION:');
  console.log(`   Chat Sessions: ${sessionsAfter}`);
  console.log(`   Messages: ${messagesAfter}`);
  console.log('');

  console.log('=' .repeat(60));
  console.log('✅ CLEANUP COMPLETE!');
  console.log('=' .repeat(60));
  console.log(`Deleted ${sessionsBefore} chat sessions`);
  console.log(`Deleted ${messagesBefore} messages`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Clear browser localStorage');
  console.log('   2. Refresh the page');
  console.log('   3. Create new chats to test persistence');
}

deleteAllChats().catch(console.error);
