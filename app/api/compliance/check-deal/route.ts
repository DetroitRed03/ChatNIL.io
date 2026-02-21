import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAthleteRole } from '@/types/common';
import {
  checkDealCompliance,
  extractStateCode,
  getAthleteLevel,
  formatComplianceResult,
  type ComplianceCheckParams,
} from '@/lib/geo-compliance';

export const dynamic = 'force-dynamic';

/**
 * POST /api/compliance/check-deal
 *
 * Check if a proposed NIL deal complies with state-specific regulations
 *
 * Body:
 * {
 *   athlete_id?: string,  // Optional - defaults to current user
 *   state_code?: string,  // Optional - extracted from athlete profile if not provided
 *   deal_category?: string,  // e.g., 'alcohol', 'gambling', 'sports_apparel'
 *   has_school_approval?: boolean,
 *   has_agent_registration?: boolean,
 *   has_disclosure?: boolean,
 *   has_financial_literacy?: boolean
 * }
 *
 * Returns detailed compliance analysis with violations, warnings, and requirements
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const {
      athlete_id,
      state_code,
      deal_category,
      has_school_approval = false,
      has_agent_registration = false,
      has_disclosure = false,
      has_financial_literacy = false,
    } = body;

    // 3. Determine which athlete to check for
    const targetAthleteId = athlete_id || authUser.id;

    // 4. Get athlete profile
    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .select('state, school_name, role')
      .eq('id', targetAthleteId)
      .single();

    if (athleteError || !athlete) {
      return NextResponse.json(
        { error: 'Athlete profile not found' },
        { status: 404 }
      );
    }

    // 5. Verify target is an athlete
    if (!isAthleteRole(athlete.role)) {
      return NextResponse.json(
        { error: 'Compliance checks are only available for athletes' },
        { status: 403 }
      );
    }

    // 6. Determine state code (from request or athlete profile)
    let athleteStateCode = state_code;

    if (!athleteStateCode && athlete.state) {
      athleteStateCode = extractStateCode(athlete.state);
    }

    if (!athleteStateCode) {
      return NextResponse.json(
        {
          error: 'Unable to determine state',
          message: 'Please provide a state_code or update your profile with your state.',
        },
        { status: 400 }
      );
    }

    // 7. Determine athlete level (high school or college)
    let athleteLevel: 'high_school' | 'college' | 'unknown' = 'unknown';

    if (athlete.school_name) {
      athleteLevel = getAthleteLevel(athlete.school_name);
    }

    if (athleteLevel === 'unknown') {
      return NextResponse.json(
        {
          error: 'Unable to determine athlete level',
          message: 'Please update your profile with your school name so we can determine if you are a high school or college athlete.',
        },
        { status: 400 }
      );
    }

    // 8. Build compliance check parameters
    const complianceParams: ComplianceCheckParams = {
      stateCode: athleteStateCode,
      athleteLevel,
      dealCategory: deal_category,
      hasSchoolApproval: has_school_approval,
      hasAgentRegistration: has_agent_registration,
      hasDisclosure: has_disclosure,
      hasFinancialLiteracy: has_financial_literacy,
    };

    // 9. Perform compliance check
    const complianceResult = await checkDealCompliance(complianceParams);

    // 10. Log compliance check (for analytics/audit trail)
    const { error: logError } = await supabase
      .from('compliance_checks')
      .insert({
        athlete_id: targetAthleteId,
        state_code: athleteStateCode,
        athlete_level: athleteLevel,
        deal_category: deal_category,
        compliant: complianceResult.compliant,
        violations: complianceResult.violations,
        warnings: complianceResult.warnings,
        requirements: complianceResult.requirements,
        checked_at: new Date().toISOString(),
      });

    if (logError) {
      // Don't fail the request if logging fails
      console.error('Compliance check logging error:', logError);
    }

    // 11. Format human-readable summary
    const summary = formatComplianceResult(complianceResult);

    // 12. Build response
    return NextResponse.json({
      success: true,
      compliance: {
        compliant: complianceResult.compliant,
        state: complianceResult.state_name,
        state_code: athleteStateCode,
        athlete_level: athleteLevel,
        violations: complianceResult.violations,
        warnings: complianceResult.warnings,
        requirements: complianceResult.requirements,
        summary: summary,
      },
      meta: {
        athlete_id: targetAthleteId,
        deal_category: deal_category,
        checks_performed: {
          school_approval: !!complianceParams.hasSchoolApproval,
          agent_registration: !!complianceParams.hasAgentRegistration,
          disclosure: !!complianceParams.hasDisclosure,
          financial_literacy: !!complianceParams.hasFinancialLiteracy,
        }
      },
      recommendations: complianceResult.compliant ? [
        'This deal appears to be compliant with state NIL rules.',
        'Always consult with your school\'s compliance office before finalizing any NIL deal.',
        'Keep detailed records of all NIL activities for reporting purposes.',
      ] : [
        'Do not proceed with this deal until all violations are addressed.',
        'Contact your school\'s compliance office for guidance.',
        'Review your state\'s NIL regulations before signing any agreement.',
      ]
    }, { status: 200 });

  } catch (error) {
    console.error('Compliance check error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/check-deal
 *
 * Get state NIL rules summary for the authenticated athlete's state
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Check for state_code query param
    const { searchParams } = new URL(request.url);
    const stateCodeParam = searchParams.get('state_code');

    let stateCode = stateCodeParam;

    // 3. If no state provided, get from user profile
    if (!stateCode) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('state')
        .eq('id', authUser.id)
        .single();

      if (userError || !user?.state) {
        return NextResponse.json(
          {
            error: 'State not found',
            message: 'Please provide a state_code parameter or update your profile with your state.',
          },
          { status: 400 }
        );
      }

      stateCode = extractStateCode(user.state);
    }

    if (!stateCode) {
      return NextResponse.json(
        { error: 'Unable to determine state code' },
        { status: 400 }
      );
    }

    // 4. Get state NIL rules
    const { data: stateRules, error: rulesError } = await supabase
      .from('state_nil_rules')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single();

    if (rulesError || !stateRules) {
      return NextResponse.json(
        {
          error: 'State NIL rules not found',
          message: `No NIL rules found for state: ${stateCode}. Please contact support.`,
        },
        { status: 404 }
      );
    }

    // 5. Return state rules summary
    return NextResponse.json({
      success: true,
      state_rules: {
        state_code: stateRules.state_code,
        state_name: stateRules.state_name,
        allows_nil: stateRules.allows_nil,
        high_school_allowed: stateRules.high_school_allowed,
        college_allowed: stateRules.college_allowed,
        school_approval_required: stateRules.school_approval_required,
        agent_registration_required: stateRules.agent_registration_required,
        disclosure_required: stateRules.disclosure_required,
        financial_literacy_required: stateRules.financial_literacy_required,
        prohibited_categories: stateRules.prohibited_categories,
        restrictions: stateRules.restrictions,
        rules_summary: stateRules.rules_summary,
        effective_date: stateRules.effective_date,
        last_updated: stateRules.last_updated,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('State rules fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
