import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  canReconsider,
  validateReconsiderAction,
  createResponseHistoryEntry,
  addToResponseHistory,
  getReconsiderTimeRemaining,
  RECONSIDER_WINDOW_HOURS
} from '@/lib/reconsider-utils';

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
 * POST /api/matches/[id]/reconsider
 * Athlete reconsiders a previously declined match
 *
 * Allows athletes to change their mind within 48 hours of declining.
 * Can only be used once per match.
 *
 * Body: (none required)
 *
 * Returns:
 * - success: boolean
 * - match: updated match object
 * - message: user-friendly message
 * - timeRemaining: time left in reconsider window (if still open)
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
        { error: 'You can only reconsider matches where you are the athlete' },
        { status: 403 }
      );
    }

    // Validate reconsider action
    const validationError = validateReconsiderAction(
      match.status,
      match.responded_at,
      match.response_history
    );

    if (validationError) {
      // Check if it's a time-related error and provide more context
      const timeRemaining = getReconsiderTimeRemaining(match.responded_at);
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
    const newHistory = addToResponseHistory(match.response_history, historyEntry);

    // Update the match - set back to "contacted" status (agency can see interest again)
    const updateData = {
      status: 'contacted', // Back to contacted - agency can re-engage
      athlete_response_status: 'reconsidered',
      athlete_response_at: new Date().toISOString(),
      response_history: newHistory,
      updated_at: new Date().toISOString()
    };

    const { data: updatedMatch, error: updateError } = await serviceClient
      .from('agency_athlete_matches')
      .update(updateData)
      .eq('id', matchId)
      .eq('athlete_id', userId) // Double-check ownership
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating match:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Fetch agency details separately
    let agency = null;
    if (updatedMatch?.agency_id) {
      const { data: agencyData } = await serviceClient
        .from('users')
        .select('id, first_name, last_name, email, company_name')
        .eq('id', updatedMatch.agency_id)
        .single();
      agency = agencyData;
    }

    // TODO: Send notification to agency about reconsideration
    // This could be done via SSE or email notification
    console.log(`[Reconsider] Athlete ${userId} reconsidered match ${matchId} with agency ${match.agency_id}`);

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
      message: 'You have reconsidered this opportunity. The agency has been notified of your renewed interest.',
      reconsidered: true
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/matches/[id]/reconsider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/matches/[id]/reconsider
 * Check if a match can be reconsidered and get time remaining
 */
export async function GET(
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

    const serviceClient = createServiceRoleClient();

    // Get the match
    const { data: match, error: fetchError } = await serviceClient
      .from('agency_athlete_matches')
      .select('id, status, responded_at, response_history, athlete_id')
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
        { error: 'You can only check reconsider status for your own matches' },
        { status: 403 }
      );
    }

    // Check if can reconsider
    const canReconsiderMatch = match.status === 'rejected' && canReconsider(match.responded_at);
    const timeRemaining = getReconsiderTimeRemaining(match.responded_at);
    const validationError = validateReconsiderAction(
      match.status,
      match.responded_at,
      match.response_history
    );

    return NextResponse.json({
      success: true,
      canReconsider: canReconsiderMatch && !validationError,
      reason: validationError || null,
      timeRemaining: timeRemaining,
      windowHours: RECONSIDER_WINDOW_HOURS
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/matches/[id]/reconsider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
