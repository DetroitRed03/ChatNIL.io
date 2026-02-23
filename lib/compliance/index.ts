/**
 * 6-Dimensional Compliance Scoring Engine
 * ========================================
 * ChatNIL's Core Patent: Determines if an NIL deal is legitimate
 * third-party compensation or disguised pay-for-play.
 *
 * @module lib/compliance
 */

// Main scoring function
export { calculateComplianceScore } from './calculate-score';

// AI Analysis
export {
  getAIAnalysisForDeal,
  isAIAnalysisEnabled,
  isAIAnalysisEnabledForInstitution,
  runAIContractAnalysis,
  getAIRiskScoreAdjustment,
} from './ai-analysis';
export type { AIAnalysisResult, AIRedFlag, AIKeyTerm } from './ai-analysis';

// Types
export * from './types';

// FMV advisory check (separate from dimension scorer)
export { analyzeFMV, estimateAthleteFMV } from './fmv-check';
export type { FMVAnalysis } from './fmv-check';

// Individual dimension scorers (for testing or custom scoring)
export { calculatePolicyFit } from './dimensions/policy-fit';
export { calculateDocumentHygiene } from './dimensions/document-hygiene';
export { calculateFMVVerification, calculateExpectedFMV } from './dimensions/fmv-verification';
export { calculateTaxReadiness } from './dimensions/tax-readiness';
export { calculateBrandSafety } from './dimensions/brand-safety';
export { calculateGuardianConsent } from './dimensions/guardian-consent';

// API helper functions
import type {
  ComplianceScoringInput,
  ComplianceScoreResult,
  QuickRiskResult,
} from './types';

/**
 * Quick risk check - fast preliminary assessment
 */
export async function quickRiskCheck(input: ComplianceScoringInput): Promise<QuickRiskResult> {
  const quickIssues: string[] = [];
  let score = 100;

  // Check payment source
  if (input.policyFitInputs.paymentSource === 'booster') {
    quickIssues.push('Payment from booster source - high pay-for-play risk');
    score -= 40;
  }

  // Check performance-based payment
  if (input.policyFitInputs.paymentTiedToPerformance) {
    quickIssues.push('Performance-based compensation detected');
    score -= 30;
  }

  // Check enrollment-tied payment
  if (input.policyFitInputs.paymentTiedToEnrollment) {
    quickIssues.push('Payment tied to enrollment - prohibited');
    score -= 50;
  }

  // Check for missing contract
  if (!input.documentInputs.hasContract) {
    quickIssues.push('No contract on file');
    score -= 15;
  }

  // Check guardian consent for minors
  if (input.athleteAge < 18 && input.guardianConsentInputs.consentStatus !== 'approved') {
    quickIssues.push('Missing guardian consent for minor athlete');
    score -= 25;
  }

  // Determine risk tier
  let riskTier: 'green' | 'yellow' | 'red';
  if (score >= 80) riskTier = 'green';
  else if (score >= 50) riskTier = 'yellow';
  else riskTier = 'red';

  return { riskTier, quickIssues };
}

/**
 * Generate a markdown summary of compliance score
 */
export function generateScoreSummary(result: ComplianceScoreResult): string {
  const tierEmoji = result.riskTier === 'green' ? '🟢' : result.riskTier === 'yellow' ? '🟡' : '🔴';
  const tierLabel = result.riskTier.toUpperCase();

  let md = `# Compliance Score Report\n\n`;
  md += `**Overall Score:** ${result.totalScore}/100 ${tierEmoji} ${tierLabel}\n\n`;
  md += `**Scored At:** ${new Date(result.scoredAt).toLocaleString()}\n\n`;

  md += `## Dimension Breakdown\n\n`;
  md += `| Dimension | Score | Weight | Contribution |\n`;
  md += `|-----------|-------|--------|-------------|\n`;

  for (const dim of result.dimensionDetails) {
    const dimName = dim.dimension.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    md += `| ${dimName} | ${dim.score} | ${(dim.weight * 100).toFixed(0)}% | ${dim.weightedContribution.toFixed(1)} |\n`;
  }

  if (result.criticalIssues.length > 0) {
    md += `\n## Critical Issues\n\n`;
    for (const issue of result.criticalIssues) {
      md += `- ❌ ${issue}\n`;
    }
  }

  if (result.warnings.length > 0) {
    md += `\n## Warnings\n\n`;
    for (const warning of result.warnings) {
      md += `- ⚠️ ${warning}\n`;
    }
  }

  if (result.fixRecommendations.length > 0) {
    md += `\n## Recommendations\n\n`;
    for (const rec of result.fixRecommendations) {
      md += `- **[${rec.priority.toUpperCase()}]** ${rec.issue}: ${rec.action}\n`;
    }
  }

  return md;
}
