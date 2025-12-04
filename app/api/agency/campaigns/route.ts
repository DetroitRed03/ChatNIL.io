import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, createClient } from '@/lib/supabase/server';
import { triggerMatchmakingForCampaign } from '@/lib/matchmaking-trigger';

/**
 * Agency Campaigns API
 *
 * POST /api/agency/campaigns
 * Creates a new campaign for the agency
 *
 * Body (from 6-step wizard):
 * Step 1 - Basics:
 * - name: string (required)
 * - description: string (required)
 * - campaign_type: 'social_media' | 'endorsement' | 'event' | 'product_launch'
 * - total_budget: number
 * - budget_per_athlete: number
 * - start_date: string (ISO date)
 * - end_date: string (ISO date)
 *
 * Step 2 - Athlete Targeting:
 * - target_sports: string[]
 * - target_states: string[]
 * - target_regions: string[]
 * - target_school_levels: string[] (high_school, college)
 * - target_divisions: string[] (D1, D2, D3, NAIA, JUCO)
 *
 * Step 3 - Social Requirements:
 * - min_followers: number
 * - min_engagement_rate: number
 * - preferred_platforms: string[] (Instagram, TikTok, Twitter, etc)
 * - content_quality_required: boolean
 *
 * Step 4 - NIL Preferences:
 * - preferred_deal_types: string[]
 * - content_types_needed: string[]
 * - partnership_length: string
 * - exclusivity_required: boolean
 * - travel_required: boolean
 * - max_travel_distance: number
 *
 * Step 5 - Brand Values:
 * - brand_values: string[]
 * - required_interests: string[]
 * - blacklist_categories: string[]
 */

/**
 * Helper to get authenticated agency user ID with multiple fallbacks
 */
async function getAuthenticatedAgencyId(request: NextRequest, supabase: ReturnType<typeof createServiceRoleClient>): Promise<string | null> {
  // Method 1: Try cookie-based auth (SSR client)
  try {
    const authClient = await createClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (user && !error) {
      return user.id;
    }
  } catch (e) {
    console.log('Cookie auth failed, trying fallback...');
  }

  // Method 2: Check for X-User-ID header (sent by frontend)
  const userIdHeader = request.headers.get('X-User-ID');
  if (userIdHeader) {
    return userIdHeader;
  }

  // Method 3: Check for Authorization header with Bearer token
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      return user.id;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();

    // Get authenticated agency user ID
    const agencyId = await getAuthenticatedAgencyId(request, supabase);

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (body.start_date && body.end_date) {
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Prepare campaign targeting data (from wizard steps 2-5)
    const targetAudience = {
      // Step 2: Athlete Targeting
      target_sports: body.target_sports || [],
      target_states: body.target_states || [],
      target_regions: body.target_regions || [],
      target_school_levels: body.target_school_levels || [],
      target_divisions: body.target_divisions || [],

      // Step 3: Social Requirements
      min_followers: body.min_followers || null,
      min_engagement_rate: body.min_engagement_rate || null,
      preferred_platforms: body.preferred_platforms || [],
      content_quality_required: body.content_quality_required || false,

      // Step 5: Brand Values
      brand_values: body.brand_values || [],
      required_interests: body.required_interests || [],
      blacklist_categories: body.blacklist_categories || [],
    };

    // Prepare campaign goals data (from wizard step 4)
    const goals = {
      // Step 4: NIL Preferences
      preferred_deal_types: body.preferred_deal_types || [],
      content_types_needed: body.content_types_needed || [],
      partnership_length: body.partnership_length || null,
      exclusivity_required: body.exclusivity_required || false,
      travel_required: body.travel_required || false,
      max_travel_distance: body.max_travel_distance || null,
    };

    // Prepare campaign metadata
    const metadata = {
      budget_per_athlete: body.budget_per_athlete || null,
      wizard_version: '1.0', // Track which wizard version created this
      created_via: 'wizard', // vs 'api' or 'import'
    };

    // Prepare campaign data - using actual database column names
    const campaignData = {
      agency_id: agencyId,
      name: body.name,
      description: body.description,
      status: 'active', // New campaigns start as active
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      budget: body.total_budget || 0, // DB column is 'budget', not 'total_budget'
      spent: 0, // DB column is 'spent', not 'spent_budget'
      target_sports: body.target_sports || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert campaign into database (using agency_campaigns table)
    const { data: campaign, error: insertError } = await supabase
      .from('agency_campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating campaign:', insertError);
      throw insertError;
    }

    // Auto-trigger matchmaking for the new campaign (async, non-blocking)
    let matchmakingResult = null;
    try {
      console.log('🔄 Auto-triggering matchmaking for new campaign:', campaign.id);
      matchmakingResult = await triggerMatchmakingForCampaign(campaign.id);
      console.log(`✅ Matchmaking complete: ${matchmakingResult.matchesGenerated} matches found`);
    } catch (matchError) {
      console.warn('⚠️ Matchmaking trigger failed (non-critical):', matchError);
      // Don't fail the campaign creation if matchmaking fails
    }

    // Return the created campaign with matchmaking results
    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        budget: campaign.budget,
        targetSports: campaign.target_sports,
        createdAt: campaign.created_at,
      },
      matchmaking: matchmakingResult ? {
        matchesGenerated: matchmakingResult.matchesGenerated,
        topMatches: matchmakingResult.campaigns?.[0]?.topMatches || []
      } : null,
    }, { status: 201 });

  } catch (error) {
    console.error('Campaign API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
