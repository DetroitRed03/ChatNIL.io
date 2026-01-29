import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { calculateComplianceScore } from '@/lib/compliance/calculate-score';
import type { DealInput, AthleteContext } from '@/lib/compliance/types';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/compliance/score-all
 * Score all existing deals that don't have compliance scores.
 * Only accessible by compliance officers.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    let { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) { user = tokenUser; authError = null; }
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

    // Get all deals without scores (for this institution)
    let query = supabaseAdmin
      .from('nil_deals')
      .select('id, athlete_id, compliance_scores(id)')
      .is('compliance_status', null)
      .order('created_at', { ascending: false })
      .limit(50); // Process in batches

    // Also get deals with 'pending' status
    const { data: pendingDeals } = await supabaseAdmin
      .from('nil_deals')
      .select('id, athlete_id')
      .or('compliance_status.is.null,compliance_status.eq.pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!pendingDeals || pendingDeals.length === 0) {
      return NextResponse.json({
        success: true,
        scored: 0,
        message: 'No deals need scoring',
      });
    }

    // Check which deals already have scores
    const dealIds = pendingDeals.map(d => d.id);
    const { data: existingScores } = await supabaseAdmin
      .from('compliance_scores')
      .select('deal_id')
      .in('deal_id', dealIds);

    const scoredDealIds = new Set(existingScores?.map(s => s.deal_id) || []);
    const dealsNeedingScores = pendingDeals.filter(d => !scoredDealIds.has(d.id));

    console.log(`Scoring ${dealsNeedingScores.length} deals...`);

    let scored = 0;
    let failed = 0;
    const results: Array<{ dealId: string; score: number; status: string }> = [];

    for (const deal of dealsNeedingScores) {
      try {
        // Fetch full deal data
        const { data: fullDeal } = await supabaseAdmin
          .from('nil_deals')
          .select('*')
          .eq('id', deal.id)
          .single();

        if (!fullDeal) continue;

        // Fetch athlete profile
        const { data: athlete } = await supabaseAdmin
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', fullDeal.athlete_id)
          .single();

        const dealInput: DealInput = {
          id: fullDeal.id,
          athleteId: fullDeal.athlete_id,
          dealType: fullDeal.deal_type || 'other',
          thirdPartyName: fullDeal.third_party_name || fullDeal.brand_name || 'Unknown',
          compensation: fullDeal.compensation_amount || 0,
          deliverables: fullDeal.deliverables || fullDeal.description || '',
          contractText: fullDeal.contract_text,
          contractUrl: fullDeal.contract_url,
          state: athlete?.primary_state || 'CA',
          isSchoolAffiliated: fullDeal.school_affiliated || false,
          isBoosterConnected: fullDeal.booster_connected || false,
          performanceBased: fullDeal.performance_based || false,
        };

        const athleteContext: AthleteContext = {
          id: fullDeal.athlete_id,
          role: athlete?.role === 'hs_student' ? 'hs_student' : 'college_athlete',
          isMinor: false,
          state: athlete?.primary_state || 'CA',
          sport: athlete?.primary_sport || athlete?.sport || 'other',
          followers: athlete?.total_followers || 1000,
          engagementRate: athlete?.engagement_rate || 2,
          hasAcknowledgedTaxObligations: athlete?.understands_tax_obligations || false,
        };

        const scoreResult = await calculateComplianceScore(dealInput, athleteContext);

        // Save to compliance_scores
        await supabaseAdmin
          .from('compliance_scores')
          .upsert({
            deal_id: fullDeal.id,
            user_id: fullDeal.athlete_id,
            policy_fit_score: scoreResult.dimensions.policyFit.score,
            policy_fit_weight: scoreResult.dimensions.policyFit.weight,
            policy_fit_notes: scoreResult.dimensions.policyFit.notes,
            fmv_score: scoreResult.dimensions.fmvVerification.score,
            fmv_weight: scoreResult.dimensions.fmvVerification.weight,
            fmv_notes: scoreResult.dimensions.fmvVerification.notes,
            document_score: scoreResult.dimensions.documentHygiene.score,
            document_weight: scoreResult.dimensions.documentHygiene.weight,
            document_notes: scoreResult.dimensions.documentHygiene.notes,
            tax_score: scoreResult.dimensions.taxReadiness.score,
            tax_weight: scoreResult.dimensions.taxReadiness.weight,
            tax_notes: scoreResult.dimensions.taxReadiness.notes,
            brand_safety_score: scoreResult.dimensions.brandSafety.score,
            brand_safety_weight: scoreResult.dimensions.brandSafety.weight,
            brand_safety_notes: scoreResult.dimensions.brandSafety.notes,
            guardian_consent_score: scoreResult.dimensions.guardianConsent.score,
            guardian_consent_weight: scoreResult.dimensions.guardianConsent.weight,
            guardian_consent_notes: scoreResult.dimensions.guardianConsent.notes,
            total_score: scoreResult.totalScore,
            weighted_score: scoreResult.totalScore,
            status: scoreResult.status,
            reason_codes: scoreResult.overallReasonCodes,
            fix_recommendations: scoreResult.overallRecommendations,
            scored_at: scoreResult.scoredAt,
          }, { onConflict: 'deal_id' });

        // Update deal compliance status
        await supabaseAdmin
          .from('nil_deals')
          .update({
            compliance_status: scoreResult.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', fullDeal.id);

        scored++;
        results.push({
          dealId: fullDeal.id,
          score: scoreResult.totalScore,
          status: scoreResult.status,
        });
      } catch (err) {
        console.error(`Failed to score deal ${deal.id}:`, err);
        failed++;
      }
    }

    console.log(`Scoring complete: ${scored} scored, ${failed} failed`);

    return NextResponse.json({
      success: true,
      scored,
      failed,
      total: dealsNeedingScores.length,
      results,
    });
  } catch (error) {
    console.error('Error in score-all:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
