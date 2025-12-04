import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateMatchScore } from '@/lib/matchmaking-engine';
import type { User } from '@/types';

/**
 * POST /api/matches/generate
 * Generate matches for an agency based on their preferences and athlete profiles
 *
 * Query params:
 * - min_score: Minimum match score threshold (default: 35)
 * - limit: Maximum number of matches to generate (default: 50)
 */
export async function POST(request: Request) {
  console.log('🚀 [Generate Matches API] Starting match generation...');

  try {
    // Try to get user from cookies first
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let userId: string | null = user?.id || null;

    // If cookie auth fails, try to get userId from request body as fallback
    if (!userId) {
      console.log('⚠️ [Generate Matches API] No user from cookies, checking request body...');
      try {
        const body = await request.json();
        userId = body.userId;
      } catch (e) {
        // Body might not exist, that's ok
      }
    }

    if (!userId) {
      console.error('❌ [Generate Matches API] No user ID available');
      return NextResponse.json({ error: 'Unauthorized - No user session found' }, { status: 401 });
    }

    console.log('✅ [Generate Matches API] User ID:', userId);

    // Use service role client to bypass RLS
    const serviceClient = createServiceRoleClient();

    // Get agency profile using service role
    const { data: agency, error: agencyError } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (agencyError || !agency) {
      console.error('❌ [Generate Matches API] Agency not found:', agencyError);
      return NextResponse.json(
        { error: 'Agency profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ [Generate Matches API] Agency profile loaded:', {
      id: agency.id,
      role: agency.role,
      campaignInterests: agency.campaign_interests,
      targetDemographics: agency.target_demographics,
    });

    if (agency.role !== 'agency') {
      console.error('❌ [Generate Matches API] User is not an agency, role:', agency.role);
      return NextResponse.json(
        { error: 'Only agencies can generate matches' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    // Lowered default from 35 to 20 to be more inclusive for agencies with sparse profiles
    // The matchmaking engine now gives baseline scores ~30-50 for athletes with good profiles
    const minScore = parseInt(searchParams.get('min_score') || '20');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('📊 [Generate Matches API] Parameters:', { minScore, limit });

    // Build athlete query based on agency preferences
    // First get all athletes from users table
    let athleteQuery = serviceClient
      .from('users')
      .select('*')
      .eq('role', 'athlete')
      .eq('onboarding_completed', true)
      .limit(limit * 2); // Get more than needed to account for filtering

    const { data: athleteUsers, error: athletesError } = await athleteQuery;

    if (athletesError) {
      console.error('❌ [Generate Matches API] Error fetching athletes:', athletesError);
      return NextResponse.json(
        { error: athletesError.message },
        { status: 500 }
      );
    }

    // Also fetch athlete_profiles to get sport data
    const athleteIds = athleteUsers?.map(a => a.id) || [];
    const { data: athleteProfiles } = await serviceClient
      .from('athlete_profiles')
      .select('user_id, sport')
      .in('user_id', athleteIds);

    // Merge profile data into athlete records
    let athletes = athleteUsers?.map(user => {
      const profile = athleteProfiles?.find(p => p.user_id === user.id);
      return {
        ...user,
        primary_sport: user.primary_sport || profile?.sport // Use users.primary_sport if exists, else athlete_profiles.sport
      };
    }) || [];

    // Filter by sport if agency has campaign interests (now done in-memory)
    if (agency.campaign_interests && agency.campaign_interests.length > 0) {
      athletes = athletes.filter(a =>
        a.primary_sport && agency.campaign_interests.includes(a.primary_sport)
      );
    }

    if (!athletes || athletes.length === 0) {
      console.log('⚠️ [Generate Matches API] No athletes found matching criteria');
      return NextResponse.json({
        success: true,
        matches: [],
        matchesCreated: 0,
        message: 'No athletes found matching your criteria. Try adjusting your campaign interests or target demographics.'
      });
    }

    console.log(`✅ [Generate Matches API] Found ${athletes.length} athletes to evaluate`);
    console.log('📋 [Generate Matches API] Athlete IDs:', athletes.map(a => a.id));

    // Calculate match scores for each athlete
    const matchResults = athletes.map(athlete => {
      const { score, breakdown, reasons, tier } = calculateMatchScore(
        agency as User,
        athlete as User
      );

      // Include all columns for the agency_athlete_matches table
      return {
        agency_id: userId,
        athlete_id: athlete.id,
        match_score: score,
        match_tier: tier, // Use correct column name (match_tier not tier)
        match_reasons: reasons, // Array of match reason strings
        score_breakdown: breakdown, // Preserve detailed 11-factor breakdown
        status: 'suggested' // suggested, saved, contacted, interested, in_discussion, partnered, rejected, expired
      };
    });

    // Filter by minimum score
    const qualifyingMatches = matchResults.filter(m => m.match_score >= minScore);

    console.log(`📊 [Generate Matches API] Score distribution:`, {
      total_evaluated: matchResults.length,
      qualifying: qualifyingMatches.length,
      highest_score: Math.max(...matchResults.map(m => m.match_score)),
      average_score: Math.round(matchResults.reduce((sum, m) => sum + m.match_score, 0) / matchResults.length),
      minScore_threshold: minScore
    });

    // Sort by score descending
    qualifyingMatches.sort((a, b) => b.match_score - a.match_score);

    // Show top 5 scores
    if (qualifyingMatches.length > 0) {
      console.log('🏆 [Generate Matches API] Top 5 scores:',
        qualifyingMatches.slice(0, 5).map(m => ({
          athlete_id: m.athlete_id,
          score: m.match_score
        }))
      );
    }

    // Limit to requested number
    const matchesToInsert = qualifyingMatches.slice(0, limit);

    if (matchesToInsert.length === 0) {
      const avgScore = Math.round(matchResults.reduce((sum, m) => sum + m.match_score, 0) / matchResults.length);
      const highScore = Math.max(...matchResults.map(m => m.match_score));

      console.log(`⚠️ [Generate Matches API] No matches above threshold. Highest score: ${highScore}, Average: ${avgScore}`);

      return NextResponse.json({
        success: true,
        matches: [],
        matchesCreated: 0,
        message: `No athletes scored above threshold of ${minScore}. Highest score was ${highScore}, average was ${avgScore}. Try lowering your minimum score or complete your agency profile.`,
        stats: {
          total_athletes_evaluated: athletes.length,
          highest_score: highScore,
          average_score: avgScore,
          threshold_used: minScore
        }
      });
    }

    console.log(`✅ [Generate Matches API] Attempting to insert ${matchesToInsert.length} matches`);

    // Insert matches one at a time to handle FK constraint failures gracefully
    // Some athlete IDs from the users table query may not exist due to data inconsistency
    const insertedMatches: any[] = [];
    const failedMatches: any[] = [];

    for (const match of matchesToInsert) {
      const { data: inserted, error: insertError } = await serviceClient
        .from('agency_athlete_matches')
        .upsert(match, {
          onConflict: 'agency_id,athlete_id',
          ignoreDuplicates: false
        })
        .select('*')
        .single();

      if (insertError) {
        console.warn(`⚠️ [Generate Matches API] Failed to insert match for athlete ${match.athlete_id}:`, insertError.message);
        failedMatches.push({ athlete_id: match.athlete_id, error: insertError.message });
      } else if (inserted) {
        insertedMatches.push(inserted);
      }
    }

    console.log(`✅ [Generate Matches API] Successfully inserted ${insertedMatches.length} matches, ${failedMatches.length} failed`);

    const matchCount = insertedMatches.length;

    // If we inserted at least one match, consider it a success
    if (matchCount > 0 || failedMatches.length === 0) {
      return NextResponse.json({
        success: true,
        matches: insertedMatches,
        matchesCreated: matchCount,
        message: matchCount > 0
          ? `Generated ${matchCount} new match${matchCount === 1 ? '' : 'es'}${failedMatches.length > 0 ? ` (${failedMatches.length} skipped due to data issues)` : ''}`
          : 'No new matches to create',
        stats: {
          total_athletes_evaluated: athletes.length,
          qualified_matches: qualifyingMatches.length,
          matches_created: matchCount,
          matches_failed: failedMatches.length,
          min_score_used: minScore
        }
      });
    }

    // All matches failed
    return NextResponse.json({
      success: false,
      matches: [],
      matchesCreated: 0,
      message: 'All match insertions failed due to data integrity issues',
      stats: {
        total_athletes_evaluated: athletes.length,
        qualified_matches: qualifyingMatches.length,
        matches_created: 0,
        matches_failed: failedMatches.length,
        min_score_used: minScore
      },
      errors: failedMatches
    }, { status: 500 });
  } catch (error) {
    console.error('💥 [Generate Matches API] Unexpected error:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
