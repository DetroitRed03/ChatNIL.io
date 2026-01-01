import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Get Total Unread Message Count for Navigation Badge
 * GET /api/agency/messages/unread-count
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
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all threads for this agency
    const { data: threads } = await supabase
      .from('agency_message_threads')
      .select('id')
      .eq('agency_id', userId);

    if (!threads || threads.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    // Count unread messages across all threads
    const { count, error } = await supabase
      .from('agency_athlete_messages')
      .select('id', { count: 'exact', head: true })
      .in('thread_id', threads.map(t => t.id))
      .neq('sender_id', userId)
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
