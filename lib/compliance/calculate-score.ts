/**
 * 6-Dimensional Compliance Scoring Engine - Main Orchestrator
 * ============================================================
 * Core patent for ChatNIL: Determines if an NIL deal is legitimate
 * third-party compensation or disguised pay-for-play.
 *
 * SCORING FORMULA:
 * Total = (PolicyFit × 0.30) + (DocumentHygiene × 0.20) + (FMV × 0.15) +
 *         (Tax × 0.15) + (BrandSafety × 0.10) + (GuardianConsent × 0.10)
 *
 * STATUS THRESHOLDS:
 * - 🟢 GREEN (80-100): Compliant - proceed with confidence
 * - 🟡 YELLOW (50-79): Issues to address - fixable
 * - 🔴 RED (0-49): Non-compliant - do not proceed
 */

import { DealInput, AthleteContext, ComplianceResult, getStatusFromScore } from './types';
import { calculatePolicyFit } from './dimensions/policy-fit';
import { calculateDocumentHygiene } from './dimensions/document-hygiene';
import { calculateFMVVerification } from './dimensions/fmv-verification';
import { calculateTaxReadiness } from './dimensions/tax-readiness';
import { calculateBrandSafety } from './dimensions/brand-safety';
import { calculateGuardianConsent } from './dimensions/guardian-consent';

export async function calculateComplianceScore(
  deal: DealInput,
  athlete: AthleteContext
): Promise<ComplianceResult> {

  // Calculate all dimensions in parallel for performance
  const [
    policyFit,
    documentHygiene,
    fmvVerification,
    taxReadiness,
    brandSafety,
    guardianConsent
  ] = await Promise.all([
    calculatePolicyFit(deal, athlete),
    calculateDocumentHygiene(deal),
    calculateFMVVerification(deal, athlete),
    calculateTaxReadiness(deal, athlete),
    calculateBrandSafety(deal),
    calculateGuardianConsent(deal, athlete)
  ]);

  // Calculate total weighted score
  const totalScore = Math.round(
    policyFit.weightedScore +
    documentHygiene.weightedScore +
    fmvVerification.weightedScore +
    taxReadiness.weightedScore +
    brandSafety.weightedScore +
    guardianConsent.weightedScore
  );

  // Determine overall status
  const status = getStatusFromScore(totalScore);

  // Aggregate reason codes and recommendations
  const allReasonCodes = [
    ...policyFit.reasonCodes,
    ...documentHygiene.reasonCodes,
    ...fmvVerification.reasonCodes,
    ...taxReadiness.reasonCodes,
    ...brandSafety.reasonCodes,
    ...guardianConsent.reasonCodes
  ];

  const allRecommendations = [
    ...policyFit.recommendations,
    ...documentHygiene.recommendations,
    ...fmvVerification.recommendations,
    ...taxReadiness.recommendations,
    ...brandSafety.recommendations,
    ...guardianConsent.recommendations
  ];

  // Determine pay-for-play risk
  const payForPlayRisk = determinePayForPlayRisk(deal, policyFit, fmvVerification);

  // Verify third-party legitimacy
  const isThirdPartyVerified = !deal.isSchoolAffiliated &&
                               !deal.isBoosterConnected &&
                               !deal.performanceBased &&
                               brandSafety.score >= 50;

  return {
    dealId: deal.id,
    athleteId: athlete.id,
    totalScore,
    status,
    dimensions: {
      policyFit,
      documentHygiene,
      fmvVerification,
      taxReadiness,
      brandSafety,
      guardianConsent
    },
    overallReasonCodes: allReasonCodes,
    overallRecommendations: prioritizeRecommendations(allRecommendations, status),
    isThirdPartyVerified,
    payForPlayRisk,
    scoredAt: new Date().toISOString()
  };
}

function determinePayForPlayRisk(
  deal: DealInput,
  policyFit: any,
  fmvVerification: any
): 'low' | 'medium' | 'high' {
  // High risk indicators
  if (deal.isBoosterConnected || deal.performanceBased) return 'high';
  if (deal.isSchoolAffiliated) return 'high';
  if (fmvVerification.reasonCodes.includes('FMV_EXTREME_OVERPAYMENT')) return 'high';

  // Medium risk indicators
  if (fmvVerification.reasonCodes.includes('FMV_SIGNIFICANT_OVERPAYMENT')) return 'medium';
  if (policyFit.score < 70) return 'medium';

  return 'low';
}

function prioritizeRecommendations(recommendations: string[], status: string): string[] {
  // Return top 5 most important recommendations, deduplicated
  return [...new Set(recommendations)].slice(0, 5);
}
