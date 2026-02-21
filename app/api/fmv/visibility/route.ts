import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAthleteRole } from '@/types/common';

export const dynamic = 'force-dynamic';

/**
 * POST /api/fmv/visibility
 *
 * Toggle FMV score visibility (public/private)
 * Body: { is_public: boolean }
 *
 * Privacy features:
 * - Default is private (false)
 * - Athletes can make public at any time
 * - Can revert to private at any time
 * - When public, comparable athletes can see this score
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 3. Verify user is an athlete
    if (!isAthleteRole(user.role)) {
      return NextResponse.json(
        { error: 'FMV visibility is only available for athletes' },
        { status: 403 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const { is_public } = body;

    if (typeof is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body', message: 'is_public must be a boolean value' },
        { status: 400 }
      );
    }

    // 5. Check if FMV data exists
    const { data: currentFMV, error: fmvError } = await supabase
      .from('athlete_fmv_data')
      .select('is_public_score, fmv_score, fmv_tier')
      .eq('athlete_id', authUser.id)
      .single();

    if (fmvError || !currentFMV) {
      return NextResponse.json(
        {
          error: 'FMV data not found',
          message: 'You must calculate your FMV score before changing visibility settings.'
        },
        { status: 404 }
      );
    }

    // 6. Check if visibility is already set to requested value
    if (currentFMV.is_public_score === is_public) {
      return NextResponse.json(
        {
          success: true,
          message: `Your FMV score is already ${is_public ? 'public' : 'private'}`,
          fmv: {
            is_public_score: is_public,
            fmv_score: currentFMV.fmv_score,
            fmv_tier: currentFMV.fmv_tier,
          }
        },
        { status: 200 }
      );
    }

    // 7. Update visibility setting
    const { data: updatedFMV, error: updateError } = await supabase
      .from('athlete_fmv_data')
      .update({ is_public_score: is_public })
      .eq('athlete_id', authUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('Visibility update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update visibility setting' },
        { status: 500 }
      );
    }

    // 8. Build informative response
    const visibilityChange = is_public ? 'public' : 'private';
    const benefits = is_public
      ? [
          'Your score will appear in comparable athlete searches',
          'Other athletes can see your score as a benchmark',
          'Businesses and agencies can discover your NIL value',
          'Increases transparency in the NIL marketplace',
        ]
      : [
          'Your score is now hidden from other users',
          'Only you can see your FMV data and breakdowns',
          'You won\'t appear in comparable athlete searches',
          'You can make it public again at any time',
        ];

    return NextResponse.json({
      success: true,
      message: `Your FMV score is now ${visibilityChange}`,
      fmv: {
        is_public_score: updatedFMV.is_public_score,
        fmv_score: updatedFMV.fmv_score,
        fmv_tier: updatedFMV.fmv_tier,
      },
      meta: {
        visibility_changed: true,
        previous_setting: !is_public,
        new_setting: is_public,
        benefits: benefits,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Visibility update error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fmv/visibility
 *
 * Get current visibility setting for the authenticated athlete
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Get FMV visibility setting
    const { data: fmvData, error: fmvError } = await supabase
      .from('athlete_fmv_data')
      .select('is_public_score, fmv_score, fmv_tier')
      .eq('athlete_id', authUser.id)
      .single();

    if (fmvError || !fmvData) {
      return NextResponse.json(
        {
          error: 'FMV data not found',
          message: 'You must calculate your FMV score first.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      visibility: {
        is_public: fmvData.is_public_score,
        fmv_score: fmvData.fmv_score,
        fmv_tier: fmvData.fmv_tier,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Visibility fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
