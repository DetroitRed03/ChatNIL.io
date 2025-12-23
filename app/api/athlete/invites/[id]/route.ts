/**
 * Athlete Campaign Invite Response API
 *
 * POST /api/athlete/invites/[id] - Accept or decline a campaign invite
 * GET /api/athlete/invites/[id] - Get invite details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

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
  // Method 1: Check for X-User-ID header (sent by frontend)
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) {
    return userIdHeader;
  }

  // Method 2: Try cookie-based auth
  try {
    const authClient = await createAuthClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch (e) {
    console.log('Cookie auth failed');
  }

  return null;
}

/**
 * GET - Get invite details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const inviteId = resolvedParams.id;

    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('campaign_athletes')
      .select(`
        id,
        campaign_id,
        athlete_id,
        status,
        invited_at,
        accepted_at,
        completed_at
      `)
      .eq('id', inviteId)
      .eq('athlete_id', userId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Get campaign from agency_campaigns
    const { data: campaign } = await supabase
      .from('agency_campaigns')
      .select('id, name, description, budget, agency_id, status, start_date, end_date, target_sports')
      .eq('id', invite.campaign_id)
      .single();

    // Get agency info
    let agency = null;
    if (campaign?.agency_id) {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('id, company_name, logo_url, website')
        .eq('id', campaign.agency_id)
        .single();
      agency = agencyData;
    }

    return NextResponse.json({
      success: true,
      invite: {
        ...invite,
        campaign: campaign ? {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          budget: campaign.budget,
          status: campaign.status,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          target_sports: campaign.target_sports,
        } : null,
        agency: agency ? {
          id: agency.id,
          name: agency.company_name,
          logo_url: agency.logo_url,
          website: agency.website,
        } : null,
      },
    });

  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Accept or decline an invite
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const inviteId = resolvedParams.id;

    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify the invite belongs to this athlete and is pending
    const { data: existingInvite, error: fetchError } = await supabase
      .from('campaign_athletes')
      .select('id, status, campaign_id, response_history, responded_at')
      .eq('id', inviteId)
      .eq('athlete_id', userId)
      .single();

    if (fetchError || !existingInvite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    if (existingInvite.status !== 'invited') {
      return NextResponse.json(
        { error: `Invite has already been ${existingInvite.status}` },
        { status: 400 }
      );
    }

    // Update the invite status
    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    // Build response history entry
    const historyEntry = {
      status: newStatus,
      timestamp: new Date().toISOString()
    };

    // Get existing history or start fresh
    const existingHistory = existingInvite.response_history || [];
    const newHistory = [...existingHistory, historyEntry];

    const updateData: {
      status: string;
      accepted_at?: string;
      responded_at: string;
      response_history: any[];
    } = {
      status: newStatus,
      responded_at: new Date().toISOString(),
      response_history: newHistory
    };

    // Only set accepted_at if accepting (this column should exist)
    if (action === 'accept') {
      updateData.accepted_at = new Date().toISOString();
    }

    const { data: updatedInvite, error: updateError } = await supabase
      .from('campaign_athletes')
      .update(updateData)
      .eq('id', inviteId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating invite:', updateError);
      return NextResponse.json(
        { error: 'Failed to update invite' },
        { status: 500 }
      );
    }

    // Get campaign details for response (using agency_campaigns table)
    const { data: campaign } = await supabase
      .from('agency_campaigns')
      .select('id, name, agency_id')
      .eq('id', existingInvite.campaign_id)
      .single();

    // Get athlete details for notification
    const { data: athlete } = await supabase
      .from('users')
      .select('id, first_name, last_name, username')
      .eq('id', userId)
      .single();

    const athleteName = athlete
      ? `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || athlete.username || 'An athlete'
      : 'An athlete';

    // If accepted and we have the agency_id, send notification to agency
    if (action === 'accept' && campaign?.agency_id) {
      try {
        // Store notification in database for the agency
        await supabase
          .from('notifications')
          .insert({
            user_id: campaign.agency_id,
            type: 'invite_accepted',
            title: 'Invite Accepted!',
            message: `${athleteName} has accepted your invite to "${campaign.name}"`,
            data: {
              campaign_id: campaign.id,
              campaign_name: campaign.name,
              athlete_id: userId,
              athlete_name: athleteName,
              invite_id: inviteId
            },
            read: false,
            created_at: new Date().toISOString()
          });

        console.log(`Notification sent to agency ${campaign.agency_id}: ${athleteName} accepted invite`);
      } catch (notifyError) {
        // Don't fail the main request if notification fails
        console.error('Failed to send notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Invite ${newStatus} successfully`,
      invite: updatedInvite,
      campaign: campaign || null,
    });

  } catch (error) {
    console.error('Error responding to invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
