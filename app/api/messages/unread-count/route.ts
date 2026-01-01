import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Get Total Unread Message Count for Athlete Navigation Badge
 * GET /api/messages/unread-count
 */

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    const authClient = await createClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch {
    // Continue to fallback
  }

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

    // Get all threads for this athlete
    const { data: threads } = await supabase
      .from('agency_message_threads')
      .select('id')
      .eq('athlete_id', athleteId);

    if (!threads || threads.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    // Count unread messages (from agencies) across all threads
    const { count, error } = await supabase
      .from('agency_athlete_messages')
      .select('id', { count: 'exact', head: true })
      .in('thread_id', threads.map(t => t.id))
      .neq('sender_id', athleteId)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread messages:', error);
      return NextResponse.json(
        { error: 'Failed to count unread messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 });

  } catch (error) {
    console.error('Unread Count API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
