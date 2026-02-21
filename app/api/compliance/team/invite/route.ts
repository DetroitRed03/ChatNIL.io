/**
 * Compliance Team Invite API
 * POST: Create new invite
 * PUT: Accept/decline invite
 * DELETE: Cancel invite
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { rolePermissionDefaults, ComplianceTeamRole } from '@/types/settings';
import { sendTeamInvitationEmail, sendInvitationAcceptedEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

// Create Supabase client with service role for RLS bypass
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url: any, opts: any) => fetch(url, { ...opts, cache: 'no-store' as any }),
      },
    }
  );
}

// Get authenticated user from cookies (async version for Next.js 14)
async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = await cookies();

  // Check for Authorization header first
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

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

  // Try getting user from session first
  let { data: { user }, error } = await supabase.auth.getUser();

  // If no user from session, try bearer token
  if (!user && bearerToken) {
    const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
    if (tokenUser && !tokenError) {
      user = tokenUser;
    }
  }

  return user || null;
}

// POST: Create new invite
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role, permissions, sports_access } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get inviter's institution and permissions
    let institutionId: string | null = null;

    // First check compliance_team_members
    const { data: inviterMember } = await supabase
      .from('compliance_team_members')
      .select('*, institution_id')
      .eq('user_id', user.id)
      .single();

    if (inviterMember) {
      institutionId = inviterMember.institution_id;

      // Check if inviter can invite
      if (!inviterMember.can_invite_members) {
        return NextResponse.json(
          { error: 'You do not have permission to invite members' },
          { status: 403 }
        );
      }
    } else {
      // Fallback to compliance_settings
      const { data: settings } = await supabase
        .from('compliance_settings')
        .select('institution_id')
        .eq('user_id', user.id)
        .single();

      institutionId = settings?.institution_id || null;
    }

    if (!institutionId) {
      return NextResponse.json({ error: 'No institution found' }, { status: 400 });
    }

    // Check for existing pending invite
    const { data: existingInvite } = await supabase
      .from('compliance_team_invites')
      .select('*')
      .eq('institution_id', institutionId)
      .eq('invitee_email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invite has already been sent to this email' },
        { status: 400 }
      );
    }

    // Check if already a team member
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('compliance_team_members')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('user_id', existingUser.id)
        .eq('status', 'active')
        .single();

      if (existingMember) {
        return NextResponse.json(
          { error: 'This user is already a team member' },
          { status: 400 }
        );
      }
    }

    // Get default permissions for role
    const roleKey = (role || 'officer') as ComplianceTeamRole;
    const defaultPerms = rolePermissionDefaults[roleKey] || rolePermissionDefaults.officer;

    // Create invite
    const { data: invite, error } = await supabase
      .from('compliance_team_invites')
      .insert({
        institution_id: institutionId,
        invited_by: user.id,
        invitee_email: email.toLowerCase(),
        invitee_name: name,
        role: role || 'officer',
        permissions: { ...defaultPerms, ...permissions },
        sports_access: sports_access || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send invitation email (non-blocking)
    try {
      const [inviterRes, institutionRes] = await Promise.all([
        supabase.from('users').select('full_name, email').eq('id', user.id).single(),
        supabase.from('institutions').select('name').eq('id', institutionId).single(),
      ]);
      const inviterName = inviterRes.data?.full_name || inviterRes.data?.email || 'A team member';
      const teamName = institutionRes.data?.name || 'Compliance Team';

      await sendTeamInvitationEmail(
        email.toLowerCase(),
        inviterName,
        teamName,
        role || 'officer',
        invite.invite_token
      );
    } catch (emailError) {
      console.error('Failed to send invite email (invite still created):', emailError);
    }

    return NextResponse.json({ invite });
  } catch (error) {
    console.error('Error in POST /api/compliance/team/invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Accept or decline invite
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body; // action: 'accept' | 'decline'

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find invite
    const { data: invite } = await supabase
      .from('compliance_team_invites')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('compliance_team_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    // Handle decline
    if (action === 'decline') {
      await supabase
        .from('compliance_team_invites')
        .update({ status: 'declined' })
        .eq('id', invite.id);
      return NextResponse.json({ success: true, message: 'Invite declined' });
    }

    // Handle accept - need to be logged in
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({
        error: 'Please log in or create an account to accept this invite',
        requiresAuth: true,
        inviteEmail: invite.invitee_email
      }, { status: 401 });
    }

    // Verify email matches (case insensitive)
    if (user.email?.toLowerCase() !== invite.invitee_email.toLowerCase()) {
      return NextResponse.json({
        error: 'This invite was sent to a different email address'
      }, { status: 403 });
    }

    // Create team member
    const permissions = invite.permissions || {};

    const { error: memberError } = await supabase
      .from('compliance_team_members')
      .insert({
        institution_id: invite.institution_id,
        user_id: user.id,
        invited_by: invite.invited_by,
        role: invite.role,
        can_view_athletes: permissions.can_view_athletes ?? true,
        can_view_deals: permissions.can_view_deals ?? true,
        can_flag_deals: permissions.can_flag_deals ?? true,
        can_approve_deals: permissions.can_approve_deals ?? false,
        can_reject_deals: permissions.can_reject_deals ?? false,
        can_invite_members: permissions.can_invite_members ?? false,
        can_manage_members: permissions.can_manage_members ?? false,
        can_access_reports: permissions.can_access_reports ?? true,
        can_export_data: permissions.can_export_data ?? false,
        all_sports_access: permissions.all_sports_access ?? true,
        sports_access: invite.sports_access
      });

    if (memberError) {
      console.error('Error creating team member:', memberError);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Update invite status
    await supabase
      .from('compliance_team_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    // Update user role if not already compliance_officer
    await supabase
      .from('users')
      .update({ role: 'compliance_officer' })
      .eq('id', user.id);

    // Sync to institution_staff so the member appears in the workload panel
    // (The workload endpoint reads from institution_staff)
    await supabase
      .from('institution_staff')
      .upsert(
        {
          user_id: user.id,
          institution_id: invite.institution_id,
          role: 'compliance_officer',
          title: invite.invitee_name || 'Compliance Officer',
        },
        { onConflict: 'user_id,institution_id' }
      );

    // Create compliance settings for new member if they don't exist
    await supabase
      .from('compliance_settings')
      .upsert(
        {
          user_id: user.id,
          institution_id: invite.institution_id
        },
        { onConflict: 'user_id' }
      );

    // Notify inviter that the invite was accepted (non-blocking)
    try {
      const inviterRes = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', invite.invited_by)
        .single();

      if (inviterRes.data?.email) {
        await sendInvitationAcceptedEmail(
          inviterRes.data.email,
          inviterRes.data.full_name || 'Team Admin',
          invite.invitee_name || user.email || 'New member',
          user.email || invite.invitee_email
        );
      }
    } catch (emailError) {
      console.error('Failed to send acceptance notification:', emailError);
    }

    return NextResponse.json({ success: true, message: 'Welcome to the team!' });
  } catch (error) {
    console.error('Error in PUT /api/compliance/team/invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Cancel invite
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const inviteId = url.searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get the invite
    const { data: invite } = await supabase
      .from('compliance_team_invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user can cancel (inviter or has manage_members permission)
    if (invite.invited_by !== user.id) {
      const { data: member } = await supabase
        .from('compliance_team_members')
        .select('can_manage_members')
        .eq('user_id', user.id)
        .eq('institution_id', invite.institution_id)
        .single();

      if (!member?.can_manage_members) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    // Delete the invite
    const { error } = await supabase
      .from('compliance_team_invites')
      .delete()
      .eq('id', inviteId);

    if (error) {
      console.error('Error deleting invite:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/compliance/team/invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
