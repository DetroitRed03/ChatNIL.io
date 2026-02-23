/**
 * 6-Dimensional Compliance Scoring Engine - Type Definitions
 * ============================================================
 * Core patent for ChatNIL: Answers "Is this deal legitimate third-party NIL
 * or disguised pay-for-play?"
 *
 * Status Thresholds:
 * - 🟢 GREEN (80-100): Compliant - proceed with confidence
 * - 🟡 YELLOW (50-79): Issues to address - fixable
 * - 🔴 RED (0-49): Non-compliant - do not proceed
 */

// ============================================================================
// Core Input Types
// ============================================================================

export interface DealInput {
  id?: string;
  athleteId: string;
  dealType: 'social_post' | 'appearance' | 'endorsement' | 'brand_ambassador' | 'merchandise' | 'other';
  thirdPartyName: string;
  thirdPartyType?: 'brand' | 'agency' | 'local_business' | 'individual' | 'unknown';
  compensation: number;
  deliverables: string;
  contractText?: string;
  contractUrl?: string;
  state: string;
  startDate?: string;
  endDate?: string;
  isSchoolAffiliated?: boolean;
  isBoosterConnected?: boolean;
  performanceBased?: boolean;
}

export interface AthleteContext {
  id: string;
  role: 'hs_student' | 'college_athlete';
  isMinor: boolean;
  state: string;
  sport: string;
  followers: number;
  engagementRate: number;
  consentStatus?: 'pending' | 'approved' | 'denied';
  hasAcknowledgedTaxObligations?: boolean;
}

// ============================================================================
// Score Types
// ============================================================================

export interface DimensionScore {
  score: number;           // 0-100
  weight: number;          // 0.10-0.30
  weightedScore: number;   // score × weight
  status: 'green' | 'yellow' | 'red';
  reasonCodes: string[];
  notes: string;
  recommendations: string[];
}

export interface ComplianceFlag {
  type: 'fmv' | 'category' | 'state' | 'disclosure' | 'document' | 'policy' | 'consent' | 'other';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  isBlocking: boolean; // Only true for prohibited categories, state bans, etc.
}

export interface FMVAnalysisSummary {
  estimatedFMV: number;
  actualAmount: number;
  ratio: number;
  severity: 'none' | 'low' | 'medium' | 'high';
  flag?: string;
}

export interface ComplianceResult {
  dealId?: string;
  athleteId: string;
  totalScore: number;
  status: 'green' | 'yellow' | 'red';
  dimensions: {
    policyFit: DimensionScore;
    documentHygiene: DimensionScore;
    fmvVerification: DimensionScore;
    taxReadiness: DimensionScore;
    brandSafety: DimensionScore;
    guardianConsent: DimensionScore;
  };
  overallReasonCodes: string[];
  overallRecommendations: string[];
  flags: ComplianceFlag[];
  fmvAnalysis?: FMVAnalysisSummary;
  canBeApproved: boolean;       // false only for hard blockers (prohibited category, state ban)
  requiresReview: boolean;       // true if any warning/critical flags
  isThirdPartyVerified: boolean;
  payForPlayRisk: 'low' | 'medium' | 'high';
  scoredAt: string;
}

// ============================================================================
// Reference Data Types
// ============================================================================

export interface StateRules {
  state_code: string;
  state_name: string;
  hs_nil_allowed: boolean;
  hs_parental_consent_required: boolean;
  hs_school_approval_required: boolean;
  college_nil_allowed: boolean;
  college_disclosure_required: boolean;
  college_disclosure_deadline_days: number;
  prohibited_activities: string[];
  prohibited_deal_types?: string[];
  requires_contract: boolean;
  requires_disclosure: boolean;
}

export interface ProhibitedTerm {
  id: string;
  term: string;
  term_variations: string[];
  category: string;
  severity: 'red' | 'orange' | 'yellow';
  auto_reject: boolean;
  description: string;
  why_prohibited: string;
  applies_to_hs: boolean;
  applies_to_college: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const DIMENSION_WEIGHTS = {
  POLICY_FIT: 0.30,
  DOCUMENT_HYGIENE: 0.20,
  FMV_VERIFICATION: 0.15,
  TAX_READINESS: 0.15,
  BRAND_SAFETY: 0.10,
  GUARDIAN_CONSENT: 0.10,
} as const;

// Status thresholds
export const STATUS_THRESHOLDS = {
  GREEN: 80,  // 80-100 = Green (Compliant)
  YELLOW: 50, // 50-79 = Yellow (Issues to address)
  RED: 0,     // 0-49 = Red (Non-compliant)
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

export function getStatusFromScore(score: number): 'green' | 'yellow' | 'red' {
  if (score >= STATUS_THRESHOLDS.GREEN) return 'green';
  if (score >= STATUS_THRESHOLDS.YELLOW) return 'yellow';
  return 'red';
}

export function createDimensionScore(
  score: number,
  weight: number,
  reasonCodes: string[],
  notes: string,
  recommendations: string[]
): DimensionScore {
  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    weight,
    weightedScore: finalScore * weight,
    status: getStatusFromScore(finalScore),
    reasonCodes,
    notes,
    recommendations,
  };
}

// ============================================================================
// API Input/Output Types (for route handlers)
// ============================================================================

export interface ComplianceScoringInput {
  dealId: string;
  athleteId: string;
  brandName: string;
  dealValue: number;
  dealCategory: string;
  athleteState: string;
  athleteLevel: 'high_school' | 'college';
  athleteAge: number;
  institutionId?: string;

  policyFitInputs: {
    hasSchoolApproval: boolean;
    hasDisclosure: boolean;
    disclosureDate?: string;
    isThirdPartyVerified: boolean;
    thirdPartyName?: string;
    paymentSource: 'brand' | 'collective' | 'booster' | 'unknown';
    hasDeliverables: boolean;
    deliverables: string[];
    paymentTiedToPerformance: boolean;
    paymentTiedToEnrollment: boolean;
  };

  documentInputs: {
    hasContract: boolean;
    contractDocumentId?: string;
    contractAnalysisResult?: {
      flaggedTerms: string[];
      flaggedClauses: string[];
      riskLevel: string;
      extractedParties: string[];
      extractedCompensation?: number;
      extractedDates?: any;
      extractedDeliverables: string[];
    };
    hasW9: boolean;
    hasDisclosureForm: boolean;
    hasGuardianConsent?: boolean;
    missingDocuments: string[];
  };

  fmvInputs: {
    dealValue: number;
    athleteFMVScore: number;
    comparableDeals: any[];
    socialFollowers: number;
    engagementRate: number;
    sport: string;
    position?: string;
    marketSize: 'large' | 'medium' | 'small';
  };

  taxInputs: {
    hasW9Submitted: boolean;
    understandsTaxObligations: boolean;
    has1099Ready: boolean;
    hasTaxProfessional: boolean;
    totalNILEarningsYTD: number;
    dealValue: number;
  };

  brandSafetyInputs: {
    brandCategory: string;
    brandName: string;
    productType: string;
    athleteLevel: 'high_school' | 'college';
  };

  guardianConsentInputs: {
    athleteAge: number;
    athleteLevel: 'high_school' | 'college';
    consentStatus: 'not_required' | 'pending' | 'approved' | 'denied';
    consentDocumentId?: string;
    consentDate?: string;
    guardianVerified: boolean;
  };
}

export interface DimensionDetail {
  dimension: string;
  score: number;
  weight: number;
  weightedContribution: number;
  subScores: { name: string; score: number; weight: number }[];
  flags: string[];
  notes: string;
}

export interface FixRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  dimension: string;
  issue: string;
  action: string;
  impact: string;
}

export interface ComplianceScoreResult {
  dealId: string;
  athleteId: string;
  totalScore: number;
  weightedScore: number;
  riskTier: 'green' | 'yellow' | 'red';
  policyFitScore: number;
  documentHygieneScore: number;
  fmvVerificationScore: number;
  taxReadinessScore: number;
  brandSafetyScore: number;
  guardianConsentScore: number;
  dimensionDetails: DimensionDetail[];
  criticalIssues: string[];
  warnings: string[];
  fixRecommendations: FixRecommendation[];
  reasonCodes: string[];
  scoredAt: string;
  scoreVersion: string;
  processingTimeMs: number;
}

export interface QuickRiskResult {
  riskTier: 'green' | 'yellow' | 'red';
  quickIssues: string[];
}
