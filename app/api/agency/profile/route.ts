import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  getAgencyProfile,
  getAgencyProfileWithRelations,
  createAgencyProfile,
  updateAgencyProfile,
  completeAgencyOnboarding,
  updateOnboardingStep,
  hasAgencyProfile,
} from '@/lib/agency/profile-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agency/profile
 * Get agency profile from agency_profiles table or users table
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient();

    // Check if user has an agency profile in the new table
    const hasNewProfile = await hasAgencyProfile(user.id, serviceClient);

    if (hasNewProfile) {
      // Use new agency_profiles table
      const includeRelations = request.nextUrl.searchParams.get('include') === 'all';

      const result = includeRelations
        ? await getAgencyProfileWithRelations(user.id, serviceClient)
        : await getAgencyProfile(user.id, serviceClient);

      if (!result.success) {
        return NextResponse.json(result, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        profile: result.data,
        source: 'agency_profiles'
      });
    }

    // Fall back to legacy users table
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
      user: profile,
      source: 'users'
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/agency/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agency/profile
 * Create agency profile in agency_profiles table
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.company_name || !body.industry) {
      return NextResponse.json(
        { success: false, error: 'Company name and industry are required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    const result = await createAgencyProfile({
      user_id: user.id,
      company_name: body.company_name,
      industry: body.industry,
      description: body.description,
      tagline: body.tagline,
      website: body.website,
      company_size: body.company_size,
      founded_year: body.founded_year,
      headquarters_city: body.headquarters_city,
      headquarters_state: body.headquarters_state,
      contact_name: body.contact_name,
      contact_email: body.contact_email || user.email,
      contact_phone: body.contact_phone,
      logo_url: body.logo_url,
      linkedin_url: body.linkedin_url,
      instagram_url: body.instagram_url,
      twitter_url: body.twitter_url,
    }, serviceClient);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/agency/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agency/profile
 * Update agency-specific profile fields
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceRoleClient();
    const body = await request.json();

    // Check if user has new agency profile
    const hasNewProfile = await hasAgencyProfile(user.id, serviceClient);

    if (hasNewProfile) {
      // Handle special actions
      if (body.action === 'complete_onboarding') {
        const result = await completeAgencyOnboarding(user.id, serviceClient);
        return NextResponse.json(result);
      }

      if (body.action === 'update_step') {
        const result = await updateOnboardingStep(user.id, body.step, serviceClient);
        return NextResponse.json(result);
      }

      // Regular update using new service
      const result = await updateAgencyProfile(user.id, {
        company_name: body.company_name,
        industry: body.industry,
        description: body.description,
        tagline: body.tagline,
        website: body.website,
        company_size: body.company_size,
        founded_year: body.founded_year,
        headquarters_city: body.headquarters_city,
        headquarters_state: body.headquarters_state,
        contact_name: body.contact_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        logo_url: body.logo_url,
        linkedin_url: body.linkedin_url,
        instagram_url: body.instagram_url,
        twitter_url: body.twitter_url,
      }, serviceClient);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result);
    }

    // Legacy update for users table
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

    // Prepare updates object (only agency-specific fields)
    const updates: Record<string, unknown> = {
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
