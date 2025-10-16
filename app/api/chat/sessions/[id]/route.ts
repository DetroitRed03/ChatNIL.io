import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatSessionUpdate = Database['public']['Tables']['chat_sessions']['Update'];

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

    // Fetch specific chat session
    const { data: chatSession, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching chat session:', error);
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error('Chat session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const { title } = body;

    // Update chat session
    const updateData: ChatSessionUpdate = {
      title: title,
      updated_at: new Date().toISOString()
    };

    const { data: updatedSession, error } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat session:', error);
      return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 });
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Chat session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Delete chat session and related messages
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', params.id)
      .eq('user_id', session.user.id);

    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError);
      return NextResponse.json({ error: 'Failed to delete chat messages' }, { status: 500 });
    }

    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (sessionError) {
      console.error('Error deleting chat session:', sessionError);
      return NextResponse.json({ error: 'Failed to delete chat session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}