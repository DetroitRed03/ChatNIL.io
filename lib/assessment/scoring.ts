/**
 * Assessment Scoring Algorithm
 *
 * Calculates trait scores from assessment responses and determines
 * the user's archetype based on their trait profile.
 */

import type {
  AssessmentQuestion,
  AssessmentResponse,
  TraitCode,
  TraitScores,
  TraitArchetype,
  ChoiceOption,
  ResponseValue,
  isChoiceOption,
} from './types';

// ============================================================
// Score Calculation
// ============================================================

/**
 * Calculate trait scores from assessment responses
 *
 * @param responses - Array of user responses
 * @param questions - Array of assessment questions
 * @returns Normalized trait scores (0-100 scale)
 */
export function calculateTraitScores(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): TraitScores {
  const scores: TraitScores = {};
  const counts: Partial<Record<TraitCode, number>> = {};

  for (const response of responses) {
    // Skip unanswered questions
    if (response.wasSkipped) continue;

    const question = questions.find((q) => q.id === response.questionId);
    if (!question) continue;

    processResponse(response, question, scores, counts);
  }

  // Normalize to 0-100 scale
  return normalizeScores(scores, counts);
}

/**
 * Process a single response and update scores
 */
function processResponse(
  response: AssessmentResponse,
  question: AssessmentQuestion,
  scores: TraitScores,
  counts: Partial<Record<TraitCode, number>>
): void {
  const { responseValue } = response;

  switch (question.questionType) {
    case 'scale':
      processScaleResponse(responseValue, question, scores, counts);
      break;
    case 'choice':
      processChoiceResponse(responseValue, question, scores, counts);
      break;
    case 'ranking':
      processRankingResponse(responseValue, question, scores, counts);
      break;
  }
}

/**
 * Process scale (1-5) responses
 */
function processScaleResponse(
  responseValue: ResponseValue,
  question: AssessmentQuestion,
  scores: TraitScores,
  counts: Partial<Record<TraitCode, number>>
): void {
  const value = (responseValue as { value: number }).value;

  // Apply question trait weights
  for (const [trait, weight] of Object.entries(question.traitWeights)) {
    const traitCode = trait as TraitCode;
    scores[traitCode] = (scores[traitCode] || 0) + value * (weight as number);
    counts[traitCode] = (counts[traitCode] || 0) + 1;
  }
}

/**
 * Process multiple choice responses
 */
function processChoiceResponse(
  responseValue: ResponseValue,
  question: AssessmentQuestion,
  scores: TraitScores,
  counts: Partial<Record<TraitCode, number>>
): void {
  const selectedValue = (responseValue as { value: string }).value;

  // Find the selected option
  const selectedOption = question.options?.find((opt) => {
    if ('weights' in opt) {
      return opt.value === selectedValue;
    }
    return false;
  }) as ChoiceOption | undefined;

  if (selectedOption && 'weights' in selectedOption) {
    // Apply option-specific weights (these are direct scores, not multipliers)
    for (const [trait, weight] of Object.entries(selectedOption.weights)) {
      const traitCode = trait as TraitCode;
      scores[traitCode] = (scores[traitCode] || 0) + (weight as number);
      counts[traitCode] = (counts[traitCode] || 0) + 1;
    }
  } else {
    // Fallback: use question-level trait weights with default value
    const defaultValue = 3;
    for (const [trait, weight] of Object.entries(question.traitWeights)) {
      const traitCode = trait as TraitCode;
      scores[traitCode] = (scores[traitCode] || 0) + defaultValue * (weight as number);
      counts[traitCode] = (counts[traitCode] || 0) + 1;
    }
  }
}

/**
 * Process ranking responses
 * First choice = 5, Second = 4, Third = 3, Fourth = 2
 */
function processRankingResponse(
  responseValue: ResponseValue,
  question: AssessmentQuestion,
  scores: TraitScores,
  counts: Partial<Record<TraitCode, number>>
): void {
  const rankings = (responseValue as { value: string[] }).value;

  rankings.forEach((value, index) => {
    // Convert rank to score (1st = 5, 2nd = 4, etc.)
    const rankScore = Math.max(5 - index, 1);

    // Apply question-level trait weights scaled by rank
    for (const [trait, weight] of Object.entries(question.traitWeights)) {
      const traitCode = trait as TraitCode;
      scores[traitCode] = (scores[traitCode] || 0) + rankScore * (weight as number);
      counts[traitCode] = (counts[traitCode] || 0) + 1;
    }
  });
}

/**
 * Normalize scores to 0-100 scale
 */
function normalizeScores(
  scores: TraitScores,
  counts: Partial<Record<TraitCode, number>>
): TraitScores {
  const normalizedScores: TraitScores = {};

  for (const [trait, score] of Object.entries(scores)) {
    const traitCode = trait as TraitCode;
    const count = counts[traitCode] || 1;

    // Average score * 20 to convert 1-5 scale to 0-100
    // Clamp between 0 and 100
    const normalized = Math.round(((score as number) / count) * 20);
    normalizedScores[traitCode] = Math.min(100, Math.max(0, normalized));
  }

  return normalizedScores;
}

// ============================================================
// Top Traits
// ============================================================

/**
 * Get the top N traits by score
 *
 * @param scores - Trait scores object
 * @param count - Number of top traits to return (default: 5)
 * @returns Array of trait codes sorted by score descending
 */
export function getTopTraits(scores: TraitScores, count: number = 5): TraitCode[] {
  return Object.entries(scores)
    .filter(([_, score]) => score !== undefined && score > 0)
    .sort(([, a], [, b]) => (b || 0) - (a || 0))
    .slice(0, count)
    .map(([trait]) => trait as TraitCode);
}

/**
 * Get the bottom N traits by score (areas for growth)
 *
 * @param scores - Trait scores object
 * @param count - Number of traits to return (default: 3)
 * @returns Array of trait codes sorted by score ascending
 */
export function getGrowthAreas(scores: TraitScores, count: number = 3): TraitCode[] {
  return Object.entries(scores)
    .filter(([_, score]) => score !== undefined)
    .sort(([, a], [, b]) => (a || 0) - (b || 0))
    .slice(0, count)
    .map(([trait]) => trait as TraitCode);
}

// ============================================================
// Archetype Determination
// ============================================================

/**
 * Determine the best-matching archetype for a user's trait scores
 *
 * @param scores - User's trait scores
 * @param archetypes - Available archetypes to match against
 * @returns The best-matching archetype
 */
export function determineArchetype(
  scores: TraitScores,
  archetypes: TraitArchetype[]
): TraitArchetype {
  if (archetypes.length === 0) {
    throw new Error('No archetypes available for matching');
  }

  let bestMatch: TraitArchetype | null = null;
  let bestScore = -Infinity;

  // First pass: find archetypes where user meets all requirements
  for (const archetype of archetypes) {
    const { meetsAll, matchScore } = evaluateArchetypeMatch(scores, archetype);

    if (meetsAll && matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = archetype;
    }
  }

  // If no perfect match, find the closest fit
  if (!bestMatch) {
    bestScore = -Infinity;

    for (const archetype of archetypes) {
      const closenessScore = calculateClosenessScore(scores, archetype);

      if (closenessScore > bestScore) {
        bestScore = closenessScore;
        bestMatch = archetype;
      }
    }
  }

  // Return best match or first archetype as ultimate fallback
  return bestMatch || archetypes[0];
}

/**
 * Evaluate how well a user matches an archetype
 */
function evaluateArchetypeMatch(
  scores: TraitScores,
  archetype: TraitArchetype
): { meetsAll: boolean; matchScore: number } {
  let meetsAll = true;
  let matchScore = 0;

  for (const [trait, requirement] of Object.entries(archetype.definingTraits)) {
    const userScore = scores[trait as TraitCode] || 0;
    const minRequired = requirement?.min || 0;

    if (userScore >= minRequired) {
      // User exceeds requirement - add the excess to match score
      matchScore += userScore - minRequired;
    } else {
      // User doesn't meet this requirement
      meetsAll = false;
    }
  }

  return { meetsAll, matchScore };
}

/**
 * Calculate how close a user is to matching an archetype
 * Used when no perfect match exists
 */
function calculateClosenessScore(scores: TraitScores, archetype: TraitArchetype): number {
  let closenessScore = 0;
  let totalWeight = 0;

  for (const [trait, requirement] of Object.entries(archetype.definingTraits)) {
    const userScore = scores[trait as TraitCode] || 0;
    const minRequired = requirement?.min || 0;

    // Calculate how close to the requirement (0-100%)
    const closeness = Math.min(userScore / Math.max(minRequired, 1), 1);
    closenessScore += closeness * minRequired; // Weight by requirement importance
    totalWeight += minRequired;
  }

  // Normalize by total weight
  return totalWeight > 0 ? closenessScore / totalWeight * 100 : 0;
}

// ============================================================
// Analysis Helpers
// ============================================================

/**
 * Get a summary of trait scores by category
 */
export function getScoresByCategory(
  scores: TraitScores,
  traits: Array<{ traitCode: TraitCode; category: string }>
): Record<string, number> {
  const categoryScores: Record<string, { total: number; count: number }> = {};

  for (const trait of traits) {
    const score = scores[trait.traitCode];
    if (score !== undefined) {
      if (!categoryScores[trait.category]) {
        categoryScores[trait.category] = { total: 0, count: 0 };
      }
      categoryScores[trait.category].total += score;
      categoryScores[trait.category].count += 1;
    }
  }

  const result: Record<string, number> = {};
  for (const [category, { total, count }] of Object.entries(categoryScores)) {
    result[category] = count > 0 ? Math.round(total / count) : 0;
  }

  return result;
}

/**
 * Calculate the overall "profile strength" based on trait variance
 * Higher variance = more distinctive profile
 */
export function calculateProfileStrength(scores: TraitScores): number {
  const values = Object.values(scores).filter((v) => v !== undefined) as number[];

  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Normalize to 0-100 (higher stdDev = more distinctive)
  // A stdDev of 20+ is considered very distinctive
  return Math.min(100, Math.round((stdDev / 20) * 100));
}

/**
 * Compare two users' trait profiles and return similarity score
 */
export function compareProfiles(scores1: TraitScores, scores2: TraitScores): number {
  const allTraits = new Set([...Object.keys(scores1), ...Object.keys(scores2)]) as Set<TraitCode>;

  let sumSquaredDiff = 0;
  let count = 0;

  for (const trait of allTraits) {
    const score1 = scores1[trait] || 50; // Default to middle
    const score2 = scores2[trait] || 50;
    sumSquaredDiff += Math.pow(score1 - score2, 2);
    count++;
  }

  if (count === 0) return 0;

  // Calculate similarity (inverse of normalized distance)
  const avgSquaredDiff = sumSquaredDiff / count;
  const distance = Math.sqrt(avgSquaredDiff);

  // Max possible distance is 100 (0 vs 100)
  // Convert to similarity percentage
  return Math.round(100 - distance);
}
