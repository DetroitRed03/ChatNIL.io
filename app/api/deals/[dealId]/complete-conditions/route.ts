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
    const body = await request.json();
    const { notes, acknowledged } = body as {
      notes?: string;
      acknowledged: boolean;
    };

    if (!acknowledged) {
      return NextResponse.json(
        { error: 'You must confirm that all conditions have been completed' },
        { status: 400 }
      );
    }

    // Get the deal to verify ownership and status
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .select('id, athlete_id, compliance_decision, third_party_name')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (deal.athlete_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (deal.compliance_decision !== 'approved_with_conditions') {
      return NextResponse.json(
        { error: 'This deal is not awaiting condition completion' },
        { status: 400 }
      );
    }

    // Update deal status
    const { error: updateError } = await supabaseAdmin
      .from('nil_deals')
      .update({
        status: 'pending_review',
        compliance_decision: 'conditions_completed',
        conditions_completed_at: new Date().toISOString(),
        conditions_completion_notes: notes || null,
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('Error updating deal:', updateError);
      return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
    }

    // Log to audit trail
    await supabaseAdmin.from('compliance_audit_log').insert({
      deal_id: dealId,
      action: 'Conditions completed by athlete',
      performed_by: user.id,
      details: {
        notes: notes || null,
      },
    });

    // Notify compliance officer(s)
    await notifyComplianceOfficer(dealId, user.id, deal.third_party_name);

    return NextResponse.json({
      success: true,
      message: 'Conditions submitted for final approval. Your compliance team will review shortly.',
    });
  } catch (error) {
    console.error('Error completing conditions:', error);
    return NextResponse.json({ error: 'Failed to submit conditions' }, { status: 500 });
  }
}

/**
 * Notify compliance officer(s) that an athlete has completed conditions.
 */
async function notifyComplianceOfficer(dealId: string, athleteUserId: string, brandName: string) {
  try {
    const { data: athlete } = await supabaseAdmin
      .from('athlete_profiles')
      .select('institution_id, username')
      .eq('user_id', athleteUserId)
      .single();

    if (!athlete?.institution_id) return;

    const { data: officers } = await supabaseAdmin
      .from('athlete_profiles')
      .select('user_id')
      .eq('role', 'compliance_officer')
      .eq('institution_id', athlete.institution_id);

    if (!officers || officers.length === 0) return;

    const athleteName = athlete.username || 'An athlete';

    const notifications = officers.map(officer => ({
      user_id: officer.user_id,
      type: 'conditions_completed',
      title: 'Conditions Completed — Final Approval Needed',
      message: `${athleteName} has confirmed completion of all conditions for the ${brandName} deal. Please review and grant final approval.`,
      metadata: { deal_id: dealId, athlete_user_id: athleteUserId },
      action_url: `/compliance/deals/${dealId}/review`,
    }));

    await supabaseAdmin.from('notifications').insert(notifications);
  } catch (err) {
    console.error('Error notifying compliance officer:', err);
  }
}
