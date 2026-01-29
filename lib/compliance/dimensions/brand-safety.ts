/**
 * Brand Safety Scorer (10% weight)
 * =================================
 * Evaluates: Is this an appropriate brand for the athlete?
 *
 * Key questions:
 * - Is this brand category allowed for student athletes?
 * - Are there age restrictions?
 * - Is the third party verified?
 */

import { DealInput, DimensionScore, DIMENSION_WEIGHTS, createDimensionScore } from '../types';

const WEIGHT = DIMENSION_WEIGHTS.BRAND_SAFETY;

// Prohibited categories - automatic red flag
const PROHIBITED_CATEGORIES = [
  'alcohol',
  'tobacco',
  'cannabis',
  'gambling',
  'sports_betting',
  'firearms',
  'adult_content',
  'vaping'
];

// Caution categories - yellow flag, requires review
const CAUTION_CATEGORIES = [
  'energy_drinks',
  'supplements',
  'cryptocurrency',
  'financial_services',
  'weight_loss',
  'pharmaceuticals'
];

export async function calculateBrandSafety(
  deal: DealInput
): Promise<DimensionScore> {
  let score = 100;
  const reasonCodes: string[] = [];
  const recommendations: string[] = [];

  const brandName = deal.thirdPartyName.toLowerCase();

  // Check 1: Scan brand name against prohibited categories
  for (const category of PROHIBITED_CATEGORIES) {
    if (brandName.includes(category) || await isBrandInCategory(deal.thirdPartyName, category)) {
      score = 0;
      reasonCodes.push(`PROHIBITED_BRAND_CATEGORY_${category.toUpperCase()}`);
      recommendations.push(`Deals with ${category} brands are prohibited for student athletes.`);
      break;
    }
  }

  // Check 2: Check caution categories
  if (score > 0) {
    for (const category of CAUTION_CATEGORIES) {
      if (brandName.includes(category) || await isBrandInCategory(deal.thirdPartyName, category)) {
        score -= 20;
        reasonCodes.push(`CAUTION_BRAND_CATEGORY_${category.toUpperCase()}`);
        recommendations.push(`${category} brands require extra scrutiny. Verify compliance with your school's policies.`);
      }
    }
  }

  // Check 3: Unknown brand verification
  if (deal.thirdPartyType === 'unknown' || deal.thirdPartyType === 'individual') {
    score -= 15;
    reasonCodes.push('UNVERIFIED_THIRD_PARTY');
    recommendations.push('Verify the legitimacy of this third party before signing. Research their business presence.');
  }

  const notes = score >= 80
    ? 'Brand appears appropriate for student athlete endorsement.'
    : 'Brand category requires review.';

  return createDimensionScore(score, WEIGHT, reasonCodes, notes, recommendations);
}

async function isBrandInCategory(brandName: string, category: string): Promise<boolean> {
  // In production, this could integrate with a brand database or API
  // For now, simple keyword matching
  const brandLower = brandName.toLowerCase();
  const categoryKeywords: Record<string, string[]> = {
    alcohol: ['beer', 'wine', 'liquor', 'spirits', 'vodka', 'whiskey', 'bourbon', 'brewery'],
    tobacco: ['cigarette', 'cigar', 'smokeless'],
    cannabis: ['marijuana', 'weed', 'thc', 'cbd', 'dispensary'],
    gambling: ['casino', 'bet', 'wager', 'poker', 'slots'],
    sports_betting: ['draftkings', 'fanduel', 'betmgm', 'caesars sportsbook'],
    vaping: ['vape', 'e-cig', 'juul', 'puff bar'],
    supplements: ['protein', 'pre-workout', 'creatine', 'bcaa'],
    energy_drinks: ['redbull', 'monster', 'bang', 'celsius', 'rockstar'],
  };

  const keywords = categoryKeywords[category] || [];
  return keywords.some(kw => brandLower.includes(kw));
}
