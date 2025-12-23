/**
 * Agency Dashboard Overview API
 *
 * Returns aggregated dashboard metrics from the agency_dashboard_metrics materialized view.
 * This view is auto-refreshed every 5 minutes via pg_cron for performance.
 *
 * Data includes:
 * - Active athletes count
 * - Pending and active deals
 * - Pipeline value and monthly revenue
 * - Response rate percentage
 * - Recent deals pipeline (last 10)
 * - Match conversion metrics
 */

import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First, get the user's agency_id
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('agency_id')
      .eq('id', userId)
      .single();

    if (userError || !userData?.agency_id) {
      return NextResponse.json(
        { error: 'Agency not found for this user' },
        { status: 404 }
      );
    }

    // Query the materialized view for this agency's metrics
    const { data: metrics, error: metricsError } = await supabaseAdmin
      .from('agency_dashboard_metrics')
      .select('*')
      .eq('agency_id', userData.agency_id)
      .single();

    if (metricsError) {
      console.error('Error fetching agency metrics:', metricsError);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard metrics' },
        { status: 500 }
      );
    }

    // If no metrics found, return default values
    if (!metrics) {
      return NextResponse.json({
        agency_id: userData.agency_id,
        active_athletes: 0,
        pending_deals: 0,
        active_deals: 0,
        completed_deals: 0,
        pipeline_value: 0,
        monthly_revenue: 0,
        total_matches: 0,
        converted_matches: 0,
        response_rate_percentage: 0,
        recent_deals_pipeline: [],
        avg_deal_size: 0,
        avg_deal_duration_days: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Parse JSON fields if they're strings
    if (typeof metrics.recent_deals_pipeline === 'string') {
      metrics.recent_deals_pipeline = JSON.parse(metrics.recent_deals_pipeline);
    }

    // Return the metrics
    return NextResponse.json(metrics);

  } catch (error: any) {
    console.error('Unexpected error in agency overview API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
