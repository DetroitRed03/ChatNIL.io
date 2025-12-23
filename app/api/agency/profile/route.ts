import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/agency/profile
 * Update agency-specific profile fields
 *
 * Body:
 * - company_name: string
 * - industry: string
 * - company_size: string
 * - website_url: string
 * - target_demographics: object
 * - campaign_interests: string[]
 * - budget_range: string
 * - geographic_focus: string[]
 * - brand_values: string[]
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an agency
    const { data: currentProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (currentProfile.role !== 'agency') {
      return NextResponse.json(
        { error: 'This endpoint is only available for agencies' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Prepare updates object (only agency-specific fields)
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    // Agency-specific fields
    if (body.company_name !== undefined) updates.company_name = body.company_name;
    if (body.industry !== undefined) updates.industry = body.industry;
    if (body.company_size !== undefined) updates.company_size = body.company_size;
    if (body.website_url !== undefined) updates.website_url = body.website_url;
    if (body.target_demographics !== undefined) updates.target_demographics = body.target_demographics;
    if (body.campaign_interests !== undefined) updates.campaign_interests = body.campaign_interests;
    if (body.budget_range !== undefined) updates.budget_range = body.budget_range;
    if (body.geographic_focus !== undefined) updates.geographic_focus = body.geographic_focus;
    if (body.brand_values !== undefined) updates.brand_values = body.brand_values;

    // Optional: company description and verification fields
    if (body.company_description !== undefined) updates.company_description = body.company_description;
    if (body.verification_status !== undefined) updates.verification_status = body.verification_status;
    if (body.verification_documents !== undefined) updates.verification_documents = body.verification_documents;

    // Use service role client to ensure update succeeds (bypasses RLS)
    const serviceClient = createServiceRoleClient();

    const { data: updatedUser, error: updateError } = await serviceClient
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating agency profile:', updateError);
      return NextResponse.json(
        { error: updateError.message, details: updateError.details },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Agency profile updated successfully'
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/agency/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agency/profile
 * Get agency profile
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching agency profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (profile.role !== 'agency') {
      return NextResponse.json(
        { error: 'This endpoint is only available for agencies' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: profile
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/agency/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
