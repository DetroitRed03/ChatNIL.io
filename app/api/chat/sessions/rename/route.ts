import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Use service role client to bypass RLS (same pattern as /api/chat/sessions)
// Note: Using untyped client because chat_sessions isn't in Database types
function getSupabaseAdmin() {
  return createClient(
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

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  console.log('🔄 POST /api/chat/sessions/rename - Start');

  try {
    const body = await request.json();
    const { chatId, title, userId } = body;

    console.log('📝 Rename request:', { chatId, title, userId });

    if (!chatId || !title || !userId) {
      return NextResponse.json({ error: 'Missing chatId, title, or userId' }, { status: 400 });
    }

    // Update chat session using service role (bypasses RLS)
    const { data: updatedSession, error } = await supabaseAdmin
      .from('chat_sessions')
      .update({
        title: title,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating chat session:', error);
      return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 });
    }

    console.log('✅ Successfully updated chat title');

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error: any) {
    console.error('💥 Rename API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
