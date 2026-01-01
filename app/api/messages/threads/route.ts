import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';
import type { ThreadListItem, GetThreadsResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * Athlete Messages - Threads API
 *
 * GET /api/messages/threads - Get all conversation threads for athlete
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

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const athleteId = await getAuthenticatedUserId(request);

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all threads where this athlete is a participant
    const { data: threads, error } = await supabase
      .from('agency_message_threads')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching threads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch threads' },
        { status: 500 }
      );
    }

    if (!threads || threads.length === 0) {
      return NextResponse.json({
        threads: [],
        total_unread: 0,
      } satisfies GetThreadsResponse);
    }

    // Get unique agency IDs to fetch their info
    const agencyIds = Array.from(new Set(threads.map(t => t.agency_id)));

    // Fetch agency info from users table
    // Note: column is profile_photo (not profile_photo_url)
    const { data: agencies } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_photo, avatar_url, company_name')
      .in('id', agencyIds);

    // Create agency lookup map
    const agencyMap = new Map(agencies?.map(a => [a.id, a]) || []);

    // Count unread messages per thread
    const { data: unreadCounts } = await supabase
      .from('agency_athlete_messages')
      .select('thread_id')
      .in('thread_id', threads.map(t => t.id))
      .neq('sender_id', athleteId)
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

    // Enrich threads with agency info
    const enrichedThreads: ThreadListItem[] = threads.map(thread => {
      const agency = agencyMap.get(thread.agency_id);
      const unreadCount = unreadMap.get(thread.id) || 0;

      return {
        id: thread.id,
        agency_id: thread.agency_id,
        athlete_id: thread.athlete_id,
        status: thread.status,
        last_message: thread.last_message,
        created_at: thread.created_at,
        updated_at: thread.updated_at,
        participant: {
          id: thread.agency_id,
          display_name: agency?.company_name ||
            (agency ? `${agency.first_name} ${agency.last_name}`.trim() : 'Unknown Agency'),
          avatar_url: agency?.avatar_url || agency?.profile_photo || null,
          role: 'agency' as const,
          company_name: agency?.company_name,
        },
        unread_count: unreadCount,
        is_own_last_message: thread.status !== 'sent', // Inverse of agency perspective
      };
    });

    return NextResponse.json({
      threads: enrichedThreads,
      total_unread: totalUnread,
    } satisfies GetThreadsResponse);

  } catch (error) {
    console.error('Athlete Threads API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
