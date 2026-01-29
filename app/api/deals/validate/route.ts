import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { calculateComplianceScore } from '@/lib/compliance/calculate-score';
import { DealInput, AthleteContext } from '@/lib/compliance/types';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * POST /api/deals/validate
 * Validate an NIL deal using the 6-Dimensional Compliance Scoring Engine
 *
 * Request body: DealInput object
 * Response: ComplianceResult object
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
    const dealInput: DealInput = await request.json();

    // Validate required fields
    if (!dealInput.athleteId || !dealInput.thirdPartyName || dealInput.compensation === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: athleteId, thirdPartyName, compensation' },
        { status: 400 }
      );
    }

    // Get athlete profile (use admin client to bypass RLS, user_id not id)
    const { data: profile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Athlete profile not found' }, { status: 404 });
    }

    // Determine if athlete is a minor
    const isMinor = profile.date_of_birth
      ? calculateAge(profile.date_of_birth) < 18
      : false;

    // Build athlete context
    const athleteContext: AthleteContext = {
      id: user.id,
      role: profile.role === 'hs_student' ? 'hs_student' : 'college_athlete',
      isMinor,
      state: profile.primary_state || dealInput.state,
      sport: profile.sport || 'other',
      followers: profile.total_followers || 0,
      engagementRate: profile.engagement_rate || 0,
      consentStatus: profile.consent_status as 'pending' | 'approved' | 'denied' | undefined,
      hasAcknowledgedTaxObligations: profile.has_acknowledged_tax_obligations || false
    };

    // Calculate compliance score
    const result = await calculateComplianceScore(dealInput, athleteContext);

    // Optionally save to database if deal has an ID
    if (dealInput.id) {
      await supabaseAdmin
        .from('compliance_scores')
        .upsert({
          deal_id: dealInput.id,
          user_id: user.id,
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
          fix_recommendations: result.overallRecommendations,
          scored_at: result.scoredAt
        }, {
          onConflict: 'deal_id'
        });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Compliance validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate deal' },
      { status: 500 }
    );
  }
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
