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
 * - GREEN (80-100): Compliant - proceed with confidence
 * - YELLOW (50-79): Issues to address - fixable
 * - RED (0-49): Non-compliant - do not proceed
 *
 * FMV CHECK IS ADVISORY ONLY — it reduces score but never blocks approval.
 * Only prohibited categories, state bans, and denied guardian consent block deals.
 */

import { DealInput, AthleteContext, ComplianceResult, ComplianceFlag, FMVAnalysisSummary, getStatusFromScore } from './types';
import { calculatePolicyFit } from './dimensions/policy-fit';
import { calculateDocumentHygiene } from './dimensions/document-hygiene';
import { calculateFMVVerification } from './dimensions/fmv-verification';
import { calculateTaxReadiness } from './dimensions/tax-readiness';
import { calculateBrandSafety } from './dimensions/brand-safety';
import { calculateGuardianConsent } from './dimensions/guardian-consent';
import { analyzeFMV, estimateAthleteFMV } from './fmv-check';

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

  // --- Build advisory flags with blocking distinction ---
  const flags: ComplianceFlag[] = [];
  let canBeApproved = true;

  // FMV Advisory — NEVER blocks
  const estimatedFMV = estimateAthleteFMV({
    followers: athlete.followers,
    sport: athlete.sport,
    engagementRate: athlete.engagementRate,
  });
  const fmvResult = analyzeFMV(deal.compensation, estimatedFMV);
  let fmvAnalysis: FMVAnalysisSummary | undefined;

  if (fmvResult.flag) {
    flags.push({
      type: 'fmv',
      severity: fmvResult.severity === 'high' ? 'warning' : 'info',
      message: fmvResult.flag,
      isBlocking: false,
    });
    fmvAnalysis = {
      estimatedFMV: fmvResult.estimatedFMV,
      actualAmount: fmvResult.actualAmount,
      ratio: fmvResult.ratio,
      severity: fmvResult.severity,
      flag: fmvResult.flag,
    };
  }

  // Prohibited brand category — BLOCKS
  if (brandSafety.score === 0) {
    const prohibitedCode = brandSafety.reasonCodes.find(c => c.startsWith('PROHIBITED_BRAND'));
    if (prohibitedCode) {
      flags.push({
        type: 'category',
        severity: 'critical',
        message: brandSafety.notes || 'Brand is in a prohibited category for student athletes.',
        isBlocking: true,
      });
      canBeApproved = false;
    }
  }

  // State NIL ban for HS — BLOCKS
  if (policyFit.reasonCodes.includes('STATE_HS_NIL_PROHIBITED')) {
    flags.push({
      type: 'state',
      severity: 'critical',
      message: `High school NIL is not permitted in ${athlete.state}.`,
      isBlocking: true,
    });
    canBeApproved = false;
  }

  // Guardian consent denied — BLOCKS
  if (guardianConsent.reasonCodes.includes('GUARDIAN_CONSENT_DENIED')) {
    flags.push({
      type: 'consent',
      severity: 'critical',
      message: 'Parent/guardian has denied consent for NIL activities.',
      isBlocking: true,
    });
    canBeApproved = false;
  }

  // Performance-based compensation — WARNING (not blocking)
  if (policyFit.reasonCodes.includes('PERFORMANCE_BASED_COMPENSATION')) {
    flags.push({
      type: 'policy',
      severity: 'warning',
      message: 'Compensation may be tied to athletic performance (pay-for-play risk).',
      isBlocking: false,
    });
  }

  // Booster connected — WARNING
  if (policyFit.reasonCodes.includes('BOOSTER_CONNECTED')) {
    flags.push({
      type: 'policy',
      severity: 'warning',
      message: 'Deal appears connected to a booster or collective.',
      isBlocking: false,
    });
  }

  // Missing documents — INFO
  if (documentHygiene.score < 60) {
    flags.push({
      type: 'document',
      severity: 'info',
      message: documentHygiene.notes || 'Some documentation is missing or incomplete.',
      isBlocking: false,
    });
  }

  // Guardian consent pending/missing — WARNING
  if (guardianConsent.reasonCodes.includes('GUARDIAN_CONSENT_PENDING')) {
    flags.push({
      type: 'consent',
      severity: 'warning',
      message: 'Awaiting parent/guardian approval.',
      isBlocking: false,
    });
  }
  if (guardianConsent.reasonCodes.includes('GUARDIAN_CONSENT_MISSING')) {
    flags.push({
      type: 'consent',
      severity: 'warning',
      message: 'Guardian consent required but not on file.',
      isBlocking: false,
    });
  }

  const requiresReview = flags.some(f => f.severity === 'warning' || f.severity === 'critical');

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
    flags,
    fmvAnalysis,
    canBeApproved,
    requiresReview,
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
