/**
 * Policy Fit Scorer (30% weight)
 * ==============================
 * Evaluates: NCAA rules + state laws compliance
 *
 * Key questions:
 * - Is NIL allowed in this state for this athlete type?
 * - Has the school approved the deal?
 * - Is the payment from a legitimate third party?
 * - Are there actual deliverables required?
 * - Is payment tied to enrollment or performance?
 */

import { createClient } from '@/lib/supabase/server';
import { DealInput, AthleteContext, DimensionScore, StateRules, DIMENSION_WEIGHTS, createDimensionScore } from '../types';

const WEIGHT = DIMENSION_WEIGHTS.POLICY_FIT;

export async function calculatePolicyFit(
  deal: DealInput,
  athlete: AthleteContext
): Promise<DimensionScore> {
  let score = 100;
  const reasonCodes: string[] = [];
  const recommendations: string[] = [];

  // Check 1: State allows NIL for this athlete type
  const stateRules = await getStateRules(athlete.state);

  if (athlete.role === 'hs_student' && !stateRules.hs_nil_allowed) {
    score = 0;
    reasonCodes.push('STATE_HS_NIL_PROHIBITED');
    recommendations.push(`High school NIL is not allowed in ${athlete.state}. This deal cannot proceed.`);
  }

  // Check 2: Deal type allowed in state
  if (stateRules.prohibited_deal_types?.includes(deal.dealType)) {
    score -= 50;
    reasonCodes.push('DEAL_TYPE_PROHIBITED_IN_STATE');
    recommendations.push(`${deal.dealType} deals are restricted in ${athlete.state}.`);
  }

  // Check 3: School/booster affiliation (major red flag)
  if (deal.isSchoolAffiliated) {
    score -= 40;
    reasonCodes.push('SCHOOL_AFFILIATED_DEAL');
    recommendations.push('Deals affiliated with your school may violate NCAA rules. Verify this is legitimate third-party NIL.');
  }

  if (deal.isBoosterConnected) {
    score -= 50;
    reasonCodes.push('BOOSTER_CONNECTED');
    recommendations.push('Booster-connected deals are high risk for pay-for-play violations. Proceed with extreme caution.');
  }

  // Check 4: Performance-based compensation (pay-for-play indicator)
  if (deal.performanceBased) {
    score = Math.min(score, 20); // Cap at 20 if performance-based
    reasonCodes.push('PERFORMANCE_BASED_COMPENSATION');
    recommendations.push('Compensation tied to athletic performance is likely pay-for-play. Restructure to legitimate NIL activities.');
  }

  // Check 5: NCAA reporting timeline (college athletes)
  if (athlete.role === 'college_athlete') {
    reasonCodes.push('NCAA_REPORTING_REQUIRED');
    recommendations.push('Remember: NCAA requires deal disclosure within 5 business days.');
  }

  const notes = generatePolicyNotes(Math.max(0, score), reasonCodes);

  return createDimensionScore(score, WEIGHT, reasonCodes, notes, recommendations);
}

async function getStateRules(stateCode: string): Promise<StateRules> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('jurisdictions')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single();

    if (data) {
      return {
        state_code: data.state_code,
        state_name: data.state_name,
        hs_nil_allowed: data.hs_nil_allowed ?? false,
        hs_parental_consent_required: data.hs_parental_consent_required ?? true,
        hs_school_approval_required: data.hs_school_approval_required ?? false,
        college_nil_allowed: data.college_nil_allowed ?? true,
        college_disclosure_required: data.college_disclosure_required ?? true,
        college_disclosure_deadline_days: data.college_disclosure_deadline_days ?? 7,
        prohibited_activities: data.prohibited_activities ?? [],
        prohibited_deal_types: [],
        requires_contract: data.requires_contract ?? true,
        requires_disclosure: data.requires_disclosure ?? true,
      };
    }
  } catch (error) {
    console.error('Error fetching state rules:', error);
  }

  // Default fallback - conservative rules
  return {
    state_code: stateCode,
    state_name: stateCode,
    hs_nil_allowed: false,
    hs_parental_consent_required: true,
    hs_school_approval_required: true,
    college_nil_allowed: true,
    college_disclosure_required: true,
    college_disclosure_deadline_days: 7,
    prohibited_activities: [],
    prohibited_deal_types: [],
    requires_contract: true,
    requires_disclosure: true,
  };
}

function generatePolicyNotes(score: number, codes: string[]): string {
  if (score >= 80) return 'Deal complies with NCAA rules and state laws.';
  if (score >= 50) return 'Some policy concerns need attention before proceeding.';
  return 'Significant policy violations detected. Do not proceed without resolution.';
}
