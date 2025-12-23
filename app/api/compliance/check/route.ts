import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/compliance/check
 * Check NIL compliance rules for a specific state
 *
 * Query params:
 * - state: State code (e.g., CA, NY, TX) (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get('state');

    if (!stateCode) {
      return NextResponse.json(
        { error: 'State code is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 500 }
      );
    }

    // Fetch state NIL rules
    const { data: stateRules, error } = await supabaseAdmin
      .from('state_nil_rules')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single();

    if (error) {
      console.error('Error fetching state NIL rules:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: `No NIL rules found for state: ${stateCode}` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      state_code: stateRules.state_code,
      state_name: stateRules.state_name,
      allows_nil: stateRules.allows_nil,
      requires_school_approval: stateRules.requires_school_approval,
      requires_disclosure: stateRules.requires_disclosure,
      allows_recruiting_inducements: stateRules.allows_recruiting_inducements,
      effective_date: stateRules.effective_date,
      notes: stateRules.notes
    });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/compliance/check:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
