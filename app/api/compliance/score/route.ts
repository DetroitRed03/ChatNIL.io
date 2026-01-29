import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import {
  calculateComplianceScore,
  quickRiskCheck,
  ComplianceScoringInput,
} from '@/lib/compliance';
import type { DealInput, AthleteContext } from '@/lib/compliance/types';
import {
  getAIAnalysisForDeal,
  isAIAnalysisEnabled,
  runAIContractAnalysis,
  AIAnalysisResult
} from '@/lib/compliance/ai-analysis';

export const dynamic = 'force-dynamic';

// Admin client for DB operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/compliance/score
 * Calculate the 6-dimensional compliance score for an NIL deal
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

    // Try to get user from cookies first
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

    // Parse request body
    const body = await request.json();
    const { dealId, mode = 'full' } = body;

    if (!dealId) {
      return NextResponse.json(
        { error: 'dealId is required' },
        { status: 400 }
      );
    }

    // Fetch deal from database (use admin to bypass RLS)
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this deal
    if (deal.athlete_id !== user.id) {
      // Check if user is compliance officer with access (use admin to bypass RLS)
      const { data: officerAccess } = await supabaseAdmin
        .from('athlete_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'compliance_officer')
        .single();

      if (!officerAccess) {
        // Also check institution_staff as fallback
        const { data: staffAccess } = await supabaseAdmin
          .from('institution_staff')
          .select('id')
          .eq('user_id', user.id)
          .eq('role', 'compliance_officer')
          .single();

        if (!staffAccess) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          );
        }
      }
    }

    // Fetch athlete profile using admin client (athlete_id stores user_id)
    const { data: athlete } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', deal.athlete_id)
      .single();

    // Fetch any existing contract analysis
    const { data: contractDoc } = await supabaseAdmin
      .from('contract_documents')
      .select('*')
      .eq('deal_id', dealId)
      .eq('analysis_status', 'completed')
      .single();

    // Fetch athlete's FMV data (table may not exist yet - non-blocking)
    let fmvData = null;
    try {
      const { data } = await supabaseAdmin
        .from('athlete_fmv_data')
        .select('*')
        .eq('athlete_id', deal.athlete_id)
        .single();
      fmvData = data;
    } catch {
      // Table may not exist
    }

    // Fetch guardian consent if applicable
    let guardianConsent = null;
    if (athlete && calculateAge(athlete.date_of_birth) < 18) {
      const { data: consent } = await supabaseAdmin
        .from('parent_child_relationships')
        .select('*')
        .eq('child_id', deal.athlete_id)
        .eq('consent_status', 'approved')
        .single();
      guardianConsent = consent;
    }

    // Build scoring input for quick check
    const scoringInput: ComplianceScoringInput = buildScoringInput(
      deal,
      athlete,
      contractDoc,
      fmvData,
      guardianConsent
    );

    // Quick check mode - faster, less detailed
    if (mode === 'quick') {
      const quickResult = await quickRiskCheck(scoringInput);
      return NextResponse.json({
        riskTier: quickResult.riskTier,
        quickIssues: quickResult.quickIssues,
        mode: 'quick',
      });
    }

    // Build DealInput and AthleteContext for the scoring engine
    const athleteAge = calculateAge(athlete?.date_of_birth);
    const dealInput: DealInput = {
      id: deal.id,
      athleteId: deal.athlete_id,
      dealType: deal.deal_type || 'other',
      thirdPartyName: deal.third_party_name || deal.brand_name || 'Unknown',
      compensation: deal.compensation_amount || deal.deal_value || 0,
      deliverables: deal.deliverables || deal.description || '',
      contractText: deal.contract_text || contractDoc?.contract_text || contractDoc?.extracted_text,
      contractUrl: deal.contract_url || contractDoc?.file_url,
      state: athlete?.primary_state || 'CA',
      startDate: deal.start_date,
      endDate: deal.end_date,
      isSchoolAffiliated: deal.school_affiliated || false,
      isBoosterConnected: deal.booster_connected || false,
      performanceBased: deal.performance_based || false,
    };

    const athleteContext: AthleteContext = {
      id: deal.athlete_id,
      role: athlete?.role === 'hs_student' ? 'hs_student' : 'college_athlete',
      isMinor: athleteAge < 18,
      state: athlete?.primary_state || 'CA',
      sport: athlete?.primary_sport || athlete?.sport || 'other',
      followers: athlete?.total_followers || 1000,
      engagementRate: athlete?.engagement_rate || 2,
      consentStatus: guardianConsent ? 'approved' : (athleteAge < 18 ? 'pending' : undefined),
      hasAcknowledgedTaxObligations: athlete?.understands_tax_obligations || false,
    };

    // Full scoring with correct function signature
    const result = await calculateComplianceScore(dealInput, athleteContext);

    console.log('Compliance score calculated:', {
      dealId,
      totalScore: result.totalScore,
      status: result.status,
    });

    // Run AI analysis if enabled for the compliance officer
    let aiAnalysis: AIAnalysisResult | null = null;
    let aiAnalysisEnabled = false;

    try {
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      aiAnalysisEnabled = await isAIAnalysisEnabled(serviceClient, user.id);

      if (aiAnalysisEnabled) {
        const contractText = deal.contract_text || contractDoc?.contract_text || contractDoc?.extracted_text;

        if (contractText) {
          aiAnalysis = await runAIContractAnalysis(contractText);
        } else {
          aiAnalysis = {
            enabled: true,
            analyzed: false,
            contractDetected: false,
            confidence: 0,
            redFlags: [],
            keyTerms: [],
            summary: 'No contract text available for AI analysis.',
            recommendations: ['Upload a contract document to enable AI analysis.'],
            riskLevel: 'low',
            analyzedAt: new Date().toISOString(),
          };
        }
      }
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
    }

    // Collect critical issues and warnings from dimension reason codes
    const criticalIssues = result.overallReasonCodes.filter(rc =>
      rc.includes('PROHIBITED') || rc.includes('EXTREME') || rc.includes('PAY_FOR_PLAY') ||
      rc.includes('BOOSTER') || rc.includes('ENROLLMENT')
    );
    const warnings = result.overallReasonCodes.filter(rc => !criticalIssues.includes(rc));

    // Save score to database - use admin client to bypass RLS
    const { error: saveError } = await supabaseAdmin
      .from('compliance_scores')
      .upsert({
        deal_id: dealId,
        user_id: deal.athlete_id,
        policy_fit_score: result.dimensions.policyFit.score,
        policy_fit_weight: result.dimensions.policyFit.weight,
        policy_fit_notes: result.dimensions.policyFit.notes,
        fmv_score: result.dimensions.fmvVerification.score,
        fmv_weight: result.dimensions.fmvVerification.weight,
        fmv_notes: result.dimensions.fmvVerification.notes,
        document_score: result.dimensions.documentHygiene.score,
        document_weight: result.dimensions.documentHygiene.weight,
        document_notes: result.dimensions.documentHygiene.notes,
        tax_score: result.dimensions.taxReadiness.score,
        tax_weight: result.dimensions.taxReadiness.weight,
        tax_notes: result.dimensions.taxReadiness.notes,
        brand_safety_score: result.dimensions.brandSafety.score,
        brand_safety_weight: result.dimensions.brandSafety.weight,
        brand_safety_notes: result.dimensions.brandSafety.notes,
        guardian_consent_score: result.dimensions.guardianConsent.score,
        guardian_consent_weight: result.dimensions.guardianConsent.weight,
        guardian_consent_notes: result.dimensions.guardianConsent.notes,
        total_score: result.totalScore,
        weighted_score: result.totalScore,
        status: result.status,
        reason_codes: result.overallReasonCodes,
        critical_issues: criticalIssues,
        warnings: warnings,
        fix_recommendations: result.overallRecommendations,
        scored_at: result.scoredAt,
        scored_by: user.id,
        score_version: 1,
        ai_analysis: aiAnalysis,
        ai_analysis_enabled: aiAnalysisEnabled,
        ai_analysis_error: null,
      }, {
        onConflict: 'deal_id',
      });

    if (saveError) {
      console.error('Error saving compliance score:', saveError);
    }

    // Update deal compliance status
    await supabaseAdmin
      .from('nil_deals')
      .update({
        compliance_status: result.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId);

    return NextResponse.json({
      ...result,
      mode: 'full',
      aiAnalysis: aiAnalysis,
      aiAnalysisEnabled: aiAnalysisEnabled,
    });
  } catch (error) {
    console.error('Error calculating compliance score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/score?dealId=xxx
 * Retrieve existing compliance score for a deal
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');

    if (!dealId) {
      return NextResponse.json(
        { error: 'dealId query parameter is required' },
        { status: 400 }
      );
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

    // Auth check
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

    // Fetch compliance score (use admin client to bypass RLS)
    const { data: score, error: scoreError } = await supabaseAdmin
      .from('compliance_scores')
      .select('*')
      .eq('deal_id', dealId)
      .single();

    if (scoreError || !score) {
      return NextResponse.json(
        { error: 'Score not found', needsScoring: true },
        { status: 404 }
      );
    }

    // Verify access - athlete owns the score OR user is a compliance officer
    if (score.user_id !== user.id) {
      const { data: officerAccess } = await supabaseAdmin
        .from('athlete_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'compliance_officer')
        .single();

      if (!officerAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json(score);
  } catch (error) {
    console.error('Error fetching compliance score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions

function calculateAge(dateOfBirth: string | null): number {
  if (!dateOfBirth) return 18; // Default to adult if unknown
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function buildScoringInput(
  deal: any,
  athlete: any,
  contractDoc: any,
  fmvData: any,
  guardianConsent: any
): ComplianceScoringInput {
  const athleteAge = calculateAge(athlete?.date_of_birth);

  return {
    dealId: deal.id,
    athleteId: deal.athlete_id,
    brandName: deal.brand_name || deal.company_name || 'Unknown Brand',
    dealValue: deal.compensation_amount || deal.deal_value || 0,
    dealCategory: deal.deal_type || deal.category || 'general',
    athleteState: athlete?.primary_state || 'CA',
    athleteLevel: athlete?.role === 'hs_student' ? 'high_school' : 'college',
    athleteAge,
    institutionId: athlete?.institution_id,

    policyFitInputs: {
      hasSchoolApproval: deal.school_approved || false,
      hasDisclosure: deal.disclosure_filed || false,
      disclosureDate: deal.disclosure_date,
      isThirdPartyVerified: deal.is_third_party_verified || false,
      thirdPartyName: deal.third_party_name || deal.brand_name,
      paymentSource: determinePaymentSource(deal),
      hasDeliverables: !!(deal.deliverables && deal.deliverables.length > 0),
      deliverables: deal.deliverables || [],
      paymentTiedToPerformance: deal.performance_based || false,
      paymentTiedToEnrollment: deal.enrollment_tied || false,
    },

    documentInputs: {
      hasContract: !!contractDoc || !!deal.contract_url,
      contractDocumentId: contractDoc?.id,
      contractAnalysisResult: contractDoc ? {
        flaggedTerms: contractDoc.flagged_terms || [],
        flaggedClauses: contractDoc.flagged_clauses || [],
        riskLevel: contractDoc.risk_level || 'medium',
        extractedParties: contractDoc.extracted_parties || [],
        extractedCompensation: contractDoc.extracted_compensation?.amount,
        extractedDates: contractDoc.extracted_dates,
        extractedDeliverables: contractDoc.extracted_deliverables || [],
      } : undefined,
      hasW9: deal.w9_submitted || false,
      hasDisclosureForm: deal.disclosure_filed || false,
      hasGuardianConsent: athleteAge < 18 ? !!guardianConsent : undefined,
      missingDocuments: [],
    },

    fmvInputs: {
      dealValue: deal.compensation_amount || deal.deal_value || 0,
      athleteFMVScore: fmvData?.fmv_score || 50,
      comparableDeals: fmvData?.comparable_deals || [],
      socialFollowers: athlete?.total_followers || fmvData?.social_followers || 1000,
      engagementRate: athlete?.engagement_rate || fmvData?.engagement_rate || 2,
      sport: athlete?.primary_sport || 'other',
      position: athlete?.position,
      marketSize: determineMarketSize(athlete?.primary_state),
    },

    taxInputs: {
      hasW9Submitted: deal.w9_submitted || false,
      understandsTaxObligations: athlete?.understands_tax_obligations || false,
      has1099Ready: false,
      hasTaxProfessional: athlete?.has_tax_professional || false,
      totalNILEarningsYTD: athlete?.total_nil_earnings_ytd || 0,
      dealValue: deal.compensation_amount || deal.deal_value || 0,
    },

    brandSafetyInputs: {
      brandCategory: deal.brand_category || deal.deal_type || 'general',
      brandName: deal.brand_name || deal.company_name || 'Unknown',
      productType: deal.product_type || 'general',
      athleteLevel: athlete?.role === 'hs_student' ? 'high_school' : 'college',
    },

    guardianConsentInputs: {
      athleteAge,
      athleteLevel: athlete?.role === 'hs_student' ? 'high_school' : 'college',
      consentStatus: athleteAge >= 18
        ? 'not_required'
        : guardianConsent
          ? 'approved'
          : 'pending',
      consentDocumentId: guardianConsent?.consent_document_url,
      consentDate: guardianConsent?.consent_given_at,
      guardianVerified: guardianConsent?.verified_at ? true : false,
    },
  };
}

function determinePaymentSource(deal: any): 'brand' | 'collective' | 'booster' | 'unknown' {
  const source = (deal.payment_source || deal.source_type || '').toLowerCase();
  if (source.includes('brand') || source.includes('company')) return 'brand';
  if (source.includes('collective')) return 'collective';
  if (source.includes('booster')) return 'booster';
  return 'brand'; // Default to brand for legitimate deals
}

function determineMarketSize(state: string | null): 'large' | 'medium' | 'small' {
  const largeMarkets = ['CA', 'TX', 'FL', 'NY', 'GA', 'OH', 'PA'];
  const mediumMarkets = ['NC', 'MI', 'IL', 'TN', 'AZ', 'IN', 'WA', 'CO'];

  if (!state) return 'medium';
  if (largeMarkets.includes(state)) return 'large';
  if (mediumMarkets.includes(state)) return 'medium';
  return 'small';
}
