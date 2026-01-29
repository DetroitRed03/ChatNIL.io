import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { createAppealResolutionNotification } from '@/lib/compliance/notifications';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

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

    // Verify compliance officer role
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('id, institution_id, role')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    // Get appeals for the institution
    let query = supabaseAdmin
      .from('nil_deal_appeals')
      .select('*')
      .in('status', ['submitted', 'under_review'])
      .order('submitted_at', { ascending: true }); // Oldest first

    if (officer.institution_id) {
      query = query.eq('institution_id', officer.institution_id);
    }

    const { data: appeals, error: appealsError } = await query;

    if (appealsError) {
      console.error('Error fetching appeals:', appealsError);
      return NextResponse.json({ error: 'Failed to load appeals' }, { status: 500 });
    }

    // Get deal and athlete info
    const dealIds = Array.from(new Set(appeals?.map(a => a.deal_id) || []));
    const athleteIds = Array.from(new Set(appeals?.map(a => a.athlete_id) || []));

    const [dealsResult, athletesResult] = await Promise.all([
      supabaseAdmin
        .from('nil_deals')
        .select('id, third_party_name, brand_name, deal_title, compensation_amount')
        .in('id', dealIds),
      supabaseAdmin
        .from('athlete_profiles')
        .select('user_id, username, sport')
        .in('user_id', athleteIds),
    ]);

    const dealMap = new Map(dealsResult.data?.map(d => [d.id, d]) || []);
    const athleteMap = new Map(athletesResult.data?.map(a => [a.user_id, a]) || []);

    // Calculate days open for each appeal
    const now = new Date();
    const formattedAppeals = appeals?.map(appeal => {
      const deal = dealMap.get(appeal.deal_id);
      const athlete = athleteMap.get(appeal.athlete_id);
      const submittedAt = new Date(appeal.submitted_at);
      const daysOpen = Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: appeal.id,
        dealId: appeal.deal_id,
        dealTitle: deal?.third_party_name || deal?.brand_name || deal?.deal_title || 'Unknown Deal',
        amount: deal?.compensation_amount || 0,
        athleteId: appeal.athlete_id,
        athleteName: athlete?.username || 'Unknown',
        sport: athlete?.sport || 'Unknown',
        originalDecision: appeal.original_decision,
        originalDecisionAt: appeal.original_decision_at,
        appealReason: appeal.appeal_reason,
        appealDocuments: appeal.appeal_documents || [],
        additionalContext: appeal.additional_context,
        submittedAt: appeal.submitted_at,
        status: appeal.status,
        daysOpen,
      };
    }) || [];

    // Summary stats
    const submitted = formattedAppeals.filter(a => a.status === 'submitted').length;
    const underReview = formattedAppeals.filter(a => a.status === 'under_review').length;

    return NextResponse.json({
      appeals: formattedAppeals,
      summary: {
        total: formattedAppeals.length,
        submitted,
        underReview,
      },
    });
  } catch (error) {
    console.error('Error in appeals API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Resolve an appeal
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const { appealId, resolution, resolutionNotes, internalNotes, newDecision, newComplianceStatus } = body;

    if (!appealId || !resolution) {
      return NextResponse.json({ error: 'Appeal ID and resolution are required' }, { status: 400 });
    }

    if (!['upheld', 'modified', 'reversed'].includes(resolution)) {
      return NextResponse.json({ error: 'Invalid resolution' }, { status: 400 });
    }

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

    // Verify compliance officer role
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('id, institution_id, role')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    // Get the appeal
    const { data: appeal, error: appealError } = await supabaseAdmin
      .from('nil_deal_appeals')
      .select('*')
      .eq('id', appealId)
      .single();

    if (appealError || !appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }

    if (appeal.status === 'resolved') {
      return NextResponse.json({ error: 'Appeal has already been resolved' }, { status: 400 });
    }

    // Update the appeal
    const { error: updateError } = await supabaseAdmin
      .from('nil_deal_appeals')
      .update({
        status: 'resolved',
        resolution,
        resolution_notes: resolutionNotes || null,
        resolution_internal_notes: internalNotes || null,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        new_decision: newDecision || null,
        new_compliance_status: newComplianceStatus || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appealId);

    if (updateError) {
      console.error('Error updating appeal:', updateError);
      return NextResponse.json({ error: 'Failed to resolve appeal' }, { status: 500 });
    }

    // If modified or reversed, update the deal
    if (resolution !== 'upheld' && newDecision) {
      const dealUpdate: Record<string, any> = {
        compliance_decision: newDecision,
        compliance_decision_at: new Date().toISOString(),
        compliance_decision_by: user.id,
      };

      if (resolutionNotes) {
        dealUpdate.athlete_notes = resolutionNotes;
      }

      await supabaseAdmin
        .from('nil_deals')
        .update(dealUpdate)
        .eq('id', appeal.deal_id);
    }

    // Get deal info for notification
    const { data: deal } = await supabaseAdmin
      .from('nil_deals')
      .select('third_party_name, brand_name')
      .eq('id', appeal.deal_id)
      .single();

    // Send notification to athlete
    await createAppealResolutionNotification({
      athleteUserId: appeal.athlete_id,
      dealId: appeal.deal_id,
      brandName: deal?.third_party_name || deal?.brand_name || 'NIL Deal',
      resolution,
      resolutionNotes,
    });

    // Log to audit trail
    await supabaseAdmin.from('compliance_audit_log').insert({
      deal_id: appeal.deal_id,
      action: `Appeal ${resolution}`,
      performed_by: user.id,
      details: {
        appeal_id: appealId,
        resolution,
        new_decision: newDecision,
        resolution_notes: resolutionNotes,
      }
    });

    return NextResponse.json({
      success: true,
      resolution,
      message: `Appeal has been ${resolution}`,
    });
  } catch (error) {
    console.error('Error resolving appeal:', error);
    return NextResponse.json({ error: 'Failed to resolve appeal' }, { status: 500 });
  }
}
