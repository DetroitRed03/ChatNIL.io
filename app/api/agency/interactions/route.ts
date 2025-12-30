/**
 * Agency Interactions API
 *
 * GET /api/agency/interactions - Get all interactions for agency
 * POST /api/agency/interactions - Create/update interaction (view, save, etc.)
 * PATCH /api/agency/interactions - Update interaction status or notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getAgencyInteractions,
  getSavedAthletes,
  recordAthleteView,
  saveAthlete,
  unsaveAthlete,
  updateInteractionStatus,
  updateInteractionNotes,
  getInteractionCounts,
} from '@/lib/agency/interactions-service';
import { getAgencyProfile } from '@/lib/agency/profile-service';
import type { InteractionStatus } from '@/types/agency';

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get agency profile
    const profileResult = await getAgencyProfile(user.id);
    if (!profileResult.success || !profileResult.data) {
      return NextResponse.json(
        { success: false, error: 'Agency profile not found' },
        { status: 404 }
      );
    }

    const agencyProfileId = profileResult.data.id;
    const params = request.nextUrl.searchParams;

    // Check if requesting counts
    if (params.get('counts') === 'true') {
      const result = await getInteractionCounts(agencyProfileId);
      return NextResponse.json(result);
    }

    // Check if requesting saved only
    if (params.get('saved') === 'true') {
      const limit = parseInt(params.get('limit') || '50');
      const result = await getSavedAthletes(agencyProfileId, limit);
      return NextResponse.json(result);
    }

    // Get all interactions with optional filters
    const statusParam = params.get('status');
    const status = statusParam ? statusParam.split(',') as InteractionStatus[] : undefined;
    const limit = parseInt(params.get('limit') || '50');
    const offset = parseInt(params.get('offset') || '0');

    const result = await getAgencyInteractions(agencyProfileId, { status, limit, offset });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Interactions GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get agency profile
    const profileResult = await getAgencyProfile(user.id);
    if (!profileResult.success || !profileResult.data) {
      return NextResponse.json(
        { success: false, error: 'Agency profile not found' },
        { status: 404 }
      );
    }

    const agencyProfileId = profileResult.data.id;
    const body = await request.json();

    if (!body.athlete_user_id) {
      return NextResponse.json(
        { success: false, error: 'athlete_user_id is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    const action = body.action || 'view';

    let result;

    switch (action) {
      case 'view':
        result = await recordAthleteView(agencyProfileId, body.athlete_user_id);
        break;

      case 'save':
        result = await saveAthlete(agencyProfileId, body.athlete_user_id, body.notes);
        break;

      case 'unsave':
        result = await unsaveAthlete(agencyProfileId, body.athlete_user_id);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Interactions POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.interaction_id) {
      return NextResponse.json(
        { success: false, error: 'interaction_id is required' },
        { status: 400 }
      );
    }

    // Update status or notes
    let result;

    if (body.status) {
      result = await updateInteractionStatus(body.interaction_id, body.status, body.notes);
    } else if (body.notes !== undefined) {
      result = await updateInteractionNotes(body.interaction_id, body.notes);
    } else {
      return NextResponse.json(
        { success: false, error: 'status or notes is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Interactions PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update interaction' },
      { status: 500 }
    );
  }
}
