/**
 * Compliance Dashboard Components
 * ================================
 * NCAA compliance monitoring dashboard for compliance officers.
 *
 * Level 1: Overview Dashboard
 * - ComplianceOverview (main dashboard)
 * - NeedsAttentionList (alerts)
 * - DeadlineTracker (reporting deadlines)
 * - ComplianceStats (status breakdown)
 * - SportBreakdown (by sport analysis)
 * - QuickActions (navigation shortcuts)
 *
 * Level 2: Athlete List
 * - AthleteListPage (main list page)
 * - AthleteTable (data table)
 * - AthleteFilters (search/filter controls)
 *
 * Level 3: Athlete Detail
 * - AthleteDetailPage (main detail page)
 * - AthleteHeader (athlete info banner)
 * - ComplianceSummaryCard (status summary)
 * - AthleteDealsList (deals table)
 * - OverridePanel (manual override form)
 * - AuditTrail (activity log)
 */

// Level 1 - Overview
export { ComplianceOverview } from './ComplianceOverview';
export { NeedsAttentionList } from './NeedsAttentionList';
export { DeadlineTracker } from './DeadlineTracker';
export { ComplianceStats } from './ComplianceStats';
export { SportBreakdown } from './SportBreakdown';
export { QuickActions } from './QuickActions';

// Level 2 - Athlete List
export { AthleteListPage } from './AthleteListPage';
export { AthleteTable } from './AthleteTable';
export { AthleteFilters } from './AthleteFilters';

// Level 3 - Athlete Detail
export { AthleteDetailPage } from './AthleteDetailPage';
export { AthleteHeader } from './AthleteHeader';
export { ComplianceSummaryCard } from './ComplianceSummaryCard';
export { AthleteDealsList } from './AthleteDealsList';
export { OverridePanel } from './OverridePanel';
export { AuditTrail } from './AuditTrail';

// V2 Dashboard Redesign
export { ComplianceDashboardRedesign } from './ComplianceDashboardRedesign';
export { ActionRequiredSection } from './ActionRequiredSection';
export { ActionRequiredItem } from './ActionRequiredItem';
export { ProgramHealthCard } from './ProgramHealthCard';
export { ThisWeekCard } from './ThisWeekCard';
export { AuditReadinessCard } from './AuditReadinessCard';
export { DeadlineTimeline } from './DeadlineTimeline';
export { ComplianceBySport } from './ComplianceBySport';
export { SportComplianceRow } from './SportComplianceRow';
export { RecentActivityFeed } from './RecentActivityFeed';
export { ActivityFeedItem } from './ActivityFeedItem';
export { EmptyStateOnboarding } from './EmptyStateOnboarding';
export { OnboardingStep } from './OnboardingStep';

// V3 Enterprise Dashboard (600+ athletes, team workload, bulk actions)
export * from './enterprise';
