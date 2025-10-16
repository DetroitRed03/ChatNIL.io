import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatSessionInsert = Database['public']['Tables']['chat_sessions']['Insert'];

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's chat sessions
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Chat sessions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create new chat session
    const sessionData: ChatSessionInsert = {
      user_id: session.user.id,
      title: title
    };

    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
    }

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Chat sessions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}