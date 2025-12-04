/**
 * @deprecated This file is deprecated and should not be used.
 *
 * DEPRECATION NOTICE:
 * This ChatPersistenceService makes direct client-side database calls using createBrowserClient,
 * which doesn't work properly with Supabase SSR authentication. This results in 401 unauthorized
 * errors because the client-side Supabase client cannot access the auth session.
 *
 * REPLACEMENT:
 * All chat persistence is now handled through API routes:
 * - GET  /api/chat/sessions - Load user's chat sessions
 * - POST /api/chat/sessions - Create/update chat sessions
 * - POST /api/chat/messages - Add messages to chats
 *
 * The lib/chat-history-store.ts now uses these API routes directly via fetch() calls.
 * The hooks/useChatSync.ts hook manages automatic syncing between localStorage and database.
 *
 * DO NOT import or use this file in new code.
 * This file is kept only for reference and will be removed in a future update.
 */

import { createClient } from '@/lib/supabase-client';
import { Database } from '@/types';
import { Chat, Message } from '@/lib/chat-history-store';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

/**
 * @deprecated Use API routes instead (see file header for details)
 */
export class ChatPersistenceService {
  // Create client lazily to ensure it picks up current auth session
  private getClient() {
    return createClient();
  }

  // Convert database chat session to local Chat format
  private dbSessionToChat(session: any, messages: ChatMessage[]): Chat {
    const convertedMessages: Message[] = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as 'user' | 'assistant',
      timestamp: new Date(msg.created_at),
      attachments: msg.attachments || undefined
    }));

    return {
      id: session.id,
      title: session.title,
      messages: convertedMessages,
      roleContext: (session.role_context || 'athlete') as 'athlete' | 'parent' | 'coach',
      isPinned: session.is_pinned || false,
      isArchived: session.is_archived || false,
      createdAt: new Date(session.created_at),
      updatedAt: new Date(session.updated_at),
      draft: session.draft || ''
    };
  }

  // Convert local Chat to database format
  private chatToDbSession(chat: Chat): { session: any; messages: any[] } {
    const session = {
      id: chat.id,
      title: chat.title,
      role_context: chat.roleContext,
      is_pinned: chat.isPinned,
      is_archived: chat.isArchived,
      draft: chat.draft || '',
      created_at: chat.createdAt.toISOString(),
      updated_at: chat.updatedAt.toISOString()
    };

    const messages = chat.messages.map(msg => ({
      id: msg.id,
      session_id: chat.id,
      content: msg.content,
      role: msg.role,
      attachments: msg.attachments || null,
      created_at: msg.timestamp.toISOString()
    }));

    return { session, messages };
  }

  // Sync local chats to database
  async syncToDatabase(chats: Chat[], userId: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      // Get existing sessions from database
      const { data: existingSessions, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('id, updated_at')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('Error fetching existing sessions:', fetchError);
        return false;
      }

      const existingSessionIds = new Set(existingSessions?.map(s => s.id) || []);

      for (const chat of chats) {
        const { session, messages } = this.chatToDbSession(chat);

        if (existingSessionIds.has(chat.id)) {
          // Update existing session
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({
              title: session.title,
              role_context: session.role_context,
              is_pinned: session.is_pinned,
              is_archived: session.is_archived,
              draft: session.draft,
              updated_at: session.updated_at
            })
            .eq('id', chat.id)
            .eq('user_id', userId);

          if (updateError) {
            console.error('Error updating session:', updateError);
            continue;
          }
        } else {
          // Create new session
          const { error: insertError } = await supabase
            .from('chat_sessions')
            .insert({
              id: session.id,
              user_id: userId,
              title: session.title,
              role_context: session.role_context,
              is_pinned: session.is_pinned,
              is_archived: session.is_archived,
              draft: session.draft,
              created_at: session.created_at,
              updated_at: session.updated_at
            });

          if (insertError) {
            console.error('Error creating session:', insertError);
            continue;
          }
        }

        // Sync messages for this session
        await this.syncMessagesForSession(chat.id, messages, userId);
      }

      return true;
    } catch (error) {
      console.error('Error syncing to database:', error);
      return false;
    }
  }

  // Sync messages for a specific session
  private async syncMessagesForSession(sessionId: string, messages: any[], userId: string) {
    try {
      const supabase = this.getClient();
      // Get existing messages
      const { data: existingMessages, error: fetchError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      if (fetchError) {
        console.error('Error fetching existing messages:', fetchError);
        return;
      }

      const existingMessageIds = new Set(existingMessages?.map(m => m.id) || []);

      // Insert new messages
      const newMessages = messages.filter(msg => !existingMessageIds.has(msg.id));

      if (newMessages.length > 0) {
        const messagesToInsert = newMessages.map(msg => ({
          ...msg,
          user_id: userId
        }));

        const { error: insertError } = await supabase
          .from('chat_messages')
          .insert(messagesToInsert);

        if (insertError) {
          console.error('Error inserting messages:', insertError);
        }
      }
    } catch (error) {
      console.error('Error syncing messages for session:', error);
    }
  }

  // Load chats from database
  async loadFromDatabase(userId: string): Promise<Chat[]> {
    try {
      const supabase = this.getClient();
      // Fetch sessions
      const { data: sessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (sessionError) {
        console.error('Error loading sessions:', sessionError);
        return [];
      }

      if (!sessions || sessions.length === 0) {
        return [];
      }

      // Fetch all messages for these sessions
      const sessionIds = sessions.map(s => s.id);
      const { data: messages, error: messageError } = await supabase
        .from('chat_messages')
        .select('*')
        .in('session_id', sessionIds)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (messageError) {
        console.error('Error loading messages:', messageError);
        return [];
      }

      // Group messages by session
      const messagesBySession = (messages || []).reduce((acc, msg) => {
        if (!acc[msg.session_id]) {
          acc[msg.session_id] = [];
        }
        acc[msg.session_id].push(msg);
        return acc;
      }, {} as Record<string, ChatMessage[]>);

      // Convert to Chat format
      const chats = sessions.map(session =>
        this.dbSessionToChat(session, messagesBySession[session.id] || [])
      );

      return chats;
    } catch (error) {
      console.error('Error loading from database:', error);
      return [];
    }
  }

  // Create a new chat session in database
  async createSession(chat: Chat, userId: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { session, messages } = this.chatToDbSession(chat);

      // Create session
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          id: session.id,
          user_id: userId,
          title: session.title,
          role_context: session.role_context,
          is_pinned: session.is_pinned,
          is_archived: session.is_archived,
          draft: session.draft,
          created_at: session.created_at,
          updated_at: session.updated_at
        });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return false;
      }

      // Create initial messages if any
      if (messages.length > 0) {
        const messagesToInsert = messages.map(msg => ({
          ...msg,
          user_id: userId
        }));

        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert(messagesToInsert);

        if (messageError) {
          console.error('Error creating initial messages:', messageError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error creating session:', error);
      return false;
    }
  }

  // Add a message to existing session
  async addMessage(sessionId: string, message: Message, userId: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          session_id: sessionId,
          user_id: userId,
          content: message.content,
          role: message.role,
          attachments: message.attachments || null,
          created_at: message.timestamp.toISOString()
        });

      if (error) {
        console.error('Error adding message:', error);
        return false;
      }

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  // Delete a chat session
  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const supabase = this.getClient();
      // Delete messages first
      const { error: messageError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      if (messageError) {
        console.error('Error deleting messages:', messageError);
        return false;
      }

      // Delete session
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatPersistence = new ChatPersistenceService();