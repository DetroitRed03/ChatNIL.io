import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

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
    const { userId, session_id, content, role } = body;

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

    // Create new chat message
    const messageData: ChatMessageInsert = {
      session_id,
      user_id: userId,
      content,
      role
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
