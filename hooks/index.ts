// Centralized exports for all custom hooks

export { useAutoSave } from './useAutoSave';
export { useChatSync } from './useChatSync';
export { useDarkMode } from './useDarkMode';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useOnboardingGate } from './useOnboardingGate';
export { usePageHistory } from './usePageHistory';
export { useSidebarResize } from './useSidebarResize';

// Dashboard data hooks
export {
  useAthleteMetrics,
  useAgencyMetrics,
  useActivityFeed,
  useCampaignOpportunities,
  useNotifications,
  useUserProfile,
  useMessageThreads,
  useQuizProgress,
  useRecentChats,
  useQuizUnlockStatus,
  type AthleteMetrics,
  type AgencyMetrics,
  type ActivityFeedItem,
  type ActivityFeedResponse,
} from './useDashboardData';
