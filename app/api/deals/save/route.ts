import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { calculateComplianceScore } from '@/lib/compliance/calculate-score';
import type { DealInput, AthleteContext } from '@/lib/compliance/types';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/deals/save
 * Save a validated NIL deal to the database
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Check for Authorization header (Bearer token from localStorage)
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

    // Verify authentication
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    // If no user from cookies and Bearer token is provided, try using the token
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

    // Get request body
    const body = await request.json();
    const {
      thirdPartyName,
      thirdPartyType,
      dealType,
      compensation,
      deliverables,
      contractText,
      state,
      isSchoolAffiliated,
      isBoosterConnected,
      performanceBased,
      complianceScore,
      resubmittedFromDealId,
    } = body;

    // Validate required fields
    if (!thirdPartyName || compensation === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prevent duplicate resubmissions
    let resubmissionCount = 0;
    if (resubmittedFromDealId) {
      const { data: originalDeal } = await supabaseAdmin
        .from('nil_deals')
        .select('id, superseded_by_deal_id, resubmission_count')
        .eq('id', resubmittedFromDealId)
        .single();

      if (originalDeal?.superseded_by_deal_id) {
        return NextResponse.json(
          { error: 'This deal has already been resubmitted' },
          { status: 409 }
        );
      }
      resubmissionCount = (originalDeal?.resubmission_count || 0) + 1;
    }

    // Create the deal using admin client (bypasses RLS)
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .insert({
        athlete_id: user.id,
        agency_id: user.id, // Self-created deal
        deal_title: thirdPartyName,
        brand_name: thirdPartyName,
        third_party_name: thirdPartyName,
        deal_type: dealType || 'other',
        compensation_amount: compensation,
        description: deliverables || '',
        deliverables: deliverables || '',
        status: 'pending',
        compliance_status: complianceScore?.status || 'pending',
        is_third_party_verified: !isSchoolAffiliated && !isBoosterConnected,
        resubmitted_from_deal_id: resubmittedFromDealId || null,
        resubmission_count: resubmissionCount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dealError) {
      console.error('Error creating deal:', dealError);
      return NextResponse.json(
        { error: 'Failed to save deal', details: dealError.message },
        { status: 500 }
      );
    }

    // Mark original deal as superseded if this is a resubmission
    if (resubmittedFromDealId && deal) {
      await supabaseAdmin
        .from('nil_deals')
        .update({
          superseded_by_deal_id: deal.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resubmittedFromDealId);
    }

    // Save the compliance score if provided from client
    if (complianceScore && deal) {
      await supabaseAdmin
        .from('compliance_scores')
        .insert({
          deal_id: deal.id,
          user_id: user.id,
          policy_fit_score: complianceScore.dimensions?.policyFit?.score || 0,
          policy_fit_weight: complianceScore.dimensions?.policyFit?.weight || 0.3,
          policy_fit_notes: complianceScore.dimensions?.policyFit?.notes || '',
          fmv_score: complianceScore.dimensions?.fmvVerification?.score || 0,
          fmv_weight: complianceScore.dimensions?.fmvVerification?.weight || 0.15,
          fmv_notes: complianceScore.dimensions?.fmvVerification?.notes || '',
          document_score: complianceScore.dimensions?.documentHygiene?.score || 0,
          document_weight: complianceScore.dimensions?.documentHygiene?.weight || 0.2,
          document_notes: complianceScore.dimensions?.documentHygiene?.notes || '',
          tax_score: complianceScore.dimensions?.taxReadiness?.score || 0,
          tax_weight: complianceScore.dimensions?.taxReadiness?.weight || 0.15,
          tax_notes: complianceScore.dimensions?.taxReadiness?.notes || '',
          brand_safety_score: complianceScore.dimensions?.brandSafety?.score || 0,
          brand_safety_weight: complianceScore.dimensions?.brandSafety?.weight || 0.1,
          brand_safety_notes: complianceScore.dimensions?.brandSafety?.notes || '',
          guardian_consent_score: complianceScore.dimensions?.guardianConsent?.score || 0,
          guardian_consent_weight: complianceScore.dimensions?.guardianConsent?.weight || 0.1,
          guardian_consent_notes: complianceScore.dimensions?.guardianConsent?.notes || '',
          total_score: complianceScore.totalScore || 0,
          weighted_score: complianceScore.totalScore || 0,
          status: complianceScore.status || 'pending',
          reason_codes: complianceScore.overallReasonCodes || [],
          fix_recommendations: complianceScore.overallRecommendations || [],
          scored_at: new Date().toISOString(),
        });
    } else if (deal) {
      // Auto-calculate compliance score for the new deal
      try {
        // Fetch athlete profile for scoring context
        const { data: athleteProfile } = await supabaseAdmin
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const dealInput: DealInput = {
          id: deal.id,
          athleteId: user.id,
          dealType: dealType || 'other',
          thirdPartyName: thirdPartyName,
          compensation: compensation || 0,
          deliverables: deliverables || '',
          contractText: contractText,
          state: athleteProfile?.primary_state || 'CA',
          isSchoolAffiliated: isSchoolAffiliated || false,
          isBoosterConnected: isBoosterConnected || false,
          performanceBased: performanceBased || false,
        };

        const athleteContext: AthleteContext = {
          id: user.id,
          role: athleteProfile?.role === 'hs_student' ? 'hs_student' : 'college_athlete',
          isMinor: false, // Will be corrected if date_of_birth available
          state: athleteProfile?.primary_state || 'CA',
          sport: athleteProfile?.primary_sport || athleteProfile?.sport || 'other',
          followers: athleteProfile?.total_followers || 1000,
          engagementRate: athleteProfile?.engagement_rate || 2,
          hasAcknowledgedTaxObligations: athleteProfile?.understands_tax_obligations || false,
        };

        const scoreResult = await calculateComplianceScore(dealInput, athleteContext);

        await supabaseAdmin
          .from('compliance_scores')
          .insert({
            deal_id: deal.id,
            user_id: user.id,
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
          });

        // Update deal with compliance status
        await supabaseAdmin
          .from('nil_deals')
          .update({
            compliance_status: scoreResult.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', deal.id);

        console.log(`Auto-scored deal ${deal.id}: ${scoreResult.totalScore}/100 (${scoreResult.status})`);
      } catch (scoreError) {
        console.error('Auto-scoring failed (non-blocking):', scoreError);
        // Non-blocking - deal is still saved
      }
    }

    return NextResponse.json({
      success: true,
      deal,
      message: 'Deal saved successfully'
    });

  } catch (error) {
    console.error('Save deal error:', error);
    return NextResponse.json(
      { error: 'Failed to save deal' },
      { status: 500 }
    );
  }
}
