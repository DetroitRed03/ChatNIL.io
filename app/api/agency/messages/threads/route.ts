import { NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';
import type { ThreadListItem, GetThreadsResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * Agency Messages - Threads API
 *
 * Uses the agency_message_threads table which has:
 * - id, agency_id, athlete_id, status, last_message, created_at, updated_at
 *
 * GET /api/agency/messages/threads - Get all conversation threads
 * POST /api/agency/messages/threads - Create a new thread (start conversation)
 */

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();

    // Try multiple auth methods for compatibility
    let agencyId: string | null = null;

    // Method 1: Try cookie-based auth (SSR client)
    try {
      const authClient = await createClient();
      const { data: { user }, error } = await authClient.auth.getUser();
      if (user && !error) {
        agencyId = user.id;
      }
    } catch (e) {
      console.log('Cookie auth failed, trying fallback...');
    }

    // Method 2: Check for X-User-ID header (sent by frontend)
    if (!agencyId) {
      const userIdHeader = request.headers.get('X-User-ID');
      if (userIdHeader) {
        agencyId = userIdHeader;
      }
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get all threads for this agency from agency_message_threads table
    const { data: threads, error } = await supabase
      .from('agency_message_threads')
      .select('*')
      .eq('agency_id', agencyId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch threads' },
        { status: 500 }
      );
    }

    // Handle empty threads - return empty array
    if (!threads || threads.length === 0) {
      return NextResponse.json({
        threads: [],
        total_unread: 0,
      } satisfies GetThreadsResponse);
    }

    // Get unique athlete IDs to fetch their info
    const athleteIds = Array.from(new Set(threads.map(t => t.athlete_id)));

    // Fetch athlete info from users table
    // Note: column is profile_photo (not profile_photo_url), and school_name (not school)
    const { data: athletes } = await supabase
      .from('users')
      .select('id, first_name, last_name, full_name, profile_photo, avatar_url, sport, school_name')
      .in('id', athleteIds);

    // Create athlete lookup map
    const athleteMap = new Map(athletes?.map(a => [a.id, a]) || []);

    // Count unread messages per thread
    const { data: unreadCounts } = await supabase
      .from('agency_athlete_messages')
      .select('thread_id')
      .in('thread_id', threads.map(t => t.id))
      .neq('sender_id', agencyId)
      .eq('is_read', false);

    // Create unread count map
    const unreadMap = new Map<string, number>();
    unreadCounts?.forEach(msg => {
      const count = unreadMap.get(msg.thread_id) || 0;
      unreadMap.set(msg.thread_id, count + 1);
    });

    // Calculate total unread
    let totalUnread = 0;
    unreadMap.forEach(count => { totalUnread += count; });

    // Enrich threads with athlete info and format for frontend
    const enrichedThreads: ThreadListItem[] = threads.map(thread => {
      const athlete = athleteMap.get(thread.athlete_id);
      const unreadCount = unreadMap.get(thread.id) || 0;

      return {
        id: thread.id,
        agency_id: thread.agency_id,
        athlete_id: thread.athlete_id,
        status: thread.status,
        last_message: thread.last_message,
        created_at: thread.created_at,
        updated_at: thread.updated_at,
        // Display participant info
        participant: {
          id: thread.athlete_id,
          display_name: athlete
            ? (athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Unknown Athlete')
            : 'Unknown Athlete',
          avatar_url: athlete?.avatar_url || athlete?.profile_photo || null,
          role: 'athlete' as const,
          sport: athlete?.sport || undefined,
          school: athlete?.school_name || undefined,
        },
        unread_count: unreadCount,
        is_own_last_message: thread.status === 'sent',
      };
    });

    return NextResponse.json({
      threads: enrichedThreads,
      total_unread: totalUnread,
    } satisfies GetThreadsResponse);

  } catch (error) {
    console.error('Threads API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();
    const { athlete_user_id, message_text } = body;

    // athlete_user_id is always required, message_text is optional (for just creating/getting thread)
    if (!athlete_user_id) {
      return NextResponse.json(
        { error: 'athlete_user_id is required' },
        { status: 400 }
      );
    }

    // Try multiple auth methods for compatibility
    let agencyId: string | null = null;

    // Method 1: Try cookie-based auth (SSR client)
    try {
      const authClient = await createClient();
      const { data: { user }, error } = await authClient.auth.getUser();
      if (user && !error) {
        agencyId = user.id;
      }
    } catch (e) {
      console.log('Cookie auth failed, trying fallback...');
    }

    // Method 2: Check for X-User-ID header (sent by frontend)
    if (!agencyId) {
      const userIdHeader = request.headers.get('X-User-ID');
      if (userIdHeader) {
        agencyId = userIdHeader;
      }
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Check if thread already exists between this agency and athlete
    const { data: existingThread } = await supabase
      .from('agency_message_threads')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('athlete_id', athlete_user_id)
      .single();

    let threadId: string;
    let isNewThread = false;

    if (existingThread) {
      // Use existing thread
      threadId = existingThread.id;
    } else {
      // Create new thread
      const { data: newThread, error: threadError } = await supabase
        .from('agency_message_threads')
        .insert({
          agency_id: agencyId,
          athlete_id: athlete_user_id,
          status: 'active',
        })
        .select()
        .single();

      if (threadError || !newThread) {
        console.error('Error creating thread:', threadError);
        return NextResponse.json(
          { error: 'Failed to create thread' },
          { status: 500 }
        );
      }

      threadId = newThread.id;
      isNewThread = true;
    }

    // If message_text provided, insert the message
    let newMessage = null;
    if (message_text) {
      const { data: msgData, error: messageError } = await supabase
        .from('agency_athlete_messages')
        .insert({
          thread_id: threadId,
          agency_user_id: agencyId,
          athlete_user_id: athlete_user_id,
          sender_id: agencyId,
          message_text: message_text,
          is_read: false,
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error creating message:', messageError);
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        );
      }

      newMessage = msgData;

      // Update thread with last message
      await supabase
        .from('agency_message_threads')
        .update({
          last_message: message_text,
          status: 'sent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId);
    }

    return NextResponse.json({
      success: true,
      thread: { id: threadId },
      thread_id: threadId,
      message_id: newMessage?.id || null,
      is_new_thread: isNewThread,
    }, { status: 201 });

  } catch (error) {
    console.error('Create Thread Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
