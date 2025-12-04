import { createClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch dashboard stats using the database function
    const { data: stats, error } = await supabase
      .rpc('get_agency_dashboard_stats', { p_agency_id: user.id });

    if (error) {
      console.error('Error fetching agency dashboard stats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the first row (function returns a table with one row)
    const overview = stats && stats.length > 0 ? stats[0] : {
      total_campaigns: 0,
      active_campaigns: 0,
      pending_campaigns: 0,
      total_athletes: 0,
      active_athletes: 0,
      total_budget: 0,
      spent_budget: 0,
      remaining_budget: 0,
      total_impressions: 0,
      total_engagement: 0,
      avg_engagement_rate: 0,
      roi_percentage: 0
    };

    return NextResponse.json({ overview });
  } catch (error: any) {
    console.error('Unexpected error in dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
