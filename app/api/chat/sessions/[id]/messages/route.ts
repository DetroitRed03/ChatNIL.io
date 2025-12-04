import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this chat session
    const { data: chatSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (sessionError || !chatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // Fetch messages for this session
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', params.id)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this chat session
    const { data: chatSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (sessionError || !chatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    const body = await request.json();
    const { content, role } = body;

    if (!content || !role) {
      return NextResponse.json({ error: 'Content and role are required' }, { status: 400 });
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Role must be user or assistant' }, { status: 400 });
    }

    // Create new message
    const messageData: ChatMessageInsert = {
      session_id: params.id,
      user_id: session.user.id,
      content: content,
      role: role as 'user' | 'assistant'
    };

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chat message:', error);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Update session's updated_at timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    // Check for first message badge (only for user messages)
    if (role === 'user') {
      try {
        console.log('🎖️ Checking for first message badge...');
        const badgeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/badges/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            action: 'first_message'
          })
        });

        const badgeData = await badgeResponse.json();
        if (badgeData.success && badgeData.awardedBadge) {
          console.log('🎉 First message badge awarded:', badgeData.badge?.name);
        }
      } catch (badgeError) {
        console.warn('⚠️ Failed to check first message badge (non-critical):', badgeError);
      }
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Chat messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}