/**
 * FMV (Fair Market Value) Advisory Check
 * =======================================
 * Compares deal compensation against estimated athlete FMV.
 * This is ADVISORY ONLY — FMV flags never block deal approval.
 * Compliance reviewers see the analysis but can always approve.
 */

export interface FMVAnalysis {
  estimatedFMV: number;
  actualAmount: number;
  ratio: number;
  isOvervalued: boolean;
  isUndervalued: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  flag?: string;
  scoreImpact: number; // Points to deduct from FMV dimension (NOT a failure)
}

/**
 * Analyze deal amount vs estimated FMV.
 * Returns advisory flag — NEVER blocks a deal.
 */
export function analyzeFMV(
  dealAmount: number,
  estimatedFMV: number
): FMVAnalysis {
  if (estimatedFMV <= 0 || dealAmount <= 0) {
    return {
      estimatedFMV,
      actualAmount: dealAmount,
      ratio: 0,
      isOvervalued: false,
      isUndervalued: false,
      severity: 'none',
      scoreImpact: 0,
    };
  }

  const ratio = dealAmount / estimatedFMV;

  let severity: FMVAnalysis['severity'] = 'none';
  let flag: string | undefined;
  let scoreImpact = 0;

  // Overvalued thresholds — advisory only, not blocking
  if (ratio > 5) {
    severity = 'high';
    flag = `Deal value is ${ratio.toFixed(1)}x estimated FMV ($${estimatedFMV.toLocaleString()}). Reviewer should verify this is legitimate.`;
    scoreImpact = 20;
  } else if (ratio > 2.5) {
    severity = 'medium';
    flag = `Deal value is ${ratio.toFixed(1)}x estimated FMV. Consider verifying deal terms.`;
    scoreImpact = 10;
  } else if (ratio > 1.5) {
    severity = 'low';
    flag = `Deal value is above estimated FMV. This may be normal for premium partnerships.`;
    scoreImpact = 5;
  }

  // Significantly undervalued — athlete may be underselling
  const isUndervalued = ratio < 0.3;
  if (isUndervalued && !flag) {
    flag = `Deal value is significantly below estimated FMV. Athlete may be underselling.`;
    severity = 'low';
    scoreImpact = 5;
  }

  return {
    estimatedFMV,
    actualAmount: dealAmount,
    ratio,
    isOvervalued: ratio > 1.5,
    isUndervalued,
    severity,
    flag,
    scoreImpact,
  };
}

/**
 * Estimate athlete FMV based on social following, sport, division, and engagement.
 * Uses a simplified model consistent with the compliance engine.
 */
export function estimateAthleteFMV(athlete: {
  followers: number | {
    instagram?: number;
    tiktok?: number;
    twitter?: number;
    youtube?: number;
  };
  sport: string;
  division?: string;
  engagementRate?: number;
}): number {
  // Base rate per 1000 followers
  const baseRatePer1K = 10; // $10 per 1000 followers

  // Total followers — support both number and object format
  let totalFollowers: number;
  if (typeof athlete.followers === 'number') {
    totalFollowers = athlete.followers;
  } else {
    totalFollowers =
      (athlete.followers.instagram || 0) +
      (athlete.followers.tiktok || 0) +
      (athlete.followers.twitter || 0) +
      (athlete.followers.youtube || 0);
  }

  // Base FMV
  let fmv = (totalFollowers / 1000) * baseRatePer1K;

  // Sport multipliers
  const sportMultipliers: Record<string, number> = {
    football: 1.5,
    basketball: 1.4,
    baseball: 1.2,
    soccer: 1.1,
    volleyball: 1.0,
    softball: 1.0,
    track: 0.9,
    swimming: 0.9,
    tennis: 1.1,
    golf: 1.2,
    hockey: 1.1,
    lacrosse: 1.0,
    wrestling: 0.9,
    gymnastics: 1.1,
  };
  const sportMultiplier = sportMultipliers[athlete.sport.toLowerCase()] || 1.0;
  fmv *= sportMultiplier;

  // Division multiplier
  if (athlete.division === 'D1') fmv *= 1.3;
  else if (athlete.division === 'D2') fmv *= 1.1;

  // Engagement rate bonus (above average 3%)
  if (athlete.engagementRate && athlete.engagementRate > 0.03) {
    fmv *= 1 + (athlete.engagementRate - 0.03) * 10;
  }

  // Minimum floor
  return Math.max(fmv, 100);
}
