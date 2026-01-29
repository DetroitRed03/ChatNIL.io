import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent/view-invite
 * Mark an invite as viewed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update invite status to 'viewed' only if it's still 'pending'
    const { error: updateError } = await supabase
      .from('parent_consent_invites')
      .update({
        status: 'viewed',
        viewed_at: new Date().toISOString(),
      })
      .eq('invite_token', token)
      .eq('status', 'pending');

    if (updateError) {
      console.error('Error marking invite as viewed:', updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
