import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Helper to get authenticated user ID with multiple fallbacks
 */
async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  // Method 1: Try cookie-based auth (SSR client)
  try {
    const authClient = await createClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch (e) {
    console.log('Cookie auth failed, trying fallback...');
  }

  // Method 2: Check for X-User-ID header (sent by frontend)
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) {
    return userIdHeader;
  }

  // Method 3: Check for Authorization header with Bearer token
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const serviceClient = createServiceRoleClient();
    const { data: { user } } = await serviceClient.auth.getUser(token);
    if (user) {
      return user.id;
    }
  }

  return null;
}

/**
 * POST /api/campaigns/[id]/express-interest
 * Athlete expresses interest in a campaign opportunity
 *
 * This creates or updates a match record in agency_athlete_matches
 * similar to responding to a direct agency match.
 *
 * Body (optional):
 * - agency_id: string - The agency that owns the campaign (if not provided, looked up from campaign)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Get authenticated user with fallbacks
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient();

    // Verify user is an athlete
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('id, role, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userData.role !== 'athlete') {
      return NextResponse.json(
        { error: 'Only athletes can express interest in campaigns' },
        { status: 403 }
      );
    }

    // Get campaign to find agency_id
    const { data: campaign, error: campaignError } = await serviceClient
      .from('agency_campaigns')
      .select('id, name, agency_id, status')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'This campaign is no longer active' },
        { status: 400 }
      );
    }

    const agencyId = campaign.agency_id;

    // Check if a match already exists between this agency and athlete
    const { data: existingMatch } = await serviceClient
      .from('agency_athlete_matches')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('athlete_id', userId)
      .single();

    const timestamp = new Date().toISOString();

    if (existingMatch) {
      // Update existing match with interest
      const historyEntry = {
        status: 'interested',
        source: 'campaign',
        campaign_id: campaignId,
        campaign_name: campaign.name,
        timestamp
      };

      const existingHistory = existingMatch.response_history || [];
      const newHistory = [...existingHistory, historyEntry];

      const { data: updatedMatch, error: updateError } = await serviceClient
        .from('agency_athlete_matches')
        .update({
          athlete_response_status: 'interested',
          athlete_response_at: timestamp,
          responded_at: timestamp,
          response_history: newHistory,
          status: 'interested'
        })
        .eq('id', existingMatch.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error updating match:', updateError);
        return NextResponse.json(
          { error: 'Failed to express interest' },
          { status: 500 }
        );
      }

      // Get agency info
      const { data: agency } = await serviceClient
        .from('users')
        .select('id, first_name, last_name, email, company_name')
        .eq('id', agencyId)
        .single();

      return NextResponse.json({
        success: true,
        match: {
          ...updatedMatch,
          agency: agency ? {
            id: agency.id,
            name: agency.company_name || `${agency.first_name || ''} ${agency.last_name || ''}`.trim(),
            email: agency.email
          } : null
        },
        message: `You have expressed interest in ${campaign.name}! The brand will be notified.`,
        isNewMatch: false
      });
    } else {
      // Create a new match record
      const historyEntry = {
        status: 'interested',
        source: 'campaign',
        campaign_id: campaignId,
        campaign_name: campaign.name,
        timestamp
      };

      const { data: newMatch, error: insertError } = await serviceClient
        .from('agency_athlete_matches')
        .insert({
          agency_id: agencyId,
          athlete_id: userId,
          match_score: 70, // Default score for athlete-initiated interest
          match_tier: 'good',
          match_reasons: [`Athlete expressed interest in campaign: ${campaign.name}`],
          status: 'interested',
          athlete_response_status: 'interested',
          athlete_response_at: timestamp,
          responded_at: timestamp,
          response_history: [historyEntry]
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error creating match:', insertError);
        return NextResponse.json(
          { error: 'Failed to express interest' },
          { status: 500 }
        );
      }

      // Get agency info
      const { data: agency } = await serviceClient
        .from('users')
        .select('id, first_name, last_name, email, company_name')
        .eq('id', agencyId)
        .single();

      return NextResponse.json({
        success: true,
        match: {
          ...newMatch,
          agency: agency ? {
            id: agency.id,
            name: agency.company_name || `${agency.first_name || ''} ${agency.last_name || ''}`.trim(),
            email: agency.email
          } : null
        },
        message: `You have expressed interest in ${campaign.name}! The brand will be notified.`,
        isNewMatch: true
      });
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/campaigns/[id]/express-interest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
