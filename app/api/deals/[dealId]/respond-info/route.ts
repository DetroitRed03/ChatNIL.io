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

interface InfoResponseBody {
  requestId: string;
  response: string;
  documents?: Array<{ url: string; name: string; type: string }>;
}

export async function POST(
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

    // Parse request body
    const body: InfoResponseBody = await request.json();
    const { requestId, response, documents } = body;

    // Validate response
    if (!response || response.trim().length === 0) {
      return NextResponse.json({ error: 'Response text is required' }, { status: 400 });
    }

    // Get the deal to verify ownership
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .select('id, athlete_id, athlete_notes, compliance_decision')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify user owns this deal
    if (deal.athlete_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fallback mode: no requestId but deal is info_requested — create record + respond
    if (!requestId && body.fallback && deal.compliance_decision === 'info_requested') {
      const { data: newRequest, error: createErr } = await supabaseAdmin
        .from('compliance_info_requests')
        .insert({
          deal_id: dealId,
          request_type: 'clarification',
          description: deal.athlete_notes || 'Additional information requested',
          response_text: response,
          response_documents: documents || [],
          status: 'responded',
          responded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createErr) {
        console.error('Error creating fallback info request:', createErr);
        return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
      }

      // Log to audit trail
      await supabaseAdmin.from('compliance_audit_log').insert({
        deal_id: dealId,
        action: 'Info request responded (fallback)',
        performed_by: user.id,
        details: {
          request_id: newRequest.id,
          response_preview: response.substring(0, 100),
        }
      });

      // Update deal status: athlete has responded, re-queue for CO review
      await supabaseAdmin
        .from('nil_deals')
        .update({
          status: 'pending_review',
          compliance_decision: 'response_submitted',
        })
        .eq('id', dealId);

      // Notify compliance officer
      await notifyComplianceOfficer(dealId, deal.athlete_id);

      return NextResponse.json({
        success: true,
        request: { id: newRequest.id, status: 'responded', responded_at: newRequest.responded_at },
        all_requests_responded: true,
        message: 'Response submitted successfully. Your deal will be reviewed again.',
      });
    }

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Get the info request
    const { data: infoRequest, error: requestError } = await supabaseAdmin
      .from('compliance_info_requests')
      .select('*')
      .eq('id', requestId)
      .eq('deal_id', dealId)
      .single();

    if (requestError || !infoRequest) {
      return NextResponse.json({ error: 'Info request not found' }, { status: 404 });
    }

    // Check if already responded
    if (infoRequest.status === 'responded' || infoRequest.status === 'resolved') {
      return NextResponse.json(
        { error: 'This request has already been responded to' },
        { status: 400 }
      );
    }

    // Update the info request with response
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('compliance_info_requests')
      .update({
        response_text: response,
        response_documents: documents || [],
        status: 'responded',
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating info request:', updateError);
      return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
    }

    // Check if all info requests are now responded
    const { data: pendingRequests } = await supabaseAdmin
      .from('compliance_info_requests')
      .select('id')
      .eq('deal_id', dealId)
      .eq('status', 'pending');

    const allResponded = !pendingRequests || pendingRequests.length === 0;

    // Log to audit trail
    await supabaseAdmin.from('compliance_audit_log').insert({
      deal_id: dealId,
      action: 'Info request responded',
      performed_by: user.id,
      details: {
        request_id: requestId,
        request_type: infoRequest.request_type,
        response_preview: response.substring(0, 100),
        documents_count: documents?.length || 0,
        all_requests_responded: allResponded,
      }
    });

    // If all info requests responded, re-queue deal for CO review
    if (allResponded) {
      await supabaseAdmin
        .from('nil_deals')
        .update({
          status: 'pending_review',
          compliance_decision: 'response_submitted',
        })
        .eq('id', dealId);

      // Notify compliance officer
      await notifyComplianceOfficer(dealId, deal.athlete_id);
    }

    return NextResponse.json({
      success: true,
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        responded_at: updatedRequest.responded_at,
      },
      all_requests_responded: allResponded,
      message: allResponded
        ? 'All information has been submitted. Your deal will be reviewed again.'
        : 'Response submitted successfully. Please respond to remaining requests.',
    });
  } catch (error) {
    console.error('Error responding to info request:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}

/**
 * Notify the compliance officer(s) at the athlete's institution that
 * an info request response has been submitted and the deal needs re-review.
 */
async function notifyComplianceOfficer(dealId: string, athleteUserId: string) {
  try {
    // Find the athlete's institution
    const { data: athlete } = await supabaseAdmin
      .from('athlete_profiles')
      .select('institution_id, username')
      .eq('user_id', athleteUserId)
      .single();

    if (!athlete?.institution_id) return;

    // Find compliance officers at same institution
    const { data: officers } = await supabaseAdmin
      .from('athlete_profiles')
      .select('user_id')
      .eq('role', 'compliance_officer')
      .eq('institution_id', athlete.institution_id);

    if (!officers || officers.length === 0) return;

    // Get deal info for notification
    const { data: deal } = await supabaseAdmin
      .from('nil_deals')
      .select('third_party_name')
      .eq('id', dealId)
      .single();

    const brandName = deal?.third_party_name || 'Unknown';
    const athleteName = athlete.username || 'An athlete';

    // Create notification for each CO
    const notifications = officers.map(officer => ({
      user_id: officer.user_id,
      type: 'info_response_received',
      title: 'Info Request Response Received',
      message: `${athleteName} has responded to your information request for the ${brandName} deal. This deal is ready for re-review.`,
      metadata: { deal_id: dealId, athlete_user_id: athleteUserId },
      action_url: `/compliance/deals/${dealId}/review`,
    }));

    await supabaseAdmin.from('notifications').insert(notifications);
  } catch (err) {
    console.error('Error notifying compliance officer:', err);
    // Non-blocking — don't fail the response
  }
}
