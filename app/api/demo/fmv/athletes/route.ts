/**
 * GET /api/demo/fmv/athletes
 * Fetch all athletes with FMV data for selector dropdown
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    // Fetch all athletes with their FMV data (left join to include athletes without FMV data)
    const { data: athletes, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        primary_sport,
        school_name,
        athlete_fmv_data (
          fmv_score,
          fmv_tier
        )
      `)
      .eq('role', 'athlete')
      .order('first_name');

    if (error) {
      console.error('Error fetching athletes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch athletes', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match response interface
    const transformedAthletes = athletes.map((athlete: any) => {
      // Handle both array and object responses from Supabase
      const fmvData = Array.isArray(athlete.athlete_fmv_data)
        ? athlete.athlete_fmv_data[0]
        : athlete.athlete_fmv_data;

      return {
        id: athlete.id,
        name: `${athlete.first_name} ${athlete.last_name}`,
        sport: athlete.primary_sport || 'Unknown',
        school: athlete.school_name || 'Unknown',
        fmv_score: fmvData?.fmv_score || 0,
        fmv_tier: fmvData?.fmv_tier || 'emerging'
      };
    });

    return NextResponse.json({
      athletes: transformedAthletes,
      total: transformedAthletes.length
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/demo/fmv/athletes:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
