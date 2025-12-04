import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { resolveAthleteName } from '@/lib/utils';

/**
 * GET /api/matches
 * Get athlete matches with filtering and sorting
 *
 * Query params:
 * - userId: User ID (required)
 * - perspective: 'agency' or 'athlete' (auto-detected from user role if not specified)
 * - status: Filter by match status (suggested, saved, contacted, interested, in_discussion, partnered, rejected, expired)
 * - tier: Filter by match tier (excellent, good, potential, poor)
 * - min_score: Minimum match score filter
 * - max_score: Maximum match score filter
 * - sport: Filter by athlete's primary sport
 * - limit: Number of results to return (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Determine if user is agency or athlete
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    const isAgency = userProfile?.role === 'agency' || userProfile?.role === 'brand';
    const perspective = searchParams.get('perspective') || (isAgency ? 'agency' : 'athlete');

    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const minScore = searchParams.get('min_score');
    const maxScore = searchParams.get('max_score');
    const sport = searchParams.get('sport');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // For agencies, get saved athlete IDs to exclude from matches
    let savedAthleteIds: string[] = [];
    if (perspective === 'agency') {
      const { data: savedAthletes } = await supabase
        .from('agency_athlete_lists')
        .select('athlete_id')
        .eq('agency_id', userId);
      savedAthleteIds = savedAthletes?.map(a => a.athlete_id) || [];
    }

    // Build query - agencies see matches where they are agency_id, athletes see where they are athlete_id
    let query = supabase
      .from('agency_athlete_matches')
      .select('*', { count: 'exact' })
      .eq(perspective === 'agency' ? 'agency_id' : 'athlete_id', userId)
      .order('match_score', { ascending: false })
      .range(offset, offset + limit - 1);

    // For agencies, exclude athletes already in saved roster
    if (perspective === 'agency' && savedAthleteIds.length > 0) {
      query = query.not('athlete_id', 'in', `(${savedAthleteIds.join(',')})`);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Only filter by tier if requested and column exists
    // We'll filter in-memory if the column doesn't exist yet
    const filterTierInMemory = !!tier;

    if (tier) {
      try {
        query = query.eq('match_tier', tier);
      } catch (error) {
        console.log('⚠️ [Matches API] match_tier column may not exist yet, will filter in-memory');
      }
    }

    if (minScore) {
      query = query.gte('match_score', parseInt(minScore));
    }

    if (maxScore) {
      query = query.lte('match_score', parseInt(maxScore));
    }

    // Note: Filtering by sport requires joining athlete data or using a filter after fetch
    // For now, we'll fetch and filter in-memory if sport is specified

    const { data: matches, error, count } = await query;

    if (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Batch fetch all related data for efficiency (avoid N+1 queries)
    const athleteIds = matches?.map(m => m.athlete_id).filter(Boolean) || [];
    const agencyIds = matches?.map(m => m.agency_id).filter(Boolean) || [];

    // Fetch all athletes at once (users table - names/email/username)
    const { data: athletes } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, username')
      .in('id', athleteIds);

    // Fetch athlete profiles for sport info
    const { data: athleteProfiles } = await supabase
      .from('athlete_profiles')
      .select('user_id, sport')
      .in('user_id', athleteIds);

    // Fetch full public profile data for athletes (social stats, school, FMV, etc.)
    const { data: publicProfiles, error: publicProfilesError } = await supabase
      .from('athlete_public_profiles')
      .select(`
        user_id,
        display_name,
        school_name,
        graduation_year,
        instagram_followers,
        tiktok_followers,
        twitter_followers,
        youtube_subscribers,
        total_followers,
        avg_engagement_rate,
        estimated_fmv_min,
        estimated_fmv_max,
        is_available_for_partnerships,
        profile_image_url,
        cover_photo_url,
        bio,
        sport,
        position,
        state
      `)
      .in('user_id', athleteIds);

    // Log error only if there's an issue
    if (publicProfilesError) {
      console.error('❌ [Matches API] publicProfiles error:', publicProfilesError.code, publicProfilesError.message);
    }

    // Fetch FMV data from athlete_fmv_data table (contains actual FMV scores)
    const { data: fmvData } = await supabase
      .from('athlete_fmv_data')
      .select('athlete_id, fmv_score, fmv_tier, percentile_rank, is_public_score')
      .in('athlete_id', athleteIds);

    // Fetch all agencies at once
    const { data: agencies } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', agencyIds);

    // Enrich matches with agency and athlete data
    const enrichedMatches = (matches || []).map(match => {
      const athlete = athletes?.find(a => a.id === match.athlete_id);
      const athleteProfile = athleteProfiles?.find(p => p.user_id === match.athlete_id);
      const publicProfile = publicProfiles?.find(p => p.user_id === match.athlete_id);
      const athleteFmv = fmvData?.find(f => f.athlete_id === match.athlete_id);
      const agency = agencies?.find(a => a.id === match.agency_id);

      // Use robust name resolution with fallback chain
      const athleteName = resolveAthleteName({
        firstName: athlete?.first_name,
        lastName: athlete?.last_name,
        email: athlete?.email,
        id: match.athlete_id,
      });

      const agencyName = resolveAthleteName({
        firstName: agency?.first_name,
        lastName: agency?.last_name,
        email: agency?.email,
        id: match.agency_id,
      });

      return {
        ...match,
        agency: agency ? {
          id: agency.id,
          name: agencyName,
          email: agency.email
        } : null,
        athlete: {
          id: match.athlete_id,
          username: athlete?.username,
          name: athleteName,
          first_name: athlete?.first_name || athleteName.split(' ')[0],
          last_name: athlete?.last_name || athleteName.split(' ').slice(1).join(' '),
          email: athlete?.email,
          primary_sport: athleteProfile?.sport,
          // Full public profile data for athlete cards
          display_name: publicProfile?.display_name,
          school_name: publicProfile?.school_name,
          graduation_year: publicProfile?.graduation_year,
          instagram_followers: publicProfile?.instagram_followers || 0,
          tiktok_followers: publicProfile?.tiktok_followers || 0,
          twitter_followers: publicProfile?.twitter_followers || 0,
          youtube_subscribers: publicProfile?.youtube_subscribers || 0,
          total_followers: publicProfile?.total_followers || 0,
          avg_engagement_rate: publicProfile?.avg_engagement_rate || 0,
          estimated_fmv_min: publicProfile?.estimated_fmv_min,
          estimated_fmv_max: publicProfile?.estimated_fmv_max,
          is_available_for_partnerships: publicProfile?.is_available_for_partnerships,
          profile_image_url: publicProfile?.profile_image_url,
          cover_photo_url: publicProfile?.cover_photo_url,
          bio: publicProfile?.bio,
          sport: publicProfile?.sport,
          position: publicProfile?.position,
          state: publicProfile?.state,
          // FMV data from athlete_fmv_data table (only if public)
          fmv_score: athleteFmv?.is_public_score ? athleteFmv.fmv_score : null,
          fmv_tier: athleteFmv?.is_public_score ? athleteFmv.fmv_tier : null,
          percentile_rank: athleteFmv?.is_public_score ? athleteFmv.percentile_rank : null
        }
      };
    });

    // Filter by sport if specified
    let filteredMatches = enrichedMatches;
    if (sport && filteredMatches.length > 0) {
      filteredMatches = filteredMatches.filter(
        match => match.athlete?.primary_sport?.toLowerCase() === sport.toLowerCase()
      );
    }

    // Filter by tier in-memory if column doesn't exist or if query failed
    if (filterTierInMemory && filteredMatches.length > 0) {
      filteredMatches = filteredMatches.filter(m => {
        // Calculate tier from score if match_tier doesn't exist
        if (m.match_tier) {
          return m.match_tier === tier;
        }
        // Fallback: calculate tier from score
        const score = m.match_score;
        const calculatedTier = score >= 75 ? 'excellent' : score >= 55 ? 'good' : score >= 35 ? 'potential' : 'poor';
        return calculatedTier === tier;
      });
    }

    // Calculate summary statistics (gracefully handle missing match_tier)
    const stats = {
      total: count || 0,
      returned: filteredMatches.length,
      by_tier: {
        excellent: filteredMatches.filter(m => {
          const tier = m.match_tier || (m.match_score >= 75 ? 'excellent' : null);
          return tier === 'excellent';
        }).length,
        good: filteredMatches.filter(m => {
          const tier = m.match_tier || (m.match_score >= 55 && m.match_score < 75 ? 'good' : null);
          return tier === 'good';
        }).length,
        potential: filteredMatches.filter(m => {
          const tier = m.match_tier || (m.match_score >= 35 && m.match_score < 55 ? 'potential' : null);
          return tier === 'potential';
        }).length,
        poor: filteredMatches.filter(m => {
          const tier = m.match_tier || (m.match_score < 35 ? 'poor' : null);
          return tier === 'poor';
        }).length
      },
      by_status: {
        suggested: filteredMatches.filter(m => m.status === 'suggested').length,
        saved: filteredMatches.filter(m => m.status === 'saved').length,
        contacted: filteredMatches.filter(m => m.status === 'contacted').length,
        interested: filteredMatches.filter(m => m.status === 'interested').length,
        in_discussion: filteredMatches.filter(m => m.status === 'in_discussion').length,
        partnered: filteredMatches.filter(m => m.status === 'partnered').length,
        rejected: filteredMatches.filter(m => m.status === 'rejected').length,
        expired: filteredMatches.filter(m => m.status === 'expired').length
      }
    };

    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      stats,
      pagination: {
        limit,
        offset,
        total: count || 0,
        has_more: (offset + limit) < (count || 0)
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
