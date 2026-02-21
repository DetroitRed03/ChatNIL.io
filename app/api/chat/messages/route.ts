import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

export const dynamic = 'force-dynamic';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

// Use service role client to bypass RLS
function getSupabaseAdmin() {
  return createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
    }
  }
);
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('✅ GET /api/chat/messages - User ID:', userId, 'Session ID:', sessionId);

    // Fetch messages for user (optionally filtered by session)
    let query = supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching chat messages:', error);
      return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 });
    }

    console.log(`✅ Found ${messages?.length || 0} messages`);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { userId, session_id, content, role, sources, metadata } = body;

    if (!userId || !session_id || !content || !role) {
      return NextResponse.json(
        { error: 'userId, session_id, content, and role are required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const { data: chatSession, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, user_id')
      .eq('id', session_id)
      .single() as { data: { id: string; user_id: string } | null; error: any };

    if (sessionError || !chatSession) {
      console.error('Chat session not found:', sessionError);
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    if (chatSession.user_id !== userId) {
      console.error('Unauthorized access to session:', session_id);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create new chat message with optional sources in metadata
    // Support both direct sources field and metadata object
    const messageMetadata = metadata || (sources ? { sources } : null);
    const messageData: ChatMessageInsert = {
      session_id,
      user_id: userId,
      content,
      role,
      metadata: messageMetadata
    };

    const { data: newMessage, error } = await supabaseAdmin
      .from('chat_messages' as any)
      .insert(messageData as any)
      .select()
      .single() as { data: any; error: any };

    if (error) {
      console.error('Error creating chat message:', error);
      return NextResponse.json({ error: 'Failed to create chat message' }, { status: 500 });
    }

    console.log('✅ Created new chat message:', newMessage.id, 'for session:', session_id);
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Chat messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update message metadata (e.g., add sources after streaming)
// Supports two modes:
// 1. By messageId (UUID) - direct update if we have the database ID
// 2. By sessionId - finds the most recent assistant message in the session
export async function PATCH(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const body = await request.json();
    const { userId, messageId, sessionId, sources } = body;

    console.log('📥 PATCH /api/chat/messages - Received:', {
      userId: userId?.substring(0, 8) + '...',
      messageId: messageId?.substring(0, 20) + '...',
      sessionId: sessionId?.substring(0, 20) + '...',
      hasSources: !!sources
    });

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!messageId && !sessionId) {
      return NextResponse.json(
        { error: 'Either messageId or sessionId is required' },
        { status: 400 }
      );
    }

    let existingMessage: any = null;

    if (messageId) {
      // Try to find by messageId first (works if it's a UUID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId);

      if (isUUID) {
        const { data, error } = await supabaseAdmin
          .from('chat_messages')
          .select('id, user_id, metadata')
          .eq('id', messageId)
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          existingMessage = data;
        }
      }
    }

    // If not found by messageId, try by sessionId (find most recent assistant message)
    if (!existingMessage && sessionId) {
      const isSessionUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);

      if (isSessionUUID) {
        const { data, error } = await supabaseAdmin
          .from('chat_messages')
          .select('id, user_id, metadata')
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .eq('role', 'assistant')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          existingMessage = data;
          console.log('📍 Found message by sessionId:', data.id);
        }
      }
    }

    if (!existingMessage) {
      console.error('Message not found - messageId:', messageId, 'sessionId:', sessionId);
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Merge sources into existing metadata
    const updatedMetadata = {
      ...(existingMessage.metadata || {}),
      sources: sources || undefined
    };

    const { data: updatedMessage, error } = await supabaseAdmin
      .from('chat_messages')
      .update({ metadata: updatedMetadata })
      .eq('id', existingMessage.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    console.log('✅ Updated message metadata:', existingMessage.id);
    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Chat messages PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
