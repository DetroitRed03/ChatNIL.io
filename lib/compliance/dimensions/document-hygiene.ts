/**
 * Document Hygiene Scorer (20% weight)
 * =====================================
 * Evaluates: Contract cleanliness and prohibited terms
 *
 * Key questions:
 * - Is there a written contract?
 * - Does the contract contain prohibited terms?
 * - Are all required documents present (W-9, disclosure, consent)?
 * - Are there any red-flag clauses?
 */

import { createClient } from '@/lib/supabase/server';
import { DealInput, DimensionScore, ProhibitedTerm, DIMENSION_WEIGHTS, createDimensionScore } from '../types';

const WEIGHT = DIMENSION_WEIGHTS.DOCUMENT_HYGIENE;

export async function calculateDocumentHygiene(
  deal: DealInput
): Promise<DimensionScore> {
  let score = 100;
  const reasonCodes: string[] = [];
  const recommendations: string[] = [];

  // Check 1: Contract provided?
  if (!deal.contractText && !deal.contractUrl) {
    score -= 30;
    reasonCodes.push('NO_CONTRACT_PROVIDED');
    recommendations.push('Upload a written contract for better protection and compliance documentation.');
  }

  // Check 2: Scan for prohibited terms
  if (deal.contractText) {
    const prohibitedTerms = await getProhibitedTerms();
    const foundTerms = scanForTerms(deal.contractText, prohibitedTerms);

    for (const term of foundTerms) {
      if (term.severity === 'red') {
        score -= 30;
        reasonCodes.push(`PROHIBITED_TERM_${term.category.toUpperCase()}`);
        recommendations.push(`Remove prohibited term: "${term.term}" - ${term.description}`);
      } else if (term.severity === 'orange') {
        score -= 15;
        reasonCodes.push(`CONCERNING_TERM_${term.category.toUpperCase()}`);
        recommendations.push(`Review concerning term: "${term.term}" - ${term.description}`);
      } else if (term.severity === 'yellow') {
        score -= 5;
        reasonCodes.push(`CAUTION_TERM_${term.category.toUpperCase()}`);
        recommendations.push(`Be aware of term: "${term.term}" - ${term.description}`);
      }
    }
  }

  // Check 3: Clear deliverables defined?
  if (!deal.deliverables || deal.deliverables.length < 20) {
    score -= 20;
    reasonCodes.push('VAGUE_DELIVERABLES');
    recommendations.push('Define specific deliverables (e.g., "3 Instagram posts, 1 story per week for 4 weeks").');
  }

  // Check 4: Duration specified?
  if (!deal.startDate || !deal.endDate) {
    score -= 10;
    reasonCodes.push('NO_DURATION_SPECIFIED');
    recommendations.push('Specify clear start and end dates for the agreement.');
  }

  const notes = generateDocumentNotes(Math.max(0, score));

  return createDimensionScore(score, WEIGHT, reasonCodes, notes, recommendations);
}

async function getProhibitedTerms(): Promise<ProhibitedTerm[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('prohibited_terms')
      .select('*')
      .eq('is_active', true);

    return (data || []).map(d => ({
      id: d.id,
      term: d.term,
      term_variations: d.term_variations || [],
      category: d.category,
      severity: d.severity,
      auto_reject: d.auto_reject,
      description: d.description || '',
      why_prohibited: d.why_prohibited || '',
      applies_to_hs: d.applies_to_hs,
      applies_to_college: d.applies_to_college,
    }));
  } catch (error) {
    console.error('Error fetching prohibited terms:', error);
    return getDefaultProhibitedTerms();
  }
}

function getDefaultProhibitedTerms(): ProhibitedTerm[] {
  return [
    {
      id: '1',
      term: 'enrollment',
      term_variations: ['enrollment bonus', 'signing bonus', 'commitment payment'],
      category: 'pay_for_play',
      severity: 'red',
      auto_reject: true,
      description: 'Payment tied to enrollment decisions',
      why_prohibited: 'NCAA violation',
      applies_to_hs: true,
      applies_to_college: true,
    },
    {
      id: '2',
      term: 'perpetual',
      term_variations: ['in perpetuity', 'forever', 'indefinitely'],
      category: 'exploitative',
      severity: 'red',
      auto_reject: true,
      description: 'Rights granted forever without expiration',
      why_prohibited: 'Exploitative contract term',
      applies_to_hs: true,
      applies_to_college: true,
    },
    {
      id: '3',
      term: 'performance bonus',
      term_variations: ['win bonus', 'championship bonus', 'playoff bonus'],
      category: 'pay_for_play',
      severity: 'red',
      auto_reject: true,
      description: 'Compensation tied to athletic performance',
      why_prohibited: 'Pay-for-play indicator',
      applies_to_hs: true,
      applies_to_college: true,
    },
  ];
}

function scanForTerms(text: string, terms: ProhibitedTerm[]): ProhibitedTerm[] {
  const lowerText = text.toLowerCase();
  const foundTerms: ProhibitedTerm[] = [];

  for (const term of terms) {
    // Check main term
    if (lowerText.includes(term.term.toLowerCase())) {
      foundTerms.push(term);
      continue;
    }
    // Check variations
    for (const variation of term.term_variations) {
      if (lowerText.includes(variation.toLowerCase())) {
        foundTerms.push(term);
        break;
      }
    }
  }

  return foundTerms;
}

function generateDocumentNotes(score: number): string {
  if (score >= 80) return 'Documentation is complete and passes review.';
  if (score >= 50) return 'Some documentation issues need attention.';
  return 'Significant documentation problems detected. Address before proceeding.';
}
