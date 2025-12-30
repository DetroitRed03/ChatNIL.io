import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Public Brand Profile API
 * GET /api/brands/[slug]
 *
 * Fetches public brand profile by slug - no authentication required
 */

function getServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Fetch agency profile by slug
    const { data: profile, error: profileError } = await supabase
      .from('agency_profiles')
      .select(`
        id,
        user_id,
        company_name,
        slug,
        logo_url,
        website,
        industry,
        description,
        tagline,
        company_size,
        founded_year,
        headquarters_city,
        headquarters_state,
        linkedin_url,
        instagram_url,
        twitter_url,
        is_verified,
        is_active,
        onboarding_completed,
        created_at
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Brand not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching brand profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch brand profile' },
        { status: 500 }
      );
    }

    // Fetch brand values with trait details
    const { data: brandValues, error: valuesError } = await supabase
      .from('agency_brand_values')
      .select(`
        id,
        trait_id,
        priority,
        trait:core_traits (
          id,
          name,
          display_name,
          description,
          category
        )
      `)
      .eq('agency_profile_id', profile.id)
      .order('priority', { ascending: true });

    if (valuesError) {
      console.error('Error fetching brand values:', valuesError);
    }

    // Fetch target criteria
    const { data: targetCriteria, error: criteriaError } = await supabase
      .from('agency_target_criteria')
      .select(`
        target_sports,
        min_followers,
        max_followers,
        target_states,
        target_school_levels,
        min_engagement_rate,
        graduation_years
      `)
      .eq('agency_profile_id', profile.id)
      .single();

    if (criteriaError && criteriaError.code !== 'PGRST116') {
      console.error('Error fetching target criteria:', criteriaError);
    }

    // Get industry display name
    const { data: industryData } = await supabase
      .from('industry_options')
      .select('display_name, icon')
      .eq('name', profile.industry)
      .single();

    // Build public profile response
    const publicProfile = {
      company_name: profile.company_name,
      slug: profile.slug,
      logo_url: profile.logo_url,
      website: profile.website,
      industry: profile.industry,
      industry_display: industryData?.display_name || profile.industry,
      industry_icon: industryData?.icon,
      description: profile.description,
      tagline: profile.tagline,
      company_size: profile.company_size,
      founded_year: profile.founded_year,
      location: profile.headquarters_city && profile.headquarters_state
        ? `${profile.headquarters_city}, ${profile.headquarters_state}`
        : profile.headquarters_state || profile.headquarters_city || null,
      social_links: {
        linkedin: profile.linkedin_url,
        instagram: profile.instagram_url,
        twitter: profile.twitter_url,
      },
      is_verified: profile.is_verified,
      brand_values: (brandValues || []).map((bv: any) => ({
        id: bv.trait_id,
        name: bv.trait?.name || '',
        display_name: bv.trait?.display_name || '',
        description: bv.trait?.description,
        category: bv.trait?.category,
        priority: bv.priority,
      })),
      target_criteria: targetCriteria ? {
        sports: targetCriteria.target_sports || [],
        min_followers: targetCriteria.min_followers || 0,
        school_levels: targetCriteria.target_school_levels || [],
        states: targetCriteria.target_states || [],
      } : null,
      user_id: profile.user_id, // Include for ownership check
    };

    return NextResponse.json({
      success: true,
      profile: publicProfile,
    });
  } catch (error) {
    console.error('Brands API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
