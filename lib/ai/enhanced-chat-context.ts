/**
 * Enhanced Chat Context Builder
 * =============================
 * Combines role-specific system prompts with real-time dashboard data
 * to create a fully context-aware AI chat experience.
 */

import { getDashboardContext, DashboardContext } from './dashboard-context';

export interface EnhancedContext {
  systemPrompt: string;
  dashboardContext: DashboardContext;
  fullContext: string;
}

/**
 * Build enhanced chat context with dashboard awareness
 */
export async function buildEnhancedChatContext(
  userId: string,
  role: string,
  supabase: any,
  baseSystemPrompt?: string
): Promise<EnhancedContext> {
  // Get real-time dashboard data
  const dashboardContext = await getDashboardContext(userId, role, supabase);

  // Build the dashboard injection that gets added to the system prompt
  const dashboardInjection = buildDashboardInjection(dashboardContext);

  // Combine base prompt with dashboard context
  const fullContext = baseSystemPrompt
    ? `${baseSystemPrompt}\n\n${dashboardInjection}`
    : dashboardInjection;

  return {
    systemPrompt: baseSystemPrompt || '',
    dashboardContext,
    fullContext
  };
}

/**
 * Build the dashboard injection XML block
 */
function buildDashboardInjection(dashboardContext: DashboardContext): string {
  return `
<real_time_dashboard_data>
${dashboardContext.summary}

RAW DATA FOR REFERENCE:
${JSON.stringify(dashboardContext.data, null, 2)}

AVAILABLE ACTIONS YOU CAN HELP WITH:
${dashboardContext.availableActions.map(a => `- ${formatActionName(a)}`).join('\n')}
</real_time_dashboard_data>

IMPORTANT INSTRUCTIONS FOR USING DASHBOARD DATA:
1. Use the dashboard data above to answer questions about the user's specific situation
2. Reference specific numbers, names, and details from their data
3. When they ask about their athletes/deals/progress, use the ACTUAL data shown above
4. If they ask to take an action (generate report, send email, etc.), guide them through it
5. Be specific - say "Your Crypto Exchange deal at 51/100" not "your flagged deal"
6. For compliance officers: Know exact counts, names of flagged athletes, amounts
7. For athletes: Know their specific deals, scores, tax obligations
8. For HS students: Know their progress, current chapter, badges earned
9. For parents: Know their children's names and progress

CRITICAL: DO NOT say "I don't have access to that information" - you DO have access via the data above.
When asked about specific data, ALWAYS reference the dashboard data provided.
`;
}

/**
 * Format action names for display
 */
function formatActionName(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Quick helper to check if dashboard context has data
 */
export function hasDashboardData(context: DashboardContext): boolean {
  return Object.keys(context.data).length > 0;
}

/**
 * Get a summary string suitable for logging
 */
export function getContextSummary(context: EnhancedContext): string {
  const { dashboardContext } = context;
  const dataKeys = Object.keys(dashboardContext.data);

  return `Role: ${dashboardContext.role}, Data keys: ${dataKeys.join(', ')}, Actions: ${dashboardContext.availableActions.length}`;
}
