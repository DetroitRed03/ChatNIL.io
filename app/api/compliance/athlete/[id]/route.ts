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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: athleteId } = await params;
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

    // Get athlete
    const { data: athlete } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('id', athleteId)
      .single();

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    // Verify same institution
    if (athlete.institution_id !== officer.institution_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get deals with compliance scores
    const { data: deals } = await supabaseAdmin
      .from('nil_deals')
      .select(`
        *,
        compliance_scores (*)
      `)
      .eq('athlete_id', athlete.user_id)
      .order('created_at', { ascending: false });

    // Get audit trail (if table exists)
    let auditTrail: Array<{
      id: string;
      action: string;
      details: Record<string, unknown>;
      created_at: string;
    }> = [];
    try {
      const { data: audit } = await supabaseAdmin
        .from('compliance_audit_log')
        .select('*')
        .eq('athlete_id', athlete.user_id)
        .order('created_at', { ascending: false })
        .limit(20);
      auditTrail = audit || [];
    } catch {
      // Table may not exist
    }

    // Get overrides (if table exists)
    let overrides: Array<{
      id: string;
      deal_id: string;
      original_status: string;
      new_status: string;
      reason: string;
      officer_id: string;
      created_at: string;
    }> = [];
    try {
      const { data: overrideData } = await supabaseAdmin
        .from('compliance_overrides')
        .select('*')
        .eq('athlete_id', athlete.user_id)
        .order('created_at', { ascending: false });
      overrides = overrideData || [];
    } catch {
      // Table may not exist
    }

    // Calculate compliance summary
    let worstScore: number | null = null;
    let worstStatus: string | null = null;
    let totalEarnings = 0;
    let issueCount = 0;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    const processedDeals = (deals || []).map(deal => {
      totalEarnings += deal.compensation_amount || 0;
      const score = Array.isArray(deal.compliance_scores) ? deal.compliance_scores[0] : deal.compliance_scores;

      if (score) {
        if (worstScore === null || score.total_score < worstScore) {
          worstScore = score.total_score;
          worstStatus = score.status;
        }
        if (score.status === 'red' || score.status === 'yellow') {
          issueCount++;
        }
        if (score.pay_for_play_risk === 'high') {
          riskLevel = 'high';
        } else if (score.pay_for_play_risk === 'medium' && riskLevel !== 'high') {
          riskLevel = 'medium';
        }
      }

      return {
        id: deal.id,
        thirdPartyName: deal.third_party_name,
        compensation: deal.compensation_amount || 0,
        score: score?.total_score || null,
        status: score?.status || 'pending',
        dealStatus: deal.status || 'active',
        topIssue: score?.reason_codes?.[0] || null,
        submittedAt: deal.created_at,
        hasOverride: overrides.some(o => o.deal_id === deal.id),
        // AI Analysis fields
        aiAnalysis: score?.ai_analysis || null,
        aiAnalysisEnabled: score?.ai_analysis_enabled || false,
      };
    });

    // Sort deals: red first, then yellow, then green
    const statusOrder: Record<string, number> = { red: 0, yellow: 1, green: 2, pending: 3 };
    processedDeals.sort((a, b) => {
      return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    });

    return NextResponse.json({
      athlete: {
        id: athlete.id,
        name: athlete.username || athlete.full_name || 'Unknown',
        sport: athlete.sport || 'Unknown',
        year: athlete.year || 'Unknown',
        institution: officer.school_name || officer.school || 'Unknown Institution',
        athleteId: `ATH-${athlete.id.substring(0, 8).toUpperCase()}`,
        email: athlete.email || ''
      },
      compliance: {
        overallStatus: worstStatus as 'green' | 'yellow' | 'red' | null,
        worstScore,
        riskLevel,
        totalDeals: deals?.length || 0,
        totalEarnings,
        issueCount
      },
      deals: processedDeals,
      auditTrail: auditTrail.map(entry => ({
        id: entry.id,
        action: entry.action,
        details: (entry.details as Record<string, unknown>)?.message as string || entry.action,
        actor: ((entry.details as Record<string, unknown>)?.actor as string) || 'system',
        actorName: (entry.details as Record<string, unknown>)?.actorName as string | undefined,
        timestamp: entry.created_at
      })),
      overrides: overrides.map(o => ({
        id: o.id,
        dealId: o.deal_id,
        dealName: deals?.find(d => d.id === o.deal_id)?.third_party_name || 'Unknown',
        originalStatus: o.original_status,
        newStatus: o.new_status,
        reason: o.reason,
        officerName: 'Compliance Officer',
        createdAt: o.created_at
      }))
    });
  } catch (error) {
    console.error('Error loading athlete details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
