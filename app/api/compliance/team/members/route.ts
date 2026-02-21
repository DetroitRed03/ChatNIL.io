/**
 * Compliance Team Members API
 * GET: Fetch team members and pending invites
 * DELETE: Remove a team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user's institution from compliance_settings
    const { data: settings } = await supabase
      .from('compliance_settings')
      .select('institution_id')
      .eq('user_id', user.id)
      .single();

    if (!settings?.institution_id) {
      return NextResponse.json({ members: [], invites: [] });
    }

    // Get team members with user info
    const { data: members, error: membersError } = await supabase
      .from('compliance_team_members')
      .select(`
        *,
        user:users(id, full_name, email, profile_photo)
      `)
      .eq('institution_id', settings.institution_id)
      .eq('status', 'active')
      .order('joined_at', { ascending: true });

    if (membersError) {
      console.error('Error fetching team members:', membersError);
    }

    // Get pending invites
    const { data: invites, error: invitesError } = await supabase
      .from('compliance_team_invites')
      .select('*')
      .eq('institution_id', settings.institution_id)
      .eq('status', 'pending')
      .order('sent_at', { ascending: false });

    if (invitesError) {
      console.error('Error fetching invites:', invitesError);
    }

    return NextResponse.json({
      members: members || [],
      invites: invites || []
    });
  } catch (error) {
    console.error('Error in GET /api/compliance/team/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const memberId = url.searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get the member to remove
    const { data: memberToRemove } = await supabase
      .from('compliance_team_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if current user has permission to manage members
    const { data: currentMember } = await supabase
      .from('compliance_team_members')
      .select('can_manage_members')
      .eq('user_id', user.id)
      .eq('institution_id', memberToRemove.institution_id)
      .single();

    if (!currentMember?.can_manage_members) {
      return NextResponse.json({ error: 'Not authorized to manage members' }, { status: 403 });
    }

    // Cannot remove yourself
    if (memberToRemove.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself from the team' }, { status: 400 });
    }

    // Soft delete by setting status to 'removed'
    const { error } = await supabase
      .from('compliance_team_members')
      .update({ status: 'removed', updated_at: new Date().toISOString() })
      .eq('id', memberId);

    if (error) {
      console.error('Error removing team member:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/compliance/team/members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
