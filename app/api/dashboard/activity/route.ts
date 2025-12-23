/**
 * Activity Feed API
 *
 * Returns unified activity feed from actual tables (agency_athlete_matches, nil_deals).
 * Generates activities on-the-fly from existing data.
 *
 * Includes:
 * - Match activities (new matches, status changes)
 * - Deal activities (new deals, status updates, payments)
 *
 * Supports pagination via limit and offset query params.
 */

import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const activityType = searchParams.get('type'); // Optional filter: 'match', 'deal', 'message'

    if (!userId || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const activities: any[] = [];

    // Get match activities
    if (!activityType || activityType === 'match') {
      const { data: matches } = await supabaseAdmin
        .from('agency_athlete_matches')
        .select(`
          id,
          agency_id,
          match_score,
          status,
          tier,
          match_reasons,
          created_at
        `)
        .eq('athlete_id', userId)
        .order('created_at', { ascending: false })
        .limit(activityType === 'match' ? limit : 10);

      // Fetch agency user info for each match
      if (matches) {
        for (const match of matches) {
          const { data: agencyUser } = await supabaseAdmin
            .from('users')
            .select('first_name, last_name')
            .eq('id', match.agency_id)
            .single();
          const agencyName = `${agencyUser?.first_name || ''} ${agencyUser?.last_name || ''}`.trim() || 'A brand';

          activities.push({
            activity_id: `match-${match.id}`,
            user_id: userId,
            activity_type: 'match',
            title: 'New Brand Match',
            description: `${agencyName} wants to partner with you (${match.match_score}% match)`,
            metadata: {
              match_id: match.id,
              agency_id: match.agency_id,
              agency_name: agencyName,
              match_score: match.match_score,
              tier: match.tier,
              status: match.status,
              reasons: match.match_reasons
            },
            created_at: match.created_at,
            sort_timestamp: match.created_at
          });
        }
      }
    }

    // Get deal activities
    if (!activityType || activityType === 'deal') {
      const { data: deals } = await supabaseAdmin
        .from('nil_deals')
        .select('id, brand_name, deal_type, status, compensation_amount, created_at, updated_at')
        .eq('athlete_id', userId)
        .order('updated_at', { ascending: false })
        .limit(activityType === 'deal' ? limit : 10);

      deals?.forEach(deal => {
        const statusLabel = deal.status === 'completed' ? 'Completed' :
                           deal.status === 'active' ? 'Active' :
                           deal.status === 'pending' ? 'Pending' : 'New';
        const dealTypeLabel = deal.deal_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Deal';

        activities.push({
          activity_id: `deal-${deal.id}`,
          user_id: userId,
          activity_type: 'deal',
          title: `${deal.brand_name} ${dealTypeLabel}`,
          description: `${statusLabel} ${dealTypeLabel}${deal.compensation_amount ? ` - $${deal.compensation_amount.toLocaleString()}` : ''}`,
          metadata: {
            deal_id: deal.id,
            brand_name: deal.brand_name,
            deal_type: deal.deal_type,
            status: deal.status,
            amount: deal.compensation_amount
          },
          created_at: deal.created_at,
          sort_timestamp: deal.updated_at
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) =>
      new Date(b.sort_timestamp).getTime() - new Date(a.sort_timestamp).getTime()
    );

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit);
    const totalCount = activities.length;

    // Return paginated response
    return NextResponse.json({
      activities: paginatedActivities,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: totalCount > offset + limit
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in activity feed API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
