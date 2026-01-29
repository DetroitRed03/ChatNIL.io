import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent/approve
 * Approve a minor's account
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

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('parent_consent_invites')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 });
    }

    // Check if already responded
    if (invite.status === 'approved') {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 });
    }

    if (invite.status === 'declined') {
      return NextResponse.json({ error: 'This request was previously declined' }, { status: 400 });
    }

    // Update invite status
    const { error: updateInviteError } = await supabase
      .from('parent_consent_invites')
      .update({
        status: 'approved',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invite.id);

    if (updateInviteError) {
      console.error('Error updating invite:', updateInviteError);
      return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
    }

    // Update student's minor_status to approved
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        minor_status: 'approved',
        parent_approved_at: new Date().toISOString(),
      })
      .eq('id', invite.student_id);

    if (updateUserError) {
      console.error('Error updating student:', updateUserError);
      return NextResponse.json({ error: 'Failed to update student status' }, { status: 500 });
    }

    // Log approval
    console.log('Parent approval granted:', {
      studentId: invite.student_id,
      parentEmail: invite.parent_email,
      approvedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Account approved successfully',
    });
  } catch (error) {
    console.error('Parent approve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
