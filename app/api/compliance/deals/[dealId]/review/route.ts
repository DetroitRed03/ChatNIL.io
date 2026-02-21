import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { createComplianceDecisionNotification } from '@/lib/compliance/notifications';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface ReviewBody {
  decision: 'approved' | 'approved_with_conditions' | 'rejected' | 'info_requested';
  athleteNotes?: string;
  internalNotes?: string;
  overrideScore?: {
    newScore: number;
    justification: string;
  } | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  console.log('📝 POST /api/compliance/deals/[dealId]/review called');
  try {
    const cookieStore = await cookies();
    const { dealId } = await params;
    console.log('📋 Deal ID:', dealId);

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    console.log('🔐 Has bearer token:', !!bearerToken);

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
      console.log('❌ Auth failed:', authError?.message || 'No user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ User authenticated:', user.id);

    // Get officer profile to verify compliance officer role
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    // Parse request body
    const body: ReviewBody = await request.json();
    const { decision, athleteNotes, internalNotes, overrideScore } = body;
    console.log('📩 Received decision:', decision);

    // Validate decision
    const validDecisions = ['approved', 'approved_with_conditions', 'rejected', 'info_requested'];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    // Validate override if provided
    if (overrideScore) {
      if (typeof overrideScore.newScore !== 'number' || overrideScore.newScore < 0 || overrideScore.newScore > 100) {
        return NextResponse.json({ error: 'Invalid override score' }, { status: 400 });
      }
      if (!overrideScore.justification || overrideScore.justification.length < 50) {
        return NextResponse.json({ error: 'Override justification must be at least 50 characters' }, { status: 400 });
      }
    }

    // Verify the deal exists
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      console.error('Error fetching deal for review:', dealError);
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Fetch athlete to verify institution
    // Note: nil_deals.athlete_id stores the user_id, not athlete_profiles.id
    const { data: athlete } = await supabaseAdmin
      .from('athlete_profiles')
      .select('id, institution_id')
      .eq('user_id', deal.athlete_id)
      .single();

    if (!athlete || athlete.institution_id !== officer.institution_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Map decision to deal status
    const statusMap: Record<string, string> = {
      'approved': 'approved',
      'approved_with_conditions': 'approved_conditional',
      'rejected': 'rejected',
      'info_requested': 'info_requested'
    };

    // Update deal with decision (also clear has_active_appeal since a new decision supersedes any pending appeal)
    const { error: updateError } = await supabaseAdmin
      .from('nil_deals')
      .update({
        status: statusMap[decision],
        compliance_decision: decision,
        compliance_decision_at: new Date().toISOString(),
        compliance_decision_by: user.id,
        athlete_notes: athleteNotes || null,
        internal_notes: internalNotes || null,
        has_active_appeal: false
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('❌ Error updating deal:', updateError);
      throw new Error('Failed to update deal');
    }
    console.log('✅ Deal updated successfully with status:', statusMap[decision]);

    // Always update compliance_scores.status to reflect the decision
    const decisionToScoreStatus: Record<string, string> = {
      'approved': 'green',
      'approved_with_conditions': 'yellow',
      'rejected': 'red',
      'info_requested': 'yellow'
    };

    const newScoreStatus = decisionToScoreStatus[decision];
    if (newScoreStatus) {
      const { error: scoreStatusError } = await supabaseAdmin
        .from('compliance_scores')
        .update({ status: newScoreStatus })
        .eq('deal_id', dealId);

      if (scoreStatusError) {
        console.error('⚠️ Error updating compliance_scores status:', scoreStatusError);
        // Non-critical - continue
      } else {
        console.log('✅ compliance_scores.status updated to:', newScoreStatus);
      }
    }

    // Handle score override if provided (overrides the status set above)
    if (overrideScore) {
      // Calculate new status based on override score
      const newStatus = overrideScore.newScore >= 80 ? 'green' :
                        overrideScore.newScore >= 60 ? 'yellow' : 'red';

      const { error: scoreError } = await supabaseAdmin
        .from('compliance_scores')
        .update({
          total_score: overrideScore.newScore,
          override_score: overrideScore.newScore,
          override_justification: overrideScore.justification,
          override_by: user.id,
          override_at: new Date().toISOString(),
          status: newStatus
        })
        .eq('deal_id', dealId);

      if (scoreError) {
        console.error('Error updating compliance score:', scoreError);
        // Continue - score update is secondary to decision
      }
    }

    // Create info request record if requesting more information
    if (decision === 'info_requested' && athleteNotes) {
      await supabaseAdmin.from('compliance_info_requests').insert({
        deal_id: dealId,
        requested_by: user.id,
        request_type: 'clarification',
        description: athleteNotes,
        status: 'pending',
      });
    }

    // Log to audit trail
    const auditAction = decision === 'approved' ? 'Deal approved' :
                        decision === 'approved_with_conditions' ? 'Deal approved with conditions' :
                        decision === 'rejected' ? 'Deal rejected' :
                        'Additional information requested';

    await supabaseAdmin.from('compliance_audit_log').insert({
      deal_id: dealId,
      athlete_id: deal.athlete_id,
      action: auditAction,
      performed_by: user.id,
      details: {
        decision,
        athleteNotes: athleteNotes || null,
        internalNotes: internalNotes || null,
        overrideScore: overrideScore || null
      }
    });

    // Send notification to athlete about the decision
    const notificationResult = await createComplianceDecisionNotification({
      athleteUserId: deal.athlete_id,
      dealId,
      brandName: deal.third_party_name || deal.brand_name || deal.deal_title || 'NIL Deal',
      decision,
      athleteNotes: athleteNotes || undefined,
    });

    if (!notificationResult.success) {
      console.warn('⚠️ Failed to create notification (non-critical):', notificationResult.error);
    } else {
      console.log('📧 Athlete notification sent successfully');
    }

    return NextResponse.json({
      success: true,
      decision,
      status: statusMap[decision]
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
