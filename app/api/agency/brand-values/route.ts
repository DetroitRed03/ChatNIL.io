/**
 * Agency Brand Values API
 *
 * GET /api/agency/brand-values - Get agency's brand values
 * POST /api/agency/brand-values - Set all brand values (replaces existing)
 * PUT /api/agency/brand-values - Add a single brand value
 * DELETE /api/agency/brand-values?id=xxx - Remove a brand value
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getBrandValues,
  setBrandValues,
  addBrandValue,
  removeBrandValue,
  getAvailableTraits,
} from '@/lib/agency/brand-values-service';
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

    // Check if requesting available traits
    if (request.nextUrl.searchParams.get('available') === 'true') {
      const result = await getAvailableTraits();
      return NextResponse.json(result);
    }

    // Get agency profile
    const profileResult = await getAgencyProfile(user.id);
    if (!profileResult.success || !profileResult.data) {
      return NextResponse.json(
        { success: false, error: 'Agency profile not found' },
        { status: 404 }
      );
    }

    const result = await getBrandValues(profileResult.data.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Brand values GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch brand values' },
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

    if (!Array.isArray(body.values)) {
      return NextResponse.json(
        { success: false, error: 'Values must be an array' },
        { status: 400 }
      );
    }

    const result = await setBrandValues(profileResult.data.id, body.values);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Brand values POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to set brand values' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    if (!body.trait_id || !body.priority) {
      return NextResponse.json(
        { success: false, error: 'trait_id and priority are required' },
        { status: 400 }
      );
    }

    const result = await addBrandValue({
      agency_profile_id: profileResult.data.id,
      trait_id: body.trait_id,
      priority: body.priority,
      importance_weight: body.importance_weight,
      notes: body.notes,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Brand values PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add brand value' },
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

    const valueId = request.nextUrl.searchParams.get('id');

    if (!valueId) {
      return NextResponse.json(
        { success: false, error: 'Value ID is required' },
        { status: 400 }
      );
    }

    const result = await removeBrandValue(valueId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Brand values DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove brand value' },
      { status: 500 }
    );
  }
}
