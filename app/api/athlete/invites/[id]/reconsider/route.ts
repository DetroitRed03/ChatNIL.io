/**
 * Athlete Campaign Invite Reconsider API
 *
 * POST /api/athlete/invites/[id]/reconsider - Reconsider a declined campaign invite
 * GET /api/athlete/invites/[id]/reconsider - Check if invite can be reconsidered
 *
 * Allows athletes to change their mind within 48 hours of declining.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';
import {
  canReconsider,
  validateReconsiderAction,
  createResponseHistoryEntry,
  addToResponseHistory,
  getReconsiderTimeRemaining,
  RECONSIDER_WINDOW_HOURS
} from '@/lib/reconsider-utils';

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
 * POST - Reconsider a declined invite
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

    const supabase = getSupabaseClient();

    // Get the invite with response history
    const { data: invite, error: inviteError } = await supabase
      .from('campaign_athletes')
      .select('id, campaign_id, athlete_id, status, responded_at, response_history')
      .eq('id', inviteId)
      .eq('athlete_id', userId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Validate reconsider action
    const validationError = validateReconsiderAction(
      invite.status,
      invite.responded_at,
      invite.response_history
    );

    if (validationError) {
      const timeRemaining = getReconsiderTimeRemaining(invite.responded_at);
      return NextResponse.json(
        {
          error: validationError,
          timeExpired: timeRemaining?.expired ?? false,
          windowHours: RECONSIDER_WINDOW_HOURS
        },
        { status: 400 }
      );
    }

    // Create reconsider history entry
    const historyEntry = createResponseHistoryEntry('reconsidered');
    const newHistory = addToResponseHistory(invite.response_history, historyEntry);

    // Update the invite - set back to "invited" status
    const { data: updatedInvite, error: updateError } = await supabase
      .from('campaign_athletes')
      .update({
        status: 'invited', // Back to invited - can respond again
        response_history: newHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', inviteId)
      .eq('athlete_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating invite:', updateError);
      return NextResponse.json(
        { error: 'Failed to reconsider invite' },
        { status: 500 }
      );
    }

    // Get campaign details
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

    // TODO: Send notification to agency about reconsideration
    console.log(`[Reconsider] Athlete ${userId} reconsidered invite ${inviteId} for campaign ${invite.campaign_id}`);

    return NextResponse.json({
      success: true,
      invite: {
        ...updatedInvite,
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
      message: 'You have reconsidered this campaign invite. You can now accept or decline it again.',
      reconsidered: true
    });

  } catch (error) {
    console.error('Error reconsidering invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if invite can be reconsidered
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
      .select('id, status, responded_at, response_history, athlete_id')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    // Verify the current user is the athlete
    if (invite.athlete_id !== userId) {
      return NextResponse.json(
        { error: 'You can only check reconsider status for your own invites' },
        { status: 403 }
      );
    }

    // Check if can reconsider
    const canReconsiderInvite = invite.status === 'declined' && canReconsider(invite.responded_at);
    const timeRemaining = getReconsiderTimeRemaining(invite.responded_at);
    const validationError = validateReconsiderAction(
      invite.status,
      invite.responded_at,
      invite.response_history
    );

    return NextResponse.json({
      success: true,
      canReconsider: canReconsiderInvite && !validationError,
      reason: validationError || null,
      timeRemaining: timeRemaining,
      windowHours: RECONSIDER_WINDOW_HOURS
    });

  } catch (error) {
    console.error('Error checking reconsider status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
