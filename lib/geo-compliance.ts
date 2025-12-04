/**
 * State NIL Compliance Helper Functions
 *
 * Provides utility functions for checking NIL deal compliance against state-specific rules.
 * Helps ensure athletes and businesses follow their state's NIL regulations.
 */

import { createClient } from '@/lib/supabase/server';
import type { StateNILRules } from '@/types';

/**
 * Get NIL rules for a specific state
 */
export async function getStateNILRules(stateCode: string): Promise<StateNILRules | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('state_nil_rules')
      .select('*')
      .eq('state_code', stateCode.toUpperCase())
      .single();

    if (error) {
      console.error(`Error fetching NIL rules for ${stateCode}:`, error);
      return null;
    }

    return data as StateNILRules;
  } catch (error) {
    console.error('getStateNILRules error:', error);
    return null;
  }
}

/**
 * Check if NIL deals are allowed in a state (high school or college)
 */
export async function isNILAllowedInState(
  stateCode: string,
  athleteLevel: 'high_school' | 'college'
): Promise<{ allowed: boolean; reason?: string }> {
  const rules = await getStateNILRules(stateCode);

  if (!rules) {
    return {
      allowed: false,
      reason: `No NIL rules found for state: ${stateCode}. Please check with your state athletic association.`
    };
  }

  if (!rules.allows_nil) {
    return {
      allowed: false,
      reason: `NIL deals are not currently allowed in ${rules.state_name}.`
    };
  }

  if (athleteLevel === 'high_school' && !rules.high_school_allowed) {
    return {
      allowed: false,
      reason: `NIL deals are allowed in ${rules.state_name}, but not for high school athletes.`
    };
  }

  if (athleteLevel === 'college' && !rules.college_allowed) {
    return {
      allowed: false,
      reason: `NIL deals are allowed in ${rules.state_name}, but not for college athletes.`
    };
  }

  return { allowed: true };
}

/**
 * Check if a specific deal category is prohibited in a state
 */
export async function isDealCategoryAllowed(
  stateCode: string,
  category: string
): Promise<{ allowed: boolean; reason?: string }> {
  const rules = await getStateNILRules(stateCode);

  if (!rules) {
    return {
      allowed: false,
      reason: `Unable to verify category restrictions for ${stateCode}.`
    };
  }

  const normalizedCategory = category.toLowerCase().trim();
  const prohibitedCategories = (rules.prohibited_categories || []).map(c => c.toLowerCase());

  if (prohibitedCategories.includes(normalizedCategory)) {
    return {
      allowed: false,
      reason: `The category "${category}" is prohibited for NIL deals in ${rules.state_name}.`
    };
  }

  return { allowed: true };
}

/**
 * Check if school approval is required for NIL deals in a state
 */
export async function isSchoolApprovalRequired(stateCode: string): Promise<boolean> {
  const rules = await getStateNILRules(stateCode);
  return rules?.school_approval_required || false;
}

/**
 * Check if agent registration is required in a state
 */
export async function isAgentRegistrationRequired(stateCode: string): Promise<boolean> {
  const rules = await getStateNILRules(stateCode);
  return rules?.agent_registration_required || false;
}

/**
 * Check if disclosure is required for NIL deals in a state
 */
export async function isDisclosureRequired(stateCode: string): Promise<boolean> {
  const rules = await getStateNILRules(stateCode);
  return rules?.disclosure_required || false;
}

/**
 * Get financial literacy requirement for a state
 */
export async function getFinancialLiteracyRequirement(stateCode: string): Promise<boolean> {
  const rules = await getStateNILRules(stateCode);
  return rules?.financial_literacy_required || false;
}

/**
 * Comprehensive compliance check for a NIL deal
 */
export interface ComplianceCheckParams {
  stateCode: string;
  athleteLevel: 'high_school' | 'college';
  dealCategory?: string;
  hasSchoolApproval?: boolean;
  hasAgentRegistration?: boolean;
  hasDisclosure?: boolean;
  hasFinancialLiteracy?: boolean;
}

export interface ComplianceCheckResult {
  compliant: boolean;
  violations: string[];
  warnings: string[];
  requirements: string[];
  state_name: string;
}

export async function checkDealCompliance(
  params: ComplianceCheckParams
): Promise<ComplianceCheckResult> {
  const {
    stateCode,
    athleteLevel,
    dealCategory,
    hasSchoolApproval = false,
    hasAgentRegistration = false,
    hasDisclosure = false,
    hasFinancialLiteracy = false,
  } = params;

  const violations: string[] = [];
  const warnings: string[] = [];
  const requirements: string[] = [];

  // Get state rules
  const rules = await getStateNILRules(stateCode);

  if (!rules) {
    return {
      compliant: false,
      violations: [`Unable to verify NIL rules for state: ${stateCode}`],
      warnings: ['Please consult with your state athletic association before proceeding.'],
      requirements: [],
      state_name: 'Unknown',
    };
  }

  // Check 1: NIL allowed in state
  const nilAllowed = await isNILAllowedInState(stateCode, athleteLevel);
  if (!nilAllowed.allowed) {
    violations.push(nilAllowed.reason || 'NIL deals not allowed');
  }

  // Check 2: Deal category restrictions
  if (dealCategory) {
    const categoryAllowed = await isDealCategoryAllowed(stateCode, dealCategory);
    if (!categoryAllowed.allowed) {
      violations.push(categoryAllowed.reason || `Category "${dealCategory}" is prohibited`);
    }
  }

  // Check 3: School approval requirement
  if (rules.school_approval_required && !hasSchoolApproval) {
    violations.push(`${rules.state_name} requires school approval for NIL deals`);
    requirements.push('Obtain approval from your school\'s compliance office');
  }

  // Check 4: Agent registration requirement
  if (rules.agent_registration_required && !hasAgentRegistration) {
    violations.push(`${rules.state_name} requires agents to be registered with the state`);
    requirements.push('Ensure your agent/agency is registered with the state');
  }

  // Check 5: Disclosure requirement
  if (rules.disclosure_required && !hasDisclosure) {
    warnings.push(`${rules.state_name} requires NIL deals to be disclosed to your school`);
    requirements.push('Disclose this deal to your athletic department within the required timeframe');
  }

  // Check 6: Financial literacy requirement
  if (rules.financial_literacy_required && !hasFinancialLiteracy) {
    warnings.push(`${rules.state_name} requires athletes to complete financial literacy education`);
    requirements.push('Complete required financial literacy course before signing deals');
  }

  // Check 7: Additional restrictions from rules_summary
  if ((rules as any).restrictions && (rules as any).restrictions.length > 0) {
    (rules as any).restrictions.forEach((restriction: string) => {
      warnings.push(`Additional restriction: ${restriction}`);
    });
  }

  return {
    compliant: violations.length === 0,
    violations,
    warnings,
    requirements,
    state_name: rules.state_name,
  };
}

/**
 * Extract state code from various inputs
 * Handles: "Kentucky", "KY", "University of Kentucky", etc.
 */
export function extractStateCode(input: string): string | null {
  const stateMap: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  };

  const normalizedInput = input.toLowerCase().trim();

  // Check if already a state code (2 letters)
  if (/^[A-Z]{2}$/i.test(input)) {
    return input.toUpperCase();
  }

  // Check state name mapping
  for (const [stateName, stateCode] of Object.entries(stateMap)) {
    if (normalizedInput.includes(stateName)) {
      return stateCode;
    }
  }

  return null;
}

/**
 * Get athlete level from school name
 */
export function getAthleteLevel(schoolName: string): 'high_school' | 'college' | 'unknown' {
  const name = schoolName.toLowerCase();

  if (
    name.includes('high school') ||
    name.includes('hs') ||
    name.includes('academy') ||
    name.includes('prep')
  ) {
    return 'high_school';
  }

  if (
    name.includes('university') ||
    name.includes('college') ||
    name.includes('community college') ||
    name.includes('junior college')
  ) {
    return 'college';
  }

  return 'unknown';
}

/**
 * Format compliance result for display
 */
export function formatComplianceResult(result: ComplianceCheckResult): string {
  let output = `NIL Compliance Check - ${result.state_name}\n\n`;

  if (result.compliant) {
    output += '✅ This deal appears to be compliant with state NIL rules.\n\n';
  } else {
    output += '❌ This deal has compliance violations:\n';
    result.violations.forEach(v => output += `  - ${v}\n`);
    output += '\n';
  }

  if (result.warnings.length > 0) {
    output += '⚠️ Warnings:\n';
    result.warnings.forEach(w => output += `  - ${w}\n`);
    output += '\n';
  }

  if (result.requirements.length > 0) {
    output += '📋 Requirements:\n';
    result.requirements.forEach(r => output += `  - ${r}\n`);
  }

  return output;
}
