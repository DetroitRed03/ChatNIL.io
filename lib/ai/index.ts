// New template-based system
export { getPromptForUser } from './get-prompt-for-role';
export { SYSTEM_PROMPTS, DEFAULT_SYSTEM_PROMPT, getConversationStarter } from './system-prompts';
export type { UserRole, SystemPromptConfig } from './system-prompts';

// Legacy function-based system (for backward compatibility with /api/chat/ai)
export { getSystemPrompt, getLegacyConversationStarter } from './system-prompts';
export type { UserContext, LegacyUserRole } from './system-prompts';
