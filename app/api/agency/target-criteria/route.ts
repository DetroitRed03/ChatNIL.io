/**
 * Agency Target Criteria API
 *
 * GET /api/agency/target-criteria - Get agency's target criteria
 * POST /api/agency/target-criteria - Create or update target criteria
 * DELETE /api/agency/target-criteria - Clear target criteria
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getTargetCriteria,
  upsertTargetCriteria,
  deleteTargetCriteria,
} from '@/lib/agency/target-criteria-service';
import { getAgencyProfile } from '@/lib/agency/profile-service';

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

    const result = await getTargetCriteria(profileResult.data.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Target criteria GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch target criteria' },
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

    const body = await request.json();

    const result = await upsertTargetCriteria({
      agency_profile_id: profileResult.data.id,
      target_sports: body.target_sports,
      min_followers: body.min_followers,
      max_followers: body.max_followers,
      target_states: body.target_states,
      target_regions: body.target_regions,
      target_school_levels: body.target_school_levels,
      min_fmv: body.min_fmv,
      max_fmv: body.max_fmv,
      min_engagement_rate: body.min_engagement_rate,
      preferred_archetypes: body.preferred_archetypes,
      additional_criteria: body.additional_criteria,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Target criteria POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save target criteria' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const result = await deleteTargetCriteria(profileResult.data.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Target criteria DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete target criteria' },
      { status: 500 }
    );
  }
}
