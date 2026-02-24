import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function safeString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}
function safeName(val: unknown): string {
  const s = safeString(val);
  return s.trim() || '';
}

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
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

    // Get officer profile
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    const { dealId, athleteId, newStatus, reason } = await request.json();

    // Validate reason length
    if (!reason || reason.length < 50) {
      return NextResponse.json({
        error: 'Reason must be at least 50 characters'
      }, { status: 400 });
    }

    // Validate new status
    if (!['green', 'yellow'].includes(newStatus)) {
      return NextResponse.json({
        error: 'Invalid status. Can only override to green or yellow.'
      }, { status: 400 });
    }

    // Get current compliance score
    const { data: currentScore } = await supabaseAdmin
      .from('compliance_scores')
      .select('*')
      .eq('deal_id', dealId)
      .single();

    if (!currentScore) {
      return NextResponse.json({ error: 'No compliance score found' }, { status: 404 });
    }

    // Verify the athlete belongs to same institution
    const { data: athlete } = await supabaseAdmin
      .from('athlete_profiles')
      .select('institution_id')
      .eq('id', athleteId)
      .single();

    if (!athlete || athlete.institution_id !== officer.institution_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Try to create override record
    try {
      await supabaseAdmin
        .from('compliance_overrides')
        .insert({
          deal_id: dealId,
          athlete_id: athleteId,
          officer_id: user.id,
          original_status: currentScore.status,
          new_status: newStatus,
          original_score: currentScore.total_score,
          reason
        });
    } catch {
      // Table may not exist, continue
      console.log('compliance_overrides table may not exist');
    }

    // Update the compliance score status
    const { error: updateError } = await supabaseAdmin
      .from('compliance_scores')
      .update({
        status: newStatus,
        override_reason: reason,
        overridden_by: user.id,
        overridden_at: new Date().toISOString()
      })
      .eq('deal_id', dealId);

    if (updateError) {
      console.error('Error updating compliance score:', updateError);
      // Try simpler update without override fields
      const { error: simpleUpdateError } = await supabaseAdmin
        .from('compliance_scores')
        .update({ status: newStatus })
        .eq('deal_id', dealId);

      if (simpleUpdateError) {
        return NextResponse.json({ error: simpleUpdateError.message }, { status: 500 });
      }
    }

    // Try to log to audit trail
    try {
      await supabaseAdmin
        .from('compliance_audit_log')
        .insert({
          institution_id: officer.institution_id,
          officer_id: user.id,
          athlete_id: athleteId,
          deal_id: dealId,
          action: 'override',
          details: {
            message: `Score overridden from ${currentScore.status.toUpperCase()} to ${newStatus.toUpperCase()}`,
            actor: 'officer',
            actorName: safeName(officer.full_name) || safeName(officer.username) || 'Compliance Officer',
            originalStatus: currentScore.status,
            newStatus,
            reason
          }
        });
    } catch {
      // Table may not exist, continue
      console.log('compliance_audit_log table may not exist');
    }

    return NextResponse.json({
      success: true,
      message: `Deal status overridden to ${newStatus.toUpperCase()}`
    });
  } catch (error) {
    console.error('Error processing override:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
