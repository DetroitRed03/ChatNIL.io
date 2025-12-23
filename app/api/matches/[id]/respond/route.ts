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
 * POST /api/matches/[id]/respond
 * Athlete responds to a match (interested/declined)
 *
 * Body:
 * - response: 'interested' | 'declined'
 *
 * Only the athlete_id owner can respond
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    // Get authenticated user with fallbacks
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { response } = body;

    // Validate response
    if (!response || !['interested', 'declined'].includes(response)) {
      return NextResponse.json(
        { error: 'Invalid response. Must be "interested" or "declined"' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Get the match and verify the user is the athlete
    const { data: match, error: fetchError } = await serviceClient
      .from('agency_athlete_matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Verify the current user is the athlete
    if (match.athlete_id !== userId) {
      return NextResponse.json(
        { error: 'You can only respond to matches where you are the athlete' },
        { status: 403 }
      );
    }

    // Check if match is in a state that allows response
    if (match.status === 'rejected' || match.status === 'expired' || match.status === 'partnered') {
      return NextResponse.json(
        { error: `Cannot respond to a match with status: ${match.status}` },
        { status: 400 }
      );
    }

    // Build response history entry
    const historyEntry = {
      status: response,
      timestamp: new Date().toISOString()
    };

    // Get existing history or start fresh
    const existingHistory = match.response_history || [];
    const newHistory = [...existingHistory, historyEntry];

    // Update the match
    const updateData = {
      athlete_response_status: response,
      athlete_response_at: new Date().toISOString(),
      responded_at: new Date().toISOString(), // Track for reconsider window
      response_history: newHistory,
      status: response === 'interested' ? 'interested' : 'rejected'
    };

    const { data: updatedMatch, error: updateError } = await serviceClient
      .from('agency_athlete_matches')
      .update(updateData)
      .eq('id', matchId)
      .eq('athlete_id', userId) // Double-check ownership
      .select('*')
      .single();

    // Fetch agency details separately to avoid schema cache issues
    let agency = null;
    if (updatedMatch?.agency_id) {
      const { data: agencyData } = await serviceClient
        .from('users')
        .select('id, first_name, last_name, email, company_name')
        .eq('id', updatedMatch.agency_id)
        .single();
      agency = agencyData;
    }

    if (updateError) {
      console.error('Error updating match:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

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
      message: response === 'interested'
        ? 'You have expressed interest in this opportunity!'
        : 'You have declined this opportunity.'
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/matches/[id]/respond:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
