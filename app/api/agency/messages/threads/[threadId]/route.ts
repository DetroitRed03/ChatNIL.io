import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Agency Messages - Thread Messages API
 *
 * GET /api/agency/messages/threads/[threadId] - Get all messages in a thread
 * POST /api/agency/messages/threads/[threadId] - Send a message in the thread
 */

/**
 * Helper to get authenticated agency user ID with multiple fallbacks
 */
async function getAuthenticatedAgencyId(request: NextRequest, supabase: ReturnType<typeof createServiceRoleClient>): Promise<string | null> {
  // Method 1: Try cookie-based auth (SSR client)
  try {
    const authClient = await createClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch (e) {
    console.log('Cookie auth failed, trying fallback...');
  }

  // Method 2: Check for X-User-ID header (sent by frontend)
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) {
    return userIdHeader;
  }

  // Method 3: Check for Authorization header with Bearer token
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      return user.id;
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const supabase = createServiceRoleClient();
    const resolvedParams = await params;
    const threadId = resolvedParams.threadId;

    // Get authenticated agency user ID
    const agencyId = await getAuthenticatedAgencyId(request, supabase);

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get all messages in this thread
    // Note: We fetch messages without the join first, then enrich with sender info
    const { data: messages, error } = await supabase
      .from('agency_athlete_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Mark all messages from the athlete as read
    if (messages && messages.length > 0) {
      const athleteUserId = messages[0].athlete_user_id;

      await supabase
        .from('agency_athlete_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('sender_id', athleteUserId)
        .eq('is_read', false);
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
      total: messages?.length || 0,
    });

  } catch (error) {
    console.error('Thread Messages API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const supabase = createServiceRoleClient();
    const resolvedParams = await params;
    const threadId = resolvedParams.threadId;
    const body = await request.json();
    const { message_text, attachments } = body;

    if (!message_text) {
      return NextResponse.json(
        { error: 'message_text is required' },
        { status: 400 }
      );
    }

    // Get authenticated agency user ID
    const agencyId = await getAuthenticatedAgencyId(request, supabase);

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get the athlete_id from the thread itself (not from messages, as thread may be new)
    const { data: thread, error: threadError } = await supabase
      .from('agency_message_threads')
      .select('athlete_id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const athleteUserId = thread.athlete_id;

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('agency_athlete_messages')
      .insert({
        agency_user_id: agencyId,
        athlete_user_id: athleteUserId,
        thread_id: threadId,
        sender_id: agencyId,
        message_text: message_text,
        attachments: attachments || null,
        is_read: false,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error sending message:', insertError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
    }, { status: 201 });

  } catch (error) {
    console.error('Send Message Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
