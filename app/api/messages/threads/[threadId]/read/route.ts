import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';
import type { MarkReadResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * Mark Thread Messages as Read (Athlete)
 * POST /api/messages/threads/[threadId]/read
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const supabase = createServiceRoleClient();
    const resolvedParams = await params;
    const threadId = resolvedParams.threadId;

    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark all messages from the agency as read
    const { data: updatedMessages, error } = await supabase
      .from('agency_athlete_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('thread_id', threadId)
      .neq('sender_id', userId)
      .eq('is_read', false)
      .select('id');

    if (error) {
      console.error('Error marking messages as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark messages as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages_marked: updatedMessages?.length || 0,
    } satisfies MarkReadResponse);

  } catch (error) {
    console.error('Mark Read API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
