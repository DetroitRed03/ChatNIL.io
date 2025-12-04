/**
 * Cleanup Duplicate Chats
 *
 * This script removes duplicate chat sessions, keeping only the most recent one
 * for each unique title per user.
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

async function cleanupDuplicateChats() {
  console.log('🧹 Starting duplicate chat cleanup...\n');

  try {
    // 1. Fetch all chat sessions
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

    let totalDeleted = 0;

    // Process each user's chats
    for (const [userId, userSessions] of Object.entries(sessionsByUser)) {
      console.log(`\n👤 Processing user: ${userId.slice(0, 8)}...`);

      // Group sessions by title
      const sessionsByTitle: Record<string, any[]> = {};
      userSessions.forEach(session => {
        if (!sessionsByTitle[session.title]) {
          sessionsByTitle[session.title] = [];
        }
        sessionsByTitle[session.title].push(session);
      });

      // Find duplicates
      for (const [title, titleSessions] of Object.entries(sessionsByTitle)) {
        if (titleSessions.length > 1) {
          console.log(`\n   🔄 Found ${titleSessions.length} chats with title: "${title}"`);

          // Sort by created_at (most recent first) and keep the first one
          const sorted = titleSessions.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          const toKeep = sorted[0];
          const toDelete = sorted.slice(1);

          console.log(`      ✅ Keeping: ${toKeep.id.slice(0, 8)}... (${new Date(toKeep.created_at).toLocaleString()})`);

          // Delete the duplicates
          for (const session of toDelete) {
            console.log(`      🗑️  Deleting: ${session.id.slice(0, 8)}... (${new Date(session.created_at).toLocaleString()})`);

            // First, delete all messages for this session
            const { error: deleteMessagesError } = await supabase
              .from('chat_messages')
              .delete()
              .eq('session_id', session.id);

            if (deleteMessagesError) {
              console.error(`         ❌ Error deleting messages:`, deleteMessagesError);
              continue;
            }

            // Then delete the session
            const { error: deleteSessionError } = await supabase
              .from('chat_sessions')
              .delete()
              .eq('id', session.id);

            if (deleteSessionError) {
              console.error(`         ❌ Error deleting session:`, deleteSessionError);
            } else {
              totalDeleted++;
              console.log(`         ✅ Deleted successfully`);
            }
          }
        }
      }
    }

    console.log(`\n\n✨ Cleanup complete!`);
    console.log(`📊 Total chats deleted: ${totalDeleted}\n`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

cleanupDuplicateChats();
