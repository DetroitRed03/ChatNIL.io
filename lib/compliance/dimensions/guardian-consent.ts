/**
 * Guardian Consent Scorer (10% weight)
 * =====================================
 * Evaluates: If athlete is a minor, is parental/guardian consent obtained?
 *
 * Key questions:
 * - Is the athlete a minor (under 18)?
 * - Has guardian consent been obtained?
 * - What is the consent status?
 */

import { DealInput, AthleteContext, DimensionScore, DIMENSION_WEIGHTS, createDimensionScore } from '../types';

const WEIGHT = DIMENSION_WEIGHTS.GUARDIAN_CONSENT;

export async function calculateGuardianConsent(
  deal: DealInput,
  athlete: AthleteContext
): Promise<DimensionScore> {
  let score = 100;
  const reasonCodes: string[] = [];
  const recommendations: string[] = [];

  // Only applies to minors
  if (!athlete.isMinor) {
    return createDimensionScore(
      100,
      WEIGHT,
      ['NOT_APPLICABLE_ADULT'],
      'Guardian consent not required - athlete is 18+.',
      []
    );
  }

  // Check consent status for minors
  switch (athlete.consentStatus) {
    case 'approved':
      score = 100;
      reasonCodes.push('GUARDIAN_CONSENT_APPROVED');
      break;

    case 'pending':
      score = 40;
      reasonCodes.push('GUARDIAN_CONSENT_PENDING');
      recommendations.push('Deal cannot proceed until parent/guardian approves. Check your parent dashboard.');
      break;

    case 'denied':
      score = 0;
      reasonCodes.push('GUARDIAN_CONSENT_DENIED');
      recommendations.push('Your parent/guardian has denied consent for NIL activities. Discuss with them before proceeding.');
      break;

    default:
      score = 0;
      reasonCodes.push('GUARDIAN_CONSENT_MISSING');
      recommendations.push('As a minor, you need parent/guardian consent. Have your parent complete the consent form.');
  }

  const notes = generateConsentNotes(athlete.consentStatus);

  return createDimensionScore(score, WEIGHT, reasonCodes, notes, recommendations);
}

function generateConsentNotes(status?: string): string {
  switch (status) {
    case 'approved': return 'Parent/guardian consent is on file.';
    case 'pending': return 'Awaiting parent/guardian approval.';
    case 'denied': return 'Parent/guardian has denied consent.';
    default: return 'Guardian consent required but not on file.';
  }
}
