/**
 * Deal Validation Wizard Components
 * ==================================
 * Multi-step wizard for validating NIL deals using the 6-dimensional
 * compliance scoring engine.
 */

export { DealValidationWizard } from './DealValidationWizard';
export { WizardProgress } from './WizardProgress';
export { ScoreBreakdown } from './ScoreBreakdown';
export { DimensionScore } from './DimensionScore';
export { IssueCard } from './IssueCard';
export { RecommendationList } from './RecommendationList';

// Step components
export { DealBasicsStep } from './steps/DealBasicsStep';
export { VerificationStep } from './steps/VerificationStep';
export { ResultsStep } from './steps/ResultsStep';

// Types
export type { DealBasicsData } from './steps/DealBasicsStep';
export type { VerificationData } from './steps/VerificationStep';
