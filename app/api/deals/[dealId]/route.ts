import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const { dealId } = await params;

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Get authenticated user
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) {
        user = tokenUser;
        authError = null;
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deal with compliance scores and info requests
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .select(`
        *,
        compliance_scores (
          id,
          total_score,
          status,
          reason_codes,
          policy_fit_score,
          fmv_score,
          document_score,
          tax_score,
          brand_safety_score,
          guardian_consent_score,
          override_score,
          override_justification,
          override_at
        )
      `)
      .eq('id', dealId)
      .single();

    if (dealError) {
      console.error('Error fetching deal:', dealError);
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify the user owns this deal
    if (deal.athlete_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get info requests for this deal
    const { data: infoRequests } = await supabaseAdmin
      .from('compliance_info_requests')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    // Get appeals for this deal
    const { data: appeals } = await supabaseAdmin
      .from('nil_deal_appeals')
      .select('*')
      .eq('deal_id', dealId)
      .order('submitted_at', { ascending: false });

    // Update athlete_viewed_decision_at if this is first view after decision
    if (deal.compliance_decision && !deal.athlete_viewed_decision_at) {
      await supabaseAdmin
        .from('nil_deals')
        .update({ athlete_viewed_decision_at: new Date().toISOString() })
        .eq('id', dealId);
    }

    // Format response
    const response = {
      id: deal.id,
      third_party_name: deal.third_party_name,
      brand_name: deal.brand_name,
      deal_title: deal.deal_title,
      compensation_amount: deal.compensation_amount,
      deal_type: deal.deal_type,
      status: deal.status,
      created_at: deal.created_at,
      start_date: deal.start_date,
      end_date: deal.end_date,
      contract_url: deal.contract_url,
      description: deal.description,
      deliverables: deal.deliverables,

      // Compliance decision fields
      compliance_decision: deal.compliance_decision,
      compliance_decision_at: deal.compliance_decision_at,
      athlete_notes: deal.athlete_notes,
      // Note: internal_notes is NOT included - it's only for compliance team

      // Appeal tracking
      has_active_appeal: deal.has_active_appeal,
      appeal_count: deal.appeal_count,
      last_appeal_at: deal.last_appeal_at,

      // Resubmission tracking
      superseded_by_deal_id: deal.superseded_by_deal_id || null,
      resubmitted_from_deal_id: deal.resubmitted_from_deal_id || null,

      // Notification tracking
      athlete_notified_at: deal.athlete_notified_at,
      athlete_viewed_decision_at: deal.athlete_viewed_decision_at,

      // Related data
      compliance_scores: deal.compliance_scores,
      info_requests: infoRequests || [],
      appeals: appeals || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error loading deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
