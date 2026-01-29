/**
 * FMV Verification Scorer (15% weight)
 * =====================================
 * Evaluates: Is the payment market-rate or suspiciously inflated?
 *
 * Key questions:
 * - How does the deal value compare to athlete's FMV score?
 * - How does it compare to similar deals for similar athletes?
 * - Is the payment significantly above market rate (potential pay-for-play)?
 */

import { DealInput, AthleteContext, DimensionScore, DIMENSION_WEIGHTS, createDimensionScore } from '../types';

const WEIGHT = DIMENSION_WEIGHTS.FMV_VERIFICATION;

export async function calculateFMVVerification(
  deal: DealInput,
  athlete: AthleteContext
): Promise<DimensionScore> {
  let score = 100;
  const reasonCodes: string[] = [];
  const recommendations: string[] = [];

  // Calculate expected FMV based on athlete metrics
  const expectedFMV = calculateExpectedFMV(athlete, deal.dealType);
  const variance = ((deal.compensation - expectedFMV) / expectedFMV) * 100;

  // Check 1: Is compensation within reasonable range?
  if (variance > 200) {
    // More than 3x expected = major red flag (pay-for-play risk)
    score = 20;
    reasonCodes.push('FMV_EXTREME_OVERPAYMENT');
    recommendations.push(
      `Compensation ($${deal.compensation.toLocaleString()}) is ${Math.round(variance)}% above market rate ($${expectedFMV.toLocaleString()}). ` +
      `This raises pay-for-play concerns. Provide documentation justifying the premium.`
    );
  } else if (variance > 100) {
    // More than 2x expected = yellow flag
    score = 50;
    reasonCodes.push('FMV_SIGNIFICANT_OVERPAYMENT');
    recommendations.push(
      `Compensation ($${deal.compensation.toLocaleString()}) is ${Math.round(variance)}% above typical market rate ($${expectedFMV.toLocaleString()}). ` +
      `Consider documenting the business justification.`
    );
  } else if (variance > 50) {
    // 50-100% above = minor concern
    score = 75;
    reasonCodes.push('FMV_ABOVE_MARKET');
    recommendations.push(
      `Compensation is above average market rate. This may be justified by exclusivity or extended usage rights.`
    );
  } else if (variance < -50) {
    // Significantly underpaid
    score = 80;
    reasonCodes.push('FMV_BELOW_MARKET');
    recommendations.push(
      `You may be undervaluing yourself. Market rate for similar deals is around $${expectedFMV.toLocaleString()}.`
    );
  }

  const notes = `Expected FMV: $${expectedFMV.toLocaleString()}. Actual: $${deal.compensation.toLocaleString()} (${variance > 0 ? '+' : ''}${Math.round(variance)}%)`;

  return createDimensionScore(score, WEIGHT, reasonCodes, notes, recommendations);
}

function calculateExpectedFMV(athlete: AthleteContext, dealType: string): number {
  // Base rate per follower (simplified model)
  const baseRatePerFollower = 0.01; // $0.01 per follower base

  // Engagement multiplier
  const engagementMultiplier = athlete.engagementRate > 5 ? 1.5 :
                               athlete.engagementRate > 3 ? 1.2 : 1.0;

  // Deal type multiplier
  const dealTypeMultipliers: Record<string, number> = {
    'social_post': 1.0,
    'appearance': 2.5,
    'endorsement': 3.0,
    'brand_ambassador': 5.0,
    'merchandise': 2.0,
    'other': 1.5
  };

  // Sport premium (some sports command higher rates)
  const sportPremiums: Record<string, number> = {
    'football': 1.3,
    'basketball': 1.3,
    'baseball': 1.1,
    'soccer': 1.0,
    'volleyball': 0.9,
    'other': 0.8
  };

  const dealMultiplier = dealTypeMultipliers[dealType] || 1.0;
  const sportMultiplier = sportPremiums[athlete.sport.toLowerCase()] || 1.0;

  const expectedFMV = athlete.followers * baseRatePerFollower *
                      engagementMultiplier * dealMultiplier * sportMultiplier;

  // Minimum floor
  return Math.max(100, Math.round(expectedFMV));
}

/**
 * Export FMV calculation for external use
 */
export { calculateExpectedFMV };
