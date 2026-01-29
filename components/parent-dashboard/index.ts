/**
 * Parent Dashboard Components
 * ===========================
 * Read-only monitoring dashboard for parents of HS student athletes.
 */

// V2 Dashboard (New Redesign)
export { ParentDashboardV2 } from './ParentDashboardV2';
export { StatusSummary } from './StatusSummary';
export { ChildOverviewCard } from './ChildOverviewCard';
export { ActivityFeed } from './ActivityFeed';
export { ConversationStarters } from './ConversationStarters';
export { NextMilestone } from './NextMilestone';
export { FamilyAccess } from './FamilyAccess';
export { TrustAndSafety } from './TrustAndSafety';

// V2 Modals
export { InviteCoParentModal } from './modals/InviteCoParentModal';
export { ParentalControlsModal } from './modals/ParentalControlsModal';
export { RevokeAccessModal } from './modals/RevokeAccessModal';

// Legacy V1 Components (kept for backwards compatibility)
export { ParentDashboard } from './ParentDashboard';
export { ChildCard } from './ChildCard';
export { ChildProgressView } from './ChildProgressView';
export { ParentActivityFeed } from './ParentActivityFeed';
export { ConsentManager } from './ConsentManager';
export { NotificationSettings } from './NotificationSettings';
export { AboutChatNIL } from './AboutChatNIL';

// Types
export type { ChildSummary } from './ChildCard';
export type { ActivityItem } from './ParentActivityFeed';
export type { NotificationPrefs } from './NotificationSettings';
