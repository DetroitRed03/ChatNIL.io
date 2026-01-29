/**
 * College Athlete Dashboard Components
 * =====================================
 * Protection-focused dashboard for college athletes.
 * Centers on making athletes feel PROTECTED, not anxious.
 *
 * V2 Architecture (Protection Dashboard):
 * - Protection Hero: "Am I safe?" status
 * - Urgent Deals: Problems that need fixing (6-dimension breakdown)
 * - Protected Deals: Fully compliant deals
 * - Action Center: Friendly to-do list
 * - Tax Tracker: Proactive tax reminders
 * - School Reporting: Compliance submission workflow
 */

// V2 Protection Dashboard (Recommended)
export { CollegeAthleteDashboardV2 } from './CollegeAthleteDashboardV2';

// V2 Component Exports
export * from './shared';
export * from './protection-hero';
export * from './urgent-deals';
export * from './protected-deals';
export * from './action-center';
export * from './tax-tracker';
export * from './compliance-submission';

// Legacy V1 Components (keep for backwards compatibility)
export { CollegeAthleteDashboard } from './CollegeAthleteDashboard';
export { ComplianceStatusBanner } from './ComplianceStatusBanner';
export { DealValidationCTA } from './DealValidationCTA';
export { DealsListCard } from './DealsListCard';
export { TaxTrackerCard } from './TaxTrackerCard';
export { CollegeStateRulesCard } from './CollegeStateRulesCard';
export { RecentActivityFeed } from './RecentActivityFeed';
export { ValidateDealModal } from './ValidateDealModal';
