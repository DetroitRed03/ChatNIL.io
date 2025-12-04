/**
 * Check for Chat Issues
 *
 * This script checks for:
 * 1. Duplicate chats
 * 2. Empty chats (no messages)
 * 3. Chat sync issues between localStorage and database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkChatIssues() {
  console.log('🔍 Checking for chat issues...\n');

  try {
    // 1. Check all chats and their message counts
    console.log('📊 Fetching all chat sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError);
      return;
    }

    console.log(`✅ Found ${sessions?.length || 0} chat sessions\n`);

    // Group by user
    const sessionsByUser: Record<string, any[]> = {};
    sessions?.forEach(session => {
      if (!sessionsByUser[session.user_id]) {
        sessionsByUser[session.user_id] = [];
      }
      sessionsByUser[session.user_id].push(session);
    });

    console.log(`👥 Users with chats: ${Object.keys(sessionsByUser).length}\n`);

    // Check each user's chats
    for (const [userId, userSessions] of Object.entries(sessionsByUser)) {
      console.log(`\n👤 User: ${userId}`);
      console.log(`📁 Total chats: ${userSessions.length}`);

      let emptyChatCount = 0;
      let duplicateTitles: Record<string, number> = {};

      for (const session of userSessions) {
        // Check message count
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('session_id', session.id);

        const messageCount = messages?.length || 0;

        if (messageCount === 0) {
          emptyChatCount++;
          console.log(`   ⚠️  Empty chat: "${session.title}" (ID: ${session.id.slice(0, 8)}...)`);
        }

        // Check for duplicate titles
        if (duplicateTitles[session.title]) {
          duplicateTitles[session.title]++;
        } else {
          duplicateTitles[session.title] = 1;
        }
      }

      // Report duplicates
      const duplicates = Object.entries(duplicateTitles).filter(([_, count]) => count > 1);
      if (duplicates.length > 0) {
        console.log(`\n   🔄 Duplicate chat titles found:`);
        duplicates.forEach(([title, count]) => {
          console.log(`      - "${title}": ${count} instances`);
        });
      }

      if (emptyChatCount > 0) {
        console.log(`\n   📊 Summary: ${emptyChatCount} empty chat(s) out of ${userSessions.length} total`);
      }
    }

    // 3. Check for orphaned messages (messages without a session)
    console.log('\n\n🔍 Checking for orphaned messages...');
    const { data: orphanedMessages, error: orphanedError } = await supabase
      .from('chat_messages')
      .select('id, session_id')
      .is('session_id', null);

    if (orphanedMessages && orphanedMessages.length > 0) {
      console.log(`   ⚠️  Found ${orphanedMessages.length} orphaned messages`);
    } else {
      console.log(`   ✅ No orphaned messages found`);
    }

    console.log('\n\n✨ Chat issues check complete!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkChatIssues();
