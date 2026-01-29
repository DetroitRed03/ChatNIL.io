import { createClient } from '@supabase/supabase-js';
import { SYSTEM_PROMPTS, DEFAULT_SYSTEM_PROMPT, UserRole } from './system-prompts';
import { buildUserContext } from './context/build-context';

interface GetPromptResult {
  systemPrompt: string;
  userContext: Record<string, string | number | null>;
  role: UserRole | null;
}

export async function getPromptForUser(userId: string | null): Promise<GetPromptResult> {
  if (!userId) {
    return {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      userContext: {},
      role: null
    };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user profile - try athlete_profiles first (by user_id then id)
  let profile = null;
  let role: UserRole | null = null;

  const { data: profileByUserId } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileByUserId) {
    profile = profileByUserId;
    role = profileByUserId.role as UserRole;
  } else {
    const { data: profileById } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileById) {
      profile = profileById;
      role = profileById.role as UserRole;
    }
  }

  if (!profile || !role) {
    return {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      userContext: {},
      role: null
    };
  }

  const config = SYSTEM_PROMPTS[role];

  if (!config) {
    return {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      userContext: {},
      role: null
    };
  }

  // Build user-specific context
  const userContext = await buildUserContext(userId, role, supabase);

  // Interpolate context into prompts
  const systemPrompt = interpolateTemplate(config.basePrompt, userContext);
  const contextSection = interpolateTemplate(config.contextTemplate, userContext);

  return {
    systemPrompt: `${systemPrompt}\n\n${contextSection}`,
    userContext,
    role
  };
}

function interpolateTemplate(
  template: string,
  context: Record<string, string | number | null>
): string {
  let result = template;

  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{{${key}}}`;
    const displayValue = value === null || value === undefined ? 'Unknown' : String(value);
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), displayValue);
  }

  // Remove any remaining unmatched placeholders
  result = result.replace(/\{\{[A-Z_]+\}\}/g, 'Not available');

  return result;
}
