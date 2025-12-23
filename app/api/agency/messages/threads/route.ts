import { NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';

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
        success: true,
        threads: [],
        total: 0,
      });
    }

    // Get unique athlete IDs to fetch their info
    const athleteIds = Array.from(new Set(threads.map(t => t.athlete_id)));

    // Fetch athlete info from users table
    const { data: athletes } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_photo_url')
      .in('id', athleteIds);

    // Create athlete lookup map
    const athleteMap = new Map(athletes?.map(a => [a.id, a]) || []);

    // Enrich threads with athlete info
    const enrichedThreads = threads.map(thread => {
      const athlete = athleteMap.get(thread.athlete_id);
      return {
        thread_id: thread.id,
        athlete_user_id: thread.athlete_id,
        athlete: athlete || { id: thread.athlete_id, first_name: 'Unknown', last_name: 'Athlete' },
        latest_message: thread.last_message,
        latest_message_time: thread.updated_at,
        status: thread.status,
        unread_count: thread.status === 'unread' ? 1 : 0,
      };
    });

    return NextResponse.json({
      success: true,
      threads: enrichedThreads,
      total: enrichedThreads.length,
    });

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

    if (!athlete_user_id || !message_text) {
      return NextResponse.json(
        { error: 'athlete_user_id and message_text are required' },
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

    if (existingThread) {
      // Update existing thread with new message
      threadId = existingThread.id;
      await supabase
        .from('agency_message_threads')
        .update({
          last_message: message_text,
          status: 'sent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId);
    } else {
      // Create new thread
      const { data: newThread, error: threadError } = await supabase
        .from('agency_message_threads')
        .insert({
          agency_id: agencyId,
          athlete_id: athlete_user_id,
          last_message: message_text,
          status: 'sent',
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
    }

    return NextResponse.json({
      success: true,
      thread_id: threadId,
      message: 'Message sent successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create Thread Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
