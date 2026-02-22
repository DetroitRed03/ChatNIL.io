import { SupabaseClient } from '@supabase/supabase-js';
import { STATE_NIL_RULES_MAP } from '@/lib/data/state-nil-rules-2026';

export async function getStateRulesContext(
  stateCode: string | null | undefined,
  supabase: SupabaseClient
): Promise<string> {
  if (!stateCode) {
    return 'State not specified. Please update your profile with your state for personalized guidance.';
  }

  const normalizedCode = stateCode.toUpperCase();

  // Try database first
  const { data: rules } = await supabase
    .from('jurisdictions')
    .select('*')
    .eq('state_code', normalizedCode)
    .single();

  if (rules) {
    return buildContextFromDB(rules);
  }

  // Fallback to static data if DB query fails or state not in jurisdictions table
  const staticRule = STATE_NIL_RULES_MAP[normalizedCode];
  if (staticRule) {
    return buildContextFromStatic(staticRule);
  }

  return `Rules for ${stateCode} are not yet in our database. General NCAA rules apply. We recommend checking your state's athletic association for specific guidance.`;
}

function buildContextFromDB(rules: Record<string, any>): string {
  let context = `**${rules.state_name || rules.state_code} (${rules.state_code}) NIL Rules:**\n`;

  if (rules.hs_nil_allowed !== null) {
    context += `- High School NIL: ${rules.hs_nil_allowed ? 'Allowed with restrictions' : 'Not currently allowed'}\n`;
  }

  if (rules.college_nil_allowed !== null) {
    context += `- College NIL: ${rules.college_nil_allowed ? 'Allowed' : 'Restricted'}\n`;
  }

  if (rules.key_restrictions) {
    context += `- Key Restrictions: ${rules.key_restrictions}\n`;
  }

  if (rules.reporting_requirements) {
    context += `- Reporting: ${rules.reporting_requirements}\n`;
  }

  if (rules.disclosure_deadline_days) {
    context += `- Disclosure Deadline: ${rules.disclosure_deadline_days} days\n`;
  }

  if (rules.prohibited_categories && Array.isArray(rules.prohibited_categories)) {
    context += `- Prohibited Categories: ${rules.prohibited_categories.join(', ')}\n`;
  } else if (rules.prohibited_activities && Array.isArray(rules.prohibited_activities)) {
    context += `- Prohibited Categories: ${rules.prohibited_activities.join(', ')}\n`;
  }

  return context;
}

function buildContextFromStatic(rule: typeof STATE_NIL_RULES_MAP[string]): string {
  let context = `**${rule.stateName} (${rule.stateCode}) NIL Rules:**\n`;

  context += `- High School NIL: ${rule.hsNilAllowed ? 'Allowed with restrictions' : 'Not currently allowed'}\n`;
  context += `- College NIL: ${rule.collegeNilAllowed ? 'Allowed' : 'Restricted'}\n`;

  if (rule.hsRequiresParentConsent) {
    context += `- Parental Consent: Required for HS athletes\n`;
  }

  if (rule.disclosureRequired && rule.disclosureDays) {
    context += `- Disclosure Deadline: ${rule.disclosureDays} days\n`;
  }

  if (rule.prohibitedCategories.length > 0) {
    context += `- Prohibited Categories: ${rule.prohibitedCategories.join(', ')}\n`;
  }

  if (rule.hsRestrictions && rule.hsRestrictions.length > 0) {
    context += `- Key Restrictions: ${rule.hsRestrictions.join('; ')}\n`;
  }

  return context;
}
