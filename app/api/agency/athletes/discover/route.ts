import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Athlete Discovery API for Agencies
 *
 * GET /api/agency/athletes/discover
 *
 * Query Parameters:
 * - sports[] - Filter by sport(s) (e.g., Basketball, Football)
 * - states[] - Filter by state(s) (e.g., KY, CA)
 * - school_levels[] - Filter by school level (high_school, college)
 * - min_followers - Minimum total followers
 * - max_followers - Maximum total followers
 * - min_fmv - Minimum FMV
 * - max_fmv - Maximum FMV budget
 * - min_engagement - Minimum engagement rate (%)
 * - available_only - Only show available athletes (true/false)
 * - search - Text search on athlete name, school name
 * - content_categories[] - Filter by content categories
 * - brand_values[] - Filter by brand values
 * - sort - Sort order: best_match, followers_desc, followers_asc, engagement_desc, fmv_desc, fmv_asc
 * - page - Page number (default: 1)
 * - limit - Results per page (default: 20, max: 100)
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    // Filters
    const sports = searchParams.getAll('sports[]');
    const states = searchParams.getAll('states[]');
    const schoolLevels = searchParams.getAll('school_levels[]');
    const minFollowers = searchParams.get('min_followers') ? parseInt(searchParams.get('min_followers')!) : null;
    const maxFollowers = searchParams.get('max_followers') ? parseInt(searchParams.get('max_followers')!) : null;
    const minFmv = searchParams.get('min_fmv') ? parseInt(searchParams.get('min_fmv')!) : null;
    const maxFmv = searchParams.get('max_fmv') ? parseInt(searchParams.get('max_fmv')!) : null;
    const minEngagement = searchParams.get('min_engagement') ? parseFloat(searchParams.get('min_engagement')!) : null;
    const availableOnly = searchParams.get('available_only') === 'true';
    const searchQuery = searchParams.get('search') || '';
    const contentCategories = searchParams.getAll('content_categories[]');
    const brandValues = searchParams.getAll('brand_values[]');

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Sort
    const sort = searchParams.get('sort') || 'best_match';

    // Build query using athlete_public_profiles (comprehensive schema)
    let query = supabase
      .from('athlete_public_profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (sports.length > 0) {
      query = query.in('sport', sports);
    }

    if (states.length > 0) {
      query = query.in('state', states);
    }

    if (schoolLevels.length > 0) {
      query = query.in('school_level', schoolLevels);
    }

    if (minFollowers !== null) {
      query = query.gte('total_followers', minFollowers);
    }

    if (maxFollowers !== null) {
      query = query.lte('total_followers', maxFollowers);
    }

    // Search on display name
    if (searchQuery.trim()) {
      query = query.or(`display_name.ilike.%${searchQuery}%,school_name.ilike.%${searchQuery}%`);
    }

    // FMV filtering - use min/max fields from athlete_public_profiles
    if (minFmv !== null) {
      query = query.gte('estimated_fmv_min', minFmv);
    }

    if (maxFmv !== null) {
      query = query.lte('estimated_fmv_max', maxFmv);
    }

    if (minEngagement !== null) {
      query = query.gte('avg_engagement_rate', minEngagement);
    }

    if (availableOnly) {
      query = query.eq('is_available_for_partnerships', true);
    }

    if (contentCategories.length > 0) {
      query = query.overlaps('content_categories', contentCategories);
    }

    if (brandValues.length > 0) {
      query = query.overlaps('brand_values', brandValues);
    }

    // Apply sorting
    switch (sort) {
      case 'followers_desc':
        query = query.order('total_followers', { ascending: false });
        break;
      case 'followers_asc':
        query = query.order('total_followers', { ascending: true });
        break;
      case 'engagement_desc':
        query = query.order('avg_engagement_rate', { ascending: false });
        break;
      case 'engagement_asc':
        query = query.order('avg_engagement_rate', { ascending: true });
        break;
      case 'fmv_desc':
        query = query.order('estimated_fmv_max', { ascending: false });
        break;
      case 'fmv_asc':
        query = query.order('estimated_fmv_min', { ascending: true });
        break;
      case 'best_match':
      default:
        // Best match: prioritize available athletes, then followers, then engagement
        query = query
          .order('is_available_for_partnerships', { ascending: false })
          .order('total_followers', { ascending: false })
          .order('avg_engagement_rate', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: athletes, error, count } = await query;

    if (error) {
      console.error('Error fetching athletes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch athletes' },
        { status: 500 }
      );
    }

    // Fetch FMV data and user details for all athletes to enrich profiles
    const athleteIds = athletes?.map(a => a.user_id).filter(Boolean) || [];
    let enrichedAthletes = athletes || [];

    if (athleteIds.length > 0) {
      // Fetch FMV data and user details (including avatar) in parallel
      const [fmvResult, usersResult] = await Promise.all([
        supabase
          .from('athlete_fmv_data')
          .select('athlete_id, fmv_score, fmv_tier, percentile_rank, is_public_score')
          .in('athlete_id', athleteIds),
        supabase
          .from('users')
          .select('id, username, profile_photo, avatar_url, full_name')
          .in('id', athleteIds)
      ]);

      const fmvData = fmvResult.data;
      const usersData = usersResult.data;

      // Enrich athletes with FMV data, username, and avatar
      enrichedAthletes = (athletes || []).map(athlete => {
        const athleteFmv = fmvData?.find(f => f.athlete_id === athlete.user_id && f.is_public_score);
        const userData = usersData?.find(u => u.id === athlete.user_id);
        return {
          ...athlete,
          username: userData?.username || null,
          full_name: userData?.full_name || athlete.display_name || null,
          avatar_url: userData?.avatar_url || userData?.profile_photo || athlete.profile_image_url || null,
          profile_photo: userData?.profile_photo || null,
          fmv_score: athleteFmv?.fmv_score || null,
          fmv_tier: athleteFmv?.fmv_tier || null,
          percentile_rank: athleteFmv?.percentile_rank || null
        };
      });
    }

    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        athletes: enrichedAthletes,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          sports: sports.length > 0 ? sports : null,
          states: states.length > 0 ? states : null,
          schoolLevels: schoolLevels.length > 0 ? schoolLevels : null,
          minFollowers,
          maxFollowers,
          minFmv,
          maxFmv,
          minEngagement,
          availableOnly: availableOnly || null,
          searchQuery: searchQuery || null,
          contentCategories: contentCategories.length > 0 ? contentCategories : null,
          brandValues: brandValues.length > 0 ? brandValues : null
        },
        sort
      }
    });

  } catch (error) {
    console.error('Unexpected error in athlete discovery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agency/athletes/discover
 *
 * Alternative endpoint for complex queries with body payload
 * Useful for very complex filter combinations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse request body
    const body = await request.json();
    const {
      sports = [],
      states = [],
      school_levels = [],
      min_followers = null,
      max_followers = null,
      min_fmv = null,
      max_fmv = null,
      min_engagement = null,
      available_only = false,
      search = '',
      content_categories = [],
      brand_values = [],
      page = 1,
      limit = 20,
      sort = 'best_match'
    } = body;

    // Build query (same logic as GET)
    let query = supabase
      .from('athlete_public_profiles')
      .select('*', { count: 'exact' });

    if (sports.length > 0) query = query.in('sport', sports);
    if (states.length > 0) query = query.in('state', states);
    if (school_levels.length > 0) query = query.in('school_level', school_levels);
    if (min_followers !== null) query = query.gte('total_followers', min_followers);
    if (max_followers !== null) query = query.lte('total_followers', max_followers);
    if (min_fmv !== null) query = query.gte('estimated_fmv_min', min_fmv);
    if (max_fmv !== null) query = query.lte('estimated_fmv_max', max_fmv);
    if (min_engagement !== null) query = query.gte('avg_engagement_rate', min_engagement);
    if (available_only) query = query.eq('is_available_for_partnerships', true);
    if (search.trim()) query = query.textSearch('display_name', search, { type: 'websearch', config: 'english' });
    if (content_categories.length > 0) query = query.overlaps('content_categories', content_categories);
    if (brand_values.length > 0) query = query.overlaps('brand_values', brand_values);

    // Apply sorting
    switch (sort) {
      case 'followers_desc':
        query = query.order('total_followers', { ascending: false });
        break;
      case 'followers_asc':
        query = query.order('total_followers', { ascending: true });
        break;
      case 'engagement_desc':
        query = query.order('avg_engagement_rate', { ascending: false });
        break;
      case 'engagement_asc':
        query = query.order('avg_engagement_rate', { ascending: true });
        break;
      case 'fmv_desc':
        query = query.order('estimated_fmv_max', { ascending: false });
        break;
      case 'fmv_asc':
        query = query.order('estimated_fmv_min', { ascending: true });
        break;
      case 'best_match':
      default:
        query = query
          .order('is_available_for_partnerships', { ascending: false })
          .order('total_followers', { ascending: false })
          .order('avg_engagement_rate', { ascending: false });
        break;
    }

    // Apply pagination
    const offset = (page - 1) * Math.min(limit, 100);
    query = query.range(offset, offset + Math.min(limit, 100) - 1);

    const { data: athletes, error, count } = await query;

    if (error) {
      console.error('Error fetching athletes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch athletes' },
        { status: 500 }
      );
    }

    // Fetch FMV data and user details for all athletes to enrich profiles
    const athleteIds = athletes?.map(a => a.user_id).filter(Boolean) || [];
    let enrichedAthletes = athletes || [];

    if (athleteIds.length > 0) {
      // Fetch FMV data and user details (including avatar) in parallel
      const [fmvResult, usersResult] = await Promise.all([
        supabase
          .from('athlete_fmv_data')
          .select('athlete_id, fmv_score, fmv_tier, percentile_rank, is_public_score')
          .in('athlete_id', athleteIds),
        supabase
          .from('users')
          .select('id, username, profile_photo, avatar_url, full_name')
          .in('id', athleteIds)
      ]);

      const fmvData = fmvResult.data;
      const usersData = usersResult.data;

      // Enrich athletes with FMV data, username, and avatar
      enrichedAthletes = (athletes || []).map(athlete => {
        const athleteFmv = fmvData?.find(f => f.athlete_id === athlete.user_id && f.is_public_score);
        const userData = usersData?.find(u => u.id === athlete.user_id);
        return {
          ...athlete,
          username: userData?.username || null,
          full_name: userData?.full_name || athlete.display_name || null,
          avatar_url: userData?.avatar_url || userData?.profile_photo || athlete.profile_image_url || null,
          profile_photo: userData?.profile_photo || null,
          fmv_score: athleteFmv?.fmv_score || null,
          fmv_tier: athleteFmv?.fmv_tier || null,
          percentile_rank: athleteFmv?.percentile_rank || null
        };
      });
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      success: true,
      data: {
        athletes: enrichedAthletes,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: body,
        sort
      }
    });

  } catch (error) {
    console.error('Unexpected error in athlete discovery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
