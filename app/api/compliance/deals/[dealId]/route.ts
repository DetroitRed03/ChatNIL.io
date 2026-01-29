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

    // Get officer profile to verify compliance officer role
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    // Get deal with compliance scores
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
          override_at,
          created_at
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

    // Fetch athlete info separately
    // Note: nil_deals.athlete_id stores the user_id, not athlete_profiles.id
    const { data: athlete, error: athleteError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('id, user_id, username, sport, institution_id, school')
      .eq('user_id', deal.athlete_id)
      .single();

    // Verify the deal belongs to an athlete at the same institution
    if (!athlete || athlete.institution_id !== officer.institution_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get audit log for this deal
    const { data: auditLog } = await supabaseAdmin
      .from('compliance_audit_log')
      .select(`
        id,
        action,
        details,
        created_at,
        performed_by
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    // Fetch performer names for audit log
    const performerIds = auditLog?.map(a => a.performed_by).filter(Boolean) || [];
    let performerNames: Record<string, string> = {};

    if (performerIds.length > 0) {
      const { data: performers } = await supabaseAdmin
        .from('athlete_profiles')
        .select('user_id, username')
        .in('user_id', performerIds);

      performers?.forEach(p => {
        performerNames[p.user_id] = p.username || 'Unknown';
      });
    }

    // Fetch info requests and athlete responses for this deal
    const { data: infoRequests } = await supabaseAdmin
      .from('compliance_info_requests')
      .select('id, request_type, description, response_text, status, responded_at, created_at')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    // Fetch active appeals for this deal
    const { data: appeals } = await supabaseAdmin
      .from('nil_deal_appeals')
      .select('id, appeal_reason, additional_context, status, resolution, resolution_notes, submitted_at, resolved_at, original_decision')
      .eq('deal_id', dealId)
      .order('submitted_at', { ascending: false });

    // Fetch original deal if this is a resubmission
    let originalDeal = null;
    if (deal.resubmitted_from_deal_id) {
      const { data: origDeal } = await supabaseAdmin
        .from('nil_deals')
        .select('id, third_party_name, compensation_amount, deal_type, athlete_notes, compliance_decision, compliance_decision_at')
        .eq('id', deal.resubmitted_from_deal_id)
        .single();
      originalDeal = origDeal;
    }

    // Format response
    const response = {
      id: deal.id,
      third_party_name: deal.third_party_name,
      compensation_amount: deal.compensation_amount,
      deal_type: deal.deal_type,
      status: deal.status,
      created_at: deal.created_at,
      contract_url: deal.contract_url,
      description: deal.description,
      compliance_decision: deal.compliance_decision,
      compliance_decision_at: deal.compliance_decision_at,
      athlete_notes: deal.athlete_notes,
      internal_notes: deal.internal_notes,
      conditions_completed_at: deal.conditions_completed_at || null,
      conditions_completion_notes: deal.conditions_completion_notes || null,
      resubmitted_from_deal_id: deal.resubmitted_from_deal_id || null,
      original_deal: originalDeal,
      info_requests: infoRequests || [],
      athlete: athlete ? {
        id: athlete.id,
        name: athlete.username || 'Unknown Athlete',
        username: athlete.username,
        sport: athlete.sport,
        school: athlete.school
      } : null,
      // Normalize: Supabase returns object for 1:1 joins, but clients expect array
      compliance_scores: deal.compliance_scores
        ? (Array.isArray(deal.compliance_scores) ? deal.compliance_scores : [deal.compliance_scores])
        : [],
      has_active_appeal: deal.has_active_appeal || false,
      appeal_count: deal.appeal_count || 0,
      appeals: appeals || [],
      audit_log: auditLog?.map(entry => ({
        id: entry.id,
        action: entry.action,
        details: entry.details,
        created_at: entry.created_at,
        performed_by_name: performerNames[entry.performed_by] || null
      })) || []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error loading deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
