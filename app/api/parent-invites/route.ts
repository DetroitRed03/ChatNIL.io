import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent-invites
 * Create a new parent consent invite for the authenticated HS student
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { parentEmail, parentName, relationshipType } = body;

    if (!parentEmail) {
      return NextResponse.json({ error: 'Parent email is required' }, { status: 400 });
    }

    // Basic email validation
    if (!parentEmail.includes('@') || !parentEmail.includes('.')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

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

    // Verify user is an HS student
    const { data: profile } = await supabase
      .from('users')
      .select('role, first_name, last_name, email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'hs_student') {
      return NextResponse.json({ error: 'Only HS students can request parent approval' }, { status: 403 });
    }

    // Check if there's already a pending/viewed invite
    const { data: existingInvite } = await supabase
      .from('parent_consent_invites')
      .select('id, status')
      .eq('student_id', user.id)
      .in('status', ['pending', 'viewed'])
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'You already have a pending invite. Please wait for a response or resend it.' },
        { status: 400 }
      );
    }

    // Create new invite
    const { data: invite, error: insertError } = await supabase
      .from('parent_consent_invites')
      .insert({
        student_id: user.id,
        parent_email: parentEmail.toLowerCase(),
        parent_name: parentName || null,
        relationship_type: relationshipType || 'parent',
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invite:', insertError);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    // Mark student as pending parent approval
    await supabase
      .from('users')
      .update({
        is_minor: true,
        minor_status: 'pending_parent_approval',
      })
      .eq('id', user.id);

    // Log the invitation (in production, send email via Resend, SendGrid, etc.)
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/parent/approve/${invite.invite_token}`;
    console.log('Parent invite created:', {
      token: invite.invite_token,
      parentEmail: parentEmail.toLowerCase(),
      studentName: `${profile.first_name} ${profile.last_name}`,
      approvalUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('Parent invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/parent-invites
 * Get all invites for the authenticated student
 */
export async function GET(request: NextRequest) {
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

    // Get all invites for this student
    const { data: invites } = await supabase
      .from('parent_consent_invites')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      invites: invites || []
    });
  } catch (error) {
    console.error('Parent invites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
