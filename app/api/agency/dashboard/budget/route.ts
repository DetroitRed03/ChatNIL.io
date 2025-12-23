import { createClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch current budget period
    const { data: budgetData, error } = await supabase
      .from('agency_budget_allocations')
      .select('*')
      .eq('agency_id', user.id)
      .gte('period_end', new Date().toISOString().split('T')[0])
      .order('period_start', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching budget:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return budget data or default structure
    const budget = budgetData || {
      total_budget: 0,
      allocated_budget: 0,
      spent_budget: 0,
      categories: {}
    };

    return NextResponse.json({ budget });
  } catch (error: any) {
    console.error('Unexpected error in budget endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
