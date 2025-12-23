import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Agency Discovery API
 *
 * GET /api/agency/discover?sport=Basketball&school=UCLA&minFollowers=10000
 *
 * Returns athlete profiles with filtering and match scoring:
 * - Filters: sport, school, minFollowers, maxBudget
 * - Includes social media stats (joined data)
 * - Calculates match score (0-100)
 * - Paginated results
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const sport = searchParams.get('sport');
    const school = searchParams.get('school');
    const minFollowers = searchParams.get('minFollowers')
      ? parseInt(searchParams.get('minFollowers')!)
      : 0;
    const maxBudget = searchParams.get('maxBudget')
      ? parseInt(searchParams.get('maxBudget')!)
      : null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Fetch athlete profiles
    let profileQuery = supabase
      .from('athlete_profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (sport) {
      profileQuery = profileQuery.ilike('sport', sport);
    }
    if (school) {
      profileQuery = profileQuery.ilike('school', school);
    }
    if (maxBudget) {
      profileQuery = profileQuery.lte('estimated_fmv', maxBudget);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    profileQuery = profileQuery.range(from, to);

    // Execute query
    const { data: profiles, error: profileError, count } = await profileQuery;

    if (profileError) {
      console.error('Error fetching athlete profiles:', profileError);
      throw profileError;
    }

    // Fetch social media stats separately
    const userIds = profiles?.map(p => p.user_id) || [];
    const { data: socialStats, error: socialError } = await supabase
      .from('social_media_stats')
      .select('*')
      .in('user_id', userIds);

    if (socialError) {
      console.error('Error fetching social stats:', socialError);
      // Don't throw - social stats are optional
    }

    // Create a map of social stats by user_id
    const socialStatsMap = new Map(
      socialStats?.map(s => [s.user_id, s]) || []
    );

    // Calculate match scores and format response
    const athletes = (profiles || [])
      .map(profile => {
        // Get social stats from map
        const socialStat = socialStatsMap.get(profile.user_id);

        const totalFollowers = socialStat?.total_followers ||
          (socialStat?.instagram_followers || 0) +
          (socialStat?.tiktok_followers || 0) +
          (socialStat?.twitter_followers || 0) +
          (socialStat?.youtube_subscribers || 0);

        const engagementRate = socialStat?.engagement_rate || 0;

        // Calculate match score (0-100)
        let matchScore = 50; // Base score

        // +20 if total followers > 100k
        if (totalFollowers > 100000) {
          matchScore += 20;
        }

        // +15 if engagement rate > 5%
        if (engagementRate > 5) {
          matchScore += 15;
        }

        // +15 if sport matches filter (user is interested in this sport)
        if (sport && profile.sport?.toLowerCase() === sport.toLowerCase()) {
          matchScore += 15;
        }

        // Cap at 100
        matchScore = Math.min(matchScore, 100);

        return {
          id: profile.user_id,
          userId: profile.user_id,
          sport: profile.sport,
          school: profile.school,
          position: profile.position,
          year: profile.year,
          height: profile.height,
          weight: profile.weight,
          estimatedFmv: profile.estimated_fmv,
          profilePhotoUrl: profile.profile_photo_url,
          bio: profile.bio,
          achievements: profile.achievements || [],
          followers: {
            instagram: socialStat?.instagram_followers || 0,
            tiktok: socialStat?.tiktok_followers || 0,
            twitter: socialStat?.twitter_followers || 0,
            youtube: socialStat?.youtube_subscribers || 0,
            total: totalFollowers,
          },
          engagementRate,
          matchScore,
          createdAt: profile.created_at,
        };
      })
      // Filter by min followers (post-query since it's in joined table)
      .filter(athlete => athlete.followers.total >= minFollowers)
      // Sort by match score descending
      .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      athletes,
      total: count || 0,
      page,
      limit,
      hasMore: count ? (page * limit) < count : false,
    });

  } catch (error) {
    console.error('Discovery API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch athletes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
