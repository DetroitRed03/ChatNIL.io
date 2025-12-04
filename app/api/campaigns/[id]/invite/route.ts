/**
 * Campaign Athlete Invitation API
 * POST /api/campaigns/[id]/invite
 *
 * Sends invitations to selected athletes for a campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Get authenticated user ID from request
 * Uses X-User-ID header or falls back to cookie-based auth
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = resolvedParams.id;

    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { athlete_ids } = body;

    if (!athlete_ids || !Array.isArray(athlete_ids) || athlete_ids.length === 0) {
      return NextResponse.json(
        { error: 'athlete_ids must be a non-empty array' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify campaign exists (using agency_campaigns table)
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

    // Verify user is associated with the agency that owns this campaign
    const { data: userAgency } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    // Check if user is agency/brand role OR if their ID matches the agency_id
    // (agency_id in campaigns table references the agency user's ID)
    const isAgencyOwner = campaign.agency_id === userId;
    const isAgencyRole = userAgency?.role === 'agency' || userAgency?.role === 'brand';

    if (!isAgencyOwner && !isAgencyRole) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this campaign' },
        { status: 403 }
      );
    }

    // Get agency info for the invitation (using correct column name: company_name)
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id, company_name')
      .eq('id', campaign.agency_id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Create campaign athlete assignments
    const assignments = athlete_ids.map(athlete_id => ({
      campaign_id: campaignId,
      athlete_id: athlete_id,
      status: 'invited',
      invited_at: new Date().toISOString(),
    }));

    const { data: insertedAssignments, error: assignmentError } = await supabase
      .from('campaign_athletes')
      .upsert(assignments, {
        onConflict: 'campaign_id,athlete_id',
        ignoreDuplicates: false,
      })
      .select();

    if (assignmentError) {
      console.error('Error creating assignments:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to create assignments' },
        { status: 500 }
      );
    }

    // TODO: Send email notifications to athletes
    // For now, we'll just create the database records

    // Get athlete details for the response
    const { data: athletes, error: athletesError } = await supabase
      .from('athlete_profiles')
      .select(`
        id,
        users!inner(id, email, full_name, username)
      `)
      .in('id', athlete_ids);

    if (athletesError) {
      console.error('Error fetching athletes:', athletesError);
    }

    return NextResponse.json({
      success: true,
      invited_count: athlete_ids.length,
      assignments: insertedAssignments,
      athletes: athletes || [],
      campaign: {
        id: campaign.id,
        name: campaign.name,
      },
      agency: {
        id: agency.id,
        name: agency.company_name,
      },
    });
  } catch (error) {
    console.error('Error in campaign invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
