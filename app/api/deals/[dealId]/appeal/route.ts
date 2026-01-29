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

interface AppealBody {
  reason: string;
  documents?: Array<{ url: string; name: string; type: string }>;
  additionalContext?: string;
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
    const body: AppealBody = await request.json();
    const { reason, documents, additionalContext } = body;

    // Validate reason
    if (!reason || reason.length < 50) {
      return NextResponse.json(
        { error: 'Appeal reason must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Get the deal
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify user owns this deal
    if (deal.athlete_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify deal has been rejected or has conditions
    if (!['rejected', 'approved_with_conditions'].includes(deal.compliance_decision)) {
      return NextResponse.json(
        { error: 'Can only appeal rejected deals or deals with conditions' },
        { status: 400 }
      );
    }

    // Check if there's already a pending appeal
    const { data: existingAppeal } = await supabaseAdmin
      .from('nil_deal_appeals')
      .select('id, status')
      .eq('deal_id', dealId)
      .eq('status', 'submitted')
      .single();

    if (existingAppeal) {
      return NextResponse.json(
        { error: 'There is already a pending appeal for this deal' },
        { status: 400 }
      );
    }

    // Get athlete profile for institution_id
    const { data: athleteProfile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('institution_id')
      .eq('user_id', user.id)
      .single();

    // Create the appeal
    const { data: appeal, error: appealError } = await supabaseAdmin
      .from('nil_deal_appeals')
      .insert({
        deal_id: dealId,
        athlete_id: user.id,
        institution_id: athleteProfile?.institution_id || deal.institution_id,
        appeal_reason: reason,
        appeal_documents: documents || [],
        additional_context: additionalContext || null,
        original_decision: deal.compliance_decision,
        original_decision_at: deal.compliance_decision_at,
        original_decision_by: deal.compliance_decision_by,
        original_notes: deal.athlete_notes,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appealError) {
      console.error('Error creating appeal:', appealError);
      return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
    }

    // Log to audit trail
    await supabaseAdmin.from('compliance_audit_log').insert({
      deal_id: dealId,
      action: 'Appeal submitted',
      performed_by: user.id,
      details: {
        appeal_id: appeal.id,
        reason_preview: reason.substring(0, 100),
        documents_count: documents?.length || 0,
      }
    });

    return NextResponse.json({
      success: true,
      appeal: {
        id: appeal.id,
        status: appeal.status,
        submitted_at: appeal.submitted_at,
      },
      message: 'Your appeal has been submitted and will be reviewed by the compliance team.',
    });
  } catch (error) {
    console.error('Error submitting appeal:', error);
    return NextResponse.json({ error: 'Failed to submit appeal' }, { status: 500 });
  }
}
