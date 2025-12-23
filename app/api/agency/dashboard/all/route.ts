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

    // Fetch all dashboard data in parallel
    const [
      statsResult,
      campaignsResult,
      athletesResult,
      budgetResult,
      activityResult,
      actionsResult
    ] = await Promise.all([
      supabase.rpc('get_agency_dashboard_stats', { p_agency_id: user.id }),
      supabase.from('campaign_performance_detail').select('*').eq('agency_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('agency_athlete_roster').select('*').eq('agency_id', user.id).order('total_impressions', { ascending: false }).limit(10),
      supabase.from('agency_budget_allocations').select('*').eq('agency_id', user.id).gte('period_end', new Date().toISOString().split('T')[0]).order('period_start', { ascending: false }).limit(1).single(),
      supabase.from('agency_activity_log').select('*').eq('agency_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('agency_pending_actions').select('*').eq('agency_id', user.id).eq('status', 'pending').order('priority', { ascending: false }).order('due_date', { ascending: true }).limit(10)
    ]);

    // Process stats
    const overview = statsResult.data && statsResult.data.length > 0 ? statsResult.data[0] : {
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

    // Process budget (handle PGRST116 error for no rows)
    const budget = budgetResult.error?.code === 'PGRST116' ? {
      total_budget: 0,
      allocated_budget: 0,
      spent_budget: 0,
      categories: {}
    } : budgetResult.data || {
      total_budget: 0,
      allocated_budget: 0,
      spent_budget: 0,
      categories: {}
    };

    return NextResponse.json({
      overview,
      campaigns: campaignsResult.data || [],
      athletes: athletesResult.data || [],
      budget,
      recent_activity: activityResult.data || [],
      pending_actions: actionsResult.data || []
    });
  } catch (error: any) {
    console.error('Unexpected error in dashboard/all endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
