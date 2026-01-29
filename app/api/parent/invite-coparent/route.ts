import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { childId, inviteeName, inviteeEmail, relationship } = body;

    if (!childId || !inviteeEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a parent
    const { data: parentProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (parentProfile?.role !== 'parent') {
      return NextResponse.json({ error: 'Not a parent account' }, { status: 403 });
    }

    // Check if invite already exists
    const { data: existingInvite } = await supabaseAdmin
      .from('coparent_invites')
      .select('id, status')
      .eq('inviter_id', user.id)
      .eq('child_id', childId)
      .eq('invitee_email', inviteeEmail.toLowerCase())
      .single();

    if (existingInvite && existingInvite.status === 'pending') {
      return NextResponse.json({ error: 'Invite already sent' }, { status: 400 });
    }

    // Create invite
    const { data: invite, error } = await supabaseAdmin
      .from('coparent_invites')
      .insert({
        inviter_id: user.id,
        child_id: childId,
        invitee_email: inviteeEmail.toLowerCase(),
        invitee_name: inviteeName || null,
        relationship: relationship || 'parent',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coparent invite:', error);
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    // TODO: Send email to invitee
    console.log('Co-parent invite created:', {
      token: invite.invite_token,
      inviteeEmail,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/accept-invite/${invite.invite_token}`
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Invite coparent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
