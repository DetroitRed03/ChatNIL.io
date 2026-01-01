/**
 * Agency Campaign Invites API
 *
 * GET /api/agency/campaigns/[id]/invites - Get all invites for a campaign with athlete details
 *
 * Query params:
 * - status: 'all' | 'invited' | 'accepted' | 'declined' | 'active' | 'completed'
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Create supabase client lazily inside functions to ensure env vars are loaded
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Get authenticated user ID from request
 */
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) return userIdHeader;

  try {
    const authClient = await createAuthClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) return user.id;
  } catch (e) {
    console.log('Cookie auth failed');
  }

  return null;
}

/**
 * GET - Get all invites for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get Supabase client with service role (bypasses RLS)
    const supabase = getSupabaseClient();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';

    // Verify this campaign belongs to the agency
    const { data: campaign, error: campaignError } = await supabase
      .from('agency_campaigns')
      .select('id, name, agency_id')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if user owns this campaign (either directly or as agency)
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    // For agency users, verify ownership
    if (campaign.agency_id !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to view this campaign' },
        { status: 403 }
      );
    }

    // Build query for campaign_athletes
    let query = supabase
      .from('campaign_athletes')
      .select(`
        id,
        campaign_id,
        athlete_id,
        status,
        invited_at,
        accepted_at,
        completed_at,
        responded_at,
        response_history
      `)
      .eq('campaign_id', campaignId)
      .order('invited_at', { ascending: false });

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: invites, error: invitesError } = await query;

    if (invitesError) {
      console.error('Error fetching invites:', invitesError);
      return NextResponse.json(
        { error: 'Failed to fetch invites' },
        { status: 500 }
      );
    }

    // Get athlete details for all invites
    const athleteIds = invites?.map(i => i.athlete_id) || [];
    let athletes: any[] = [];

    if (athleteIds.length > 0) {
      // Query users table with service role client
      const { data: athleteData, error: athleteError } = await supabase
        .from('users')
        .select('id, first_name, last_name, full_name, username, email, profile_photo, avatar_url')
        .in('id', athleteIds);

      if (athleteError) {
        console.error('Error fetching athlete data:', athleteError);
      }

      athletes = athleteData || [];

      // Also get athlete profile data for additional info
      const { data: profileData } = await supabase
        .from('athlete_profiles')
        .select('user_id, primary_sport, school_name, total_followers')
        .in('user_id', athleteIds);

      // Merge profile data into athletes
      if (profileData) {
        athletes = athletes.map(athlete => {
          const profile = profileData.find(p => p.user_id === athlete.id);
          return {
            ...athlete,
            primary_sport: profile?.primary_sport,
            school_name: profile?.school_name,
            total_followers: profile?.total_followers
          };
        });
      }
    }

    // Combine invites with athlete data
    const enrichedInvites = invites?.map(invite => {
      const athlete = athletes.find(a => a.id === invite.athlete_id);
      return {
        ...invite,
        athlete: athlete ? {
          id: athlete.id,
          first_name: athlete.first_name,
          last_name: athlete.last_name,
          full_name: athlete.full_name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 'Unknown Athlete',
          username: athlete.username,
          email: athlete.email,
          avatar_url: athlete.avatar_url || athlete.profile_photo || null, // Use avatar_url with fallback to profile_photo
          profile_photo: athlete.profile_photo,
          sport: athlete.primary_sport,
          primary_sport: athlete.primary_sport,
          school: athlete.school_name,
          school_name: athlete.school_name,
          total_followers: athlete.total_followers
        } : null
      };
    }) || [];

    // Group by status for easy frontend consumption
    const grouped = {
      invited: enrichedInvites.filter(i => i.status === 'invited'),
      accepted: enrichedInvites.filter(i => i.status === 'accepted'),
      declined: enrichedInvites.filter(i => i.status === 'declined'),
      active: enrichedInvites.filter(i => i.status === 'active'),
      completed: enrichedInvites.filter(i => i.status === 'completed')
    };

    // Calculate summary stats
    const summary = {
      total: enrichedInvites.length,
      invited: grouped.invited.length,
      accepted: grouped.accepted.length,
      declined: grouped.declined.length,
      active: grouped.active.length,
      completed: grouped.completed.length,
      response_rate: enrichedInvites.length > 0
        ? ((grouped.accepted.length + grouped.declined.length) / enrichedInvites.length * 100).toFixed(1)
        : '0',
      acceptance_rate: (grouped.accepted.length + grouped.declined.length) > 0
        ? (grouped.accepted.length / (grouped.accepted.length + grouped.declined.length) * 100).toFixed(1)
        : '0'
    };

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name
      },
      invites: enrichedInvites,
      grouped,
      summary
    });

  } catch (error) {
    console.error('Error in campaign invites API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
