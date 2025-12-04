/**
 * Athlete Campaign Invites List API
 *
 * GET /api/athlete/invites - Get all pending campaign invites for the athlete
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'invited'; // Default to pending invites

    // Get all invites for this athlete
    const { data: invites, error: invitesError } = await supabase
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
      .eq('athlete_id', userId)
      .eq('status', status)
      .order('invited_at', { ascending: false });

    if (invitesError) {
      console.error('Error fetching invites:', invitesError);
      return NextResponse.json(
        { error: 'Failed to fetch invites' },
        { status: 500 }
      );
    }

    // Get campaign details from agency_campaigns table
    const campaignIds = invites?.map(inv => inv.campaign_id).filter(Boolean) || [];
    let campaignMap = new Map<string, any>();

    if (campaignIds.length > 0) {
      const { data: campaigns } = await supabase
        .from('agency_campaigns')
        .select('id, name, description, budget, agency_id, status, start_date, end_date, target_sports')
        .in('id', campaignIds);

      campaignMap = new Map(campaigns?.map(c => [c.id, c]) || []);
    }

    // Get agency info for all campaigns
    const agencyIds = Array.from(new Set(
      Array.from(campaignMap.values()).map(c => c.agency_id).filter(Boolean)
    ));

    let agencyMap = new Map<string, any>();
    if (agencyIds.length > 0) {
      const { data: agencies } = await supabase
        .from('agencies')
        .select('id, company_name, logo_url, website')
        .in('id', agencyIds);

      agencyMap = new Map(agencies?.map(a => [a.id, a]) || []);
    }

    // Enrich invites with campaign and agency data
    const enrichedInvites = invites?.map(invite => {
      const campaign = campaignMap.get(invite.campaign_id);
      const agency = campaign ? agencyMap.get(campaign.agency_id) : null;
      return {
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
      };
    }) || [];

    return NextResponse.json({
      success: true,
      invites: enrichedInvites,
      total: enrichedInvites.length,
    });

  } catch (error) {
    console.error('Error in athlete invites API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
