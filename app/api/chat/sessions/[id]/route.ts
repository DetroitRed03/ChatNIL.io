import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types';

export const dynamic = 'force-dynamic';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatSessionUpdate = Database['public']['Tables']['chat_sessions']['Update'];

// Use service role client to bypass RLS for DELETE operations
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

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
  const supabaseAdmin = getSupabaseAdmin();
  try {
    console.log('🔄 PUT /api/chat/sessions/[id] - Start');
    console.log('📋 Chat ID:', params.id);

    const cookieStore = cookies();
    console.log('🍪 Cookies available:', cookieStore.getAll().length);

    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get the current user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    console.log('👤 Auth check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      authError: authError?.message
    });

    if (authError || !session?.user) {
      console.error('❌ PUT Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ PUT Auth successful for user:', session.user.id);

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
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Get userId from query params (passed by client)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('🗑️ DELETE /api/chat/sessions/[id] - Chat ID:', params.id, 'User ID:', userId);

    // Verify the session belongs to the user before deleting
    const { data: chatSession, error: sessionCheckError } = await supabaseAdmin
      .from('chat_sessions' as any)
      .select('id, user_id')
      .eq('id', params.id)
      .single() as { data: { id: string; user_id: string } | null; error: any };

    if (sessionCheckError || !chatSession) {
      console.error('Chat session not found:', sessionCheckError);
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    if (chatSession.user_id !== userId) {
      console.error('Unauthorized delete attempt:', { sessionUserId: chatSession.user_id, requestUserId: userId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete chat messages first (CASCADE should handle this, but be explicit)
    const { error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('session_id', params.id)
      .eq('user_id', userId);

    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError);
      return NextResponse.json({ error: 'Failed to delete chat messages' }, { status: 500 });
    }

    console.log('✅ Deleted messages for session:', params.id);

    // Delete the chat session
    const { error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);

    if (sessionError) {
      console.error('Error deleting chat session:', sessionError);
      return NextResponse.json({ error: 'Failed to delete chat session' }, { status: 500 });
    }

    console.log('✅ Deleted chat session:', params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat session DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}