import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent-invites/resend
 * Resend the parent consent invite
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    let { data: { user } } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      if (tokenUser) user = tokenUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    // Get the most recent invite
    const { data: existingInvite } = await supabase
      .from('parent_consent_invites')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!existingInvite) {
      return NextResponse.json({ error: 'No invite found to resend' }, { status: 400 });
    }

    // If the invite is expired or declined, create a new one
    const isExpired = new Date(existingInvite.expires_at) < new Date();
    if (isExpired || existingInvite.status === 'expired' || existingInvite.status === 'declined') {
      // Mark old invite as expired
      await supabase
        .from('parent_consent_invites')
        .update({ status: 'expired' })
        .eq('id', existingInvite.id);

      // Create new invite
      const { data: newInvite, error: insertError } = await supabase
        .from('parent_consent_invites')
        .insert({
          student_id: user.id,
          parent_email: existingInvite.parent_email,
          parent_name: existingInvite.parent_name,
          relationship_type: existingInvite.relationship_type,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating new invite:', insertError);
        return NextResponse.json({ error: 'Failed to create new invitation' }, { status: 500 });
      }

      // Log the new invitation
      const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/approve/${newInvite.invite_token}`;
      console.log('Parent invite resent (new token):', {
        token: newInvite.invite_token,
        parentEmail: existingInvite.parent_email,
        studentName: `${profile?.first_name} ${profile?.last_name}`,
        approvalUrl,
      });

      return NextResponse.json({
        success: true,
        message: 'New invitation sent successfully',
      });
    }

    // Otherwise, just resend the same invite
    // In production, trigger email resend here
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/approve/${existingInvite.invite_token}`;
    console.log('Parent invite resent:', {
      token: existingInvite.invite_token,
      parentEmail: existingInvite.parent_email,
      studentName: `${profile?.first_name} ${profile?.last_name}`,
      approvalUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully',
    });
  } catch (error) {
    console.error('Parent invite resend error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
