import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/parent/invite-details?token=xxx
 * Get invite details by token (for parent approval page)
 * No authentication required - token serves as auth
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Use service role key for this operation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get invite by token
    const { data: invite, error: inviteError } = await supabase
      .from('parent_consent_invites')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invitation link' }, { status: 404 });
    }

    // Check if expired
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) {
      return NextResponse.json({ error: 'This invitation has expired. Please ask your child to send a new one.' }, { status: 410 });
    }

    // Get student details
    const { data: student } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', invite.student_id)
      .single();

    return NextResponse.json({
      studentName: student ? `${student.first_name} ${student.last_name}`.trim() : 'Student',
      studentEmail: student?.email || '',
      parentName: invite.parent_name || '',
      parentEmail: invite.parent_email,
      relationshipType: invite.relationship_type,
      createdAt: invite.created_at,
      expiresAt: invite.expires_at,
      status: invite.status,
    });
  } catch (error) {
    console.error('Invite details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
