import { SupabaseClient } from '@supabase/supabase-js';

export async function getStateRulesContext(
  stateCode: string | null | undefined,
  supabase: SupabaseClient
): Promise<string> {
  if (!stateCode) {
    return 'State not specified. Please update your profile with your state for personalized guidance.';
  }

  const { data: rules } = await supabase
    .from('jurisdictions')
    .select('*')
    .eq('state_code', stateCode.toUpperCase())
    .single();

  if (!rules) {
    return `Rules for ${stateCode} are not yet in our database. General NCAA rules apply. We recommend checking your state's athletic association for specific guidance.`;
  }

  let context = `**${rules.state_name || stateCode} (${rules.state_code}) NIL Rules:**\n`;

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
  }

  return context;
}
