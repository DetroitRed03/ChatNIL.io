/**
 * Tax Readiness Scorer (15% weight)
 * ==================================
 * Evaluates: Are tax obligations understood and prepared for?
 *
 * Key questions:
 * - Has athlete acknowledged tax obligations?
 * - Is compensation above 1099 threshold ($600)?
 * - Are quarterly estimated payments needed?
 */

import { DealInput, AthleteContext, DimensionScore, DIMENSION_WEIGHTS, createDimensionScore } from '../types';

const WEIGHT = DIMENSION_WEIGHTS.TAX_READINESS;
const W9_THRESHOLD = 600;

export async function calculateTaxReadiness(
  deal: DealInput,
  athlete: AthleteContext
): Promise<DimensionScore> {
  let score = 100;
  const reasonCodes: string[] = [];
  const recommendations: string[] = [];

  // Check 1: Has athlete acknowledged tax obligations?
  if (!athlete.hasAcknowledgedTaxObligations) {
    score -= 40;
    reasonCodes.push('TAX_OBLIGATIONS_NOT_ACKNOWLEDGED');
    recommendations.push('Acknowledge that you understand NIL income is taxable and you are responsible for payments.');
  }

  // Check 2: Compensation threshold warnings
  if (deal.compensation >= W9_THRESHOLD) {
    reasonCodes.push('W9_REQUIRED');
    recommendations.push('You will likely receive a 1099 form. Keep records of this income.');
  }

  // Check 3: Estimated tax reminder
  const estimatedTax = deal.compensation * 0.25; // ~25% for self-employment
  recommendations.push(
    `Estimated tax on this deal: $${estimatedTax.toLocaleString()}. Set aside funds for quarterly payments.`
  );

  // Check 4: Quarterly payment reminder if significant income
  if (deal.compensation >= 1000) {
    reasonCodes.push('QUARTERLY_TAX_REMINDER');
    recommendations.push('Consider making quarterly estimated tax payments to avoid penalties.');
  }

  const notes = `Estimated tax liability: $${estimatedTax.toLocaleString()}`;

  return createDimensionScore(score, WEIGHT, reasonCodes, notes, recommendations);
}
