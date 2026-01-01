import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';
import type { GetMessagesResponse, SendMessageResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * Athlete Messages - Thread Messages API
 *
 * GET /api/messages/threads/[threadId] - Get all messages in a thread
 * POST /api/messages/threads/[threadId] - Send a message in the thread
 */

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Method 1: Try cookie-based auth
  try {
    const authClient = await createClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch {
    // Continue to fallback
  }

  // Method 2: Check for X-User-ID header
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) {
    return userIdHeader;
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

    const athleteId = await getAuthenticatedUserId(request);

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify athlete has access to this thread
    const { data: thread } = await supabase
      .from('agency_message_threads')
      .select('id')
      .eq('id', threadId)
      .eq('athlete_id', athleteId)
      .single();

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Get pagination params
    const url = new URL(request.url);
    const before = url.searchParams.get('before');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build query - fetch messages without join (column name issues)
    let query = supabase
      .from('agency_athlete_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .limit(limit + 1); // Fetch one extra to check if there are more

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Check if there are more messages
    const hasMore = messages && messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages || [];

    // Mark messages from agency as read
    const unreadIds = resultMessages
      .filter(m => m.sender_id !== athleteId && !m.is_read)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('agency_athlete_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);
    }

    return NextResponse.json({
      messages: resultMessages.reverse(), // Return in ascending order
      has_more: hasMore,
    } satisfies GetMessagesResponse);

  } catch (error) {
    console.error('Athlete Messages API Error:', error);
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

    const athleteId = await getAuthenticatedUserId(request);

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify athlete has access to this thread and get agency_id
    const { data: thread } = await supabase
      .from('agency_message_threads')
      .select('id, agency_id')
      .eq('id', threadId)
      .eq('athlete_id', athleteId)
      .single();

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('agency_athlete_messages')
      .insert({
        agency_user_id: thread.agency_id,
        athlete_user_id: athleteId,
        thread_id: threadId,
        sender_id: athleteId,
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

    // Update thread last_message
    await supabase
      .from('agency_message_threads')
      .update({
        last_message: message_text.substring(0, 100),
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    return NextResponse.json({
      message,
    } satisfies SendMessageResponse, { status: 201 });

  } catch (error) {
    console.error('Send Message Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
