/**
 * Athlete Campaign Matches API
 * GET /api/matches/athlete/[id]
 *
 * Returns all matching campaigns for a specific athlete.
 * This is the athlete-side view of the matchmaking system.
 *
 * Query Parameters:
 * - minScore: Minimum match score (default: 30)
 * - limit: Maximum results (default: 50)
 * - offset: Pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { findCampaignMatches } from '@/lib/campaign-matchmaking';
import { isAthleteRole } from '@/types/common';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const athleteId = resolvedParams.id;

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const minScore = parseInt(searchParams.get('minScore') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`Finding campaign matches for athlete: ${athleteId}`);

    const supabase = supabaseAdmin;

    // Verify the athlete exists
    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .select('id, first_name, last_name, role')
      .eq('id', athleteId)
      .single();

    if (athleteError || !athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    if (!isAthleteRole(athlete.role)) {
      return NextResponse.json(
        { error: 'User is not an athlete' },
        { status: 403 }
      );
    }

    // First, check for pre-computed matches in agency_athlete_matches table
    // Note: This table stores agency-athlete matches with columns: id, agency_id, athlete_id, match_score, tier, status, match_reasons
    const { data: storedMatches, error: storedError } = await supabase
      .from('agency_athlete_matches')
      .select('*')
      .eq('athlete_id', athleteId)
      .gte('match_score', minScore)
      .order('match_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!storedError && storedMatches && storedMatches.length > 0) {
      // Get agency names from the agencies table
      const agencyIds = Array.from(new Set(storedMatches.map(m => m.agency_id).filter(Boolean)));
      const { data: agencies } = await supabase
        .from('agencies')
        .select('id, company_name')
        .in('id', agencyIds);

      // Also get agency user info as fallback
      const { data: agencyUsers } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .in('id', agencyIds);

      const agencyMap = new Map(agencies?.map(a => [a.id, a.company_name]) || []);
      const agencyUserMap = new Map(agencyUsers?.map(u => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]) || []);

      // Transform to response format (agency-based matches)
      const matches = storedMatches.map(match => {
        const agencyName = agencyMap.get(match.agency_id) || agencyUserMap.get(match.agency_id) || 'Brand Partner';
        // Map tier field to match_tier: high->excellent, medium->good, low->fair
        const matchTier = match.tier === 'high' ? 'excellent' :
                          match.tier === 'medium' ? 'good' :
                          match.tier === 'low' ? 'fair' : 'fair';

        return {
          id: match.id,
          agency_id: match.agency_id,
          brand_name: agencyName,
          match_score: match.match_score,
          match_tier: matchTier,
          strengths: match.match_reasons || [],
          status: match.status,
          created_at: match.created_at,
        };
      });

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('agency_athlete_matches')
        .select('*', { count: 'exact', head: true })
        .eq('athlete_id', athleteId)
        .gte('match_score', minScore);

      return NextResponse.json({
        athlete: {
          id: athlete.id,
          name: `${athlete.first_name} ${athlete.last_name}`
        },
        matches,
        total: totalCount || matches.length,
        summary: {
          excellent: matches.filter(m => m.match_tier === 'excellent').length,
          good: matches.filter(m => m.match_tier === 'good').length,
          fair: matches.filter(m => m.match_tier === 'fair').length,
          avgScore: matches.length > 0
            ? Math.round(matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length)
            : 0
        },
        pagination: {
          total: totalCount || matches.length,
          limit,
          offset,
          hasMore: (totalCount || matches.length) > offset + limit
        },
        source: 'cached'
      });
    }

    // If no stored agency matches, try to calculate campaign matches on-the-fly
    console.log('No cached agency matches found, calculating campaign matches on-the-fly...');

    // Get all active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('agency_campaigns')
      .select('id, name, description, campaign_type, status, budget, agency_id')
      .eq('status', 'active');

    if (campaignsError || !campaigns || campaigns.length === 0) {
      return NextResponse.json({
        athlete: {
          id: athlete.id,
          name: `${athlete.first_name} ${athlete.last_name}`
        },
        matches: [],
        total: 0,
        message: 'No active campaigns available',
        pagination: { total: 0, limit, offset, hasMore: false },
        source: 'live'
      });
    }

    // Get agency names from the agencies table
    const agencyIds = Array.from(new Set(campaigns.map(c => c.agency_id).filter(Boolean)));
    const { data: agencies } = await supabase
      .from('agencies')
      .select('id, company_name')
      .in('id', agencyIds);

    const agencyMap = new Map(agencies?.map(a => [a.id, a.company_name]) || []);

    // Run matchmaking for each campaign
    const allMatches: any[] = [];

    for (const campaign of campaigns) {
      try {
        const matches = await findCampaignMatches(campaign.id, {
          minMatchScore: minScore,
          maxResults: 100,
          includeBreakdown: true,
        });

        // Find this athlete in the matches
        const athleteMatch = matches?.find(m => m.athleteId === athleteId);

        if (athleteMatch && athleteMatch.matchPercentage >= minScore) {
          allMatches.push({
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            campaign_description: campaign.description,
            campaign_type: campaign.campaign_type,
            campaign_status: campaign.status,
            brand_name: agencyMap.get(campaign.agency_id) || 'Brand Partner',
            match_score: athleteMatch.matchPercentage,
            match_tier: athleteMatch.matchPercentage >= 80 ? 'excellent' :
                        athleteMatch.matchPercentage >= 60 ? 'good' :
                        athleteMatch.matchPercentage >= 40 ? 'fair' : 'low',
            confidence: athleteMatch.confidence,
            recommended_offer_low: Math.floor(athleteMatch.recommendedOffer * 0.9),
            recommended_offer_high: Math.floor(athleteMatch.recommendedOffer * 1.1),
            strengths: athleteMatch.strengths,
            concerns: athleteMatch.concerns,
            score_breakdown: athleteMatch.matchScore,
            status: 'pending',
          });
        }
      } catch (error) {
        console.error(`Error matching campaign ${campaign.id}:`, error);
        // Continue with other campaigns
      }
    }

    // Sort by match score
    allMatches.sort((a, b) => b.match_score - a.match_score);

    // Apply pagination
    const paginatedMatches = allMatches.slice(offset, offset + limit);

    return NextResponse.json({
      athlete: {
        id: athlete.id,
        name: `${athlete.first_name} ${athlete.last_name}`
      },
      matches: paginatedMatches,
      total: allMatches.length,
      summary: {
        excellent: allMatches.filter(m => m.match_tier === 'excellent').length,
        good: allMatches.filter(m => m.match_tier === 'good').length,
        fair: allMatches.filter(m => m.match_tier === 'fair').length,
        avgScore: allMatches.length > 0
          ? Math.round(allMatches.reduce((sum, m) => sum + m.match_score, 0) / allMatches.length)
          : 0
      },
      pagination: {
        total: allMatches.length,
        limit,
        offset,
        hasMore: allMatches.length > offset + limit
      },
      source: 'live'
    });

  } catch (error) {
    console.error('Error in athlete matches API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
