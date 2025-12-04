/**
 * GET /api/demo/fmv/athlete/[id]
 * Fetch complete FMV profile for selected athlete
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const athleteId = params.id;

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID is required' },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch athlete with all related data
    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .select('*')
      .eq('id', athleteId)
      .single();

    if (athleteError || !athlete) {
      return NextResponse.json(
        { error: 'Athlete not found', details: athleteError?.message },
        { status: 404 }
      );
    }

    // Fetch FMV data
    const { data: fmvData, error: fmvError } = await supabase
      .from('athlete_fmv_data')
      .select('*')
      .eq('athlete_id', athleteId)
      .single();

    if (fmvError) {
      console.error('Error fetching FMV data:', fmvError);
    }

    // Fetch social media stats
    const { data: socialStats, error: socialError } = await supabase
      .from('social_media_stats')
      .select('*')
      .eq('user_id', athleteId);

    if (socialError) {
      console.error('Error fetching social stats:', socialError);
    }

    // Fetch public profile
    const { data: publicProfile, error: profileError } = await supabase
      .from('athlete_public_profiles')
      .select('*')
      .eq('user_id', athleteId)
      .single();

    if (profileError) {
      console.error('Error fetching public profile:', profileError);
    }

    // Find comparable athletes (same tier, similar score ±10 points)
    let comparables: any[] = [];
    if (fmvData) {
      const { data: comparableData } = await supabase
        .from('athlete_fmv_data')
        .select(`
          athlete_id,
          fmv_score,
          fmv_tier,
          users!inner (
            id,
            first_name,
            last_name,
            primary_sport
          )
        `)
        .eq('fmv_tier', fmvData.fmv_tier)
        .gte('fmv_score', fmvData.fmv_score - 10)
        .lte('fmv_score', fmvData.fmv_score + 10)
        .neq('athlete_id', athleteId)
        .limit(5);

      if (comparableData) {
        comparables = comparableData.map((c: any) => ({
          id: c.users.id,
          name: `${c.users.first_name} ${c.users.last_name}`,
          score: c.fmv_score,
          sport: c.users.primary_sport || 'Unknown'
        }));
      }
    }

    return NextResponse.json({
      athlete,
      fmv: fmvData || null,
      socialStats: socialStats || [],
      publicProfile: publicProfile || null,
      comparables
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/demo/fmv/athlete/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
