/**
 * Test Script for 6-Dimensional Compliance Scoring Engine
 * ========================================================
 * Run with: npx tsx scripts/test-compliance-engine.ts
 */

import {
  DealInput,
  AthleteContext,
  ComplianceResult,
  DIMENSION_WEIGHTS,
  STATUS_THRESHOLDS,
  getStatusFromScore,
  createDimensionScore,
} from '../lib/compliance/types';

// Mock the Supabase calls for testing
const mockStateRules = {
  state_code: 'KY',
  state_name: 'Kentucky',
  hs_nil_allowed: true,
  hs_parental_consent_required: true,
  hs_school_approval_required: true,
  college_nil_allowed: true,
  college_disclosure_required: true,
  college_disclosure_deadline_days: 7,
  prohibited_activities: ['gambling', 'alcohol'],
  requires_contract: true,
  requires_disclosure: true,
};

// Simplified local scoring for testing (without DB calls)
async function testCalculateComplianceScore(
  deal: DealInput,
  athlete: AthleteContext
): Promise<ComplianceResult> {
  // Policy Fit (30%)
  let policyScore = 100;
  const policyReasonCodes: string[] = [];
  const policyRecommendations: string[] = [];

  if (deal.isSchoolAffiliated) {
    policyScore -= 40;
    policyReasonCodes.push('SCHOOL_AFFILIATED_DEAL');
    policyRecommendations.push('Verify this is legitimate third-party NIL.');
  }
  if (deal.isBoosterConnected) {
    policyScore -= 50;
    policyReasonCodes.push('BOOSTER_CONNECTED');
    policyRecommendations.push('Booster-connected deals are high risk.');
  }
  if (deal.performanceBased) {
    policyScore = Math.min(policyScore, 20);
    policyReasonCodes.push('PERFORMANCE_BASED_COMPENSATION');
    policyRecommendations.push('Restructure to legitimate NIL activities.');
  }
  if (athlete.role === 'college_athlete') {
    policyReasonCodes.push('NCAA_REPORTING_REQUIRED');
    policyRecommendations.push('NCAA requires deal disclosure within 5 business days.');
  }

  const policyFit = createDimensionScore(
    policyScore, DIMENSION_WEIGHTS.POLICY_FIT,
    policyReasonCodes, 'Policy fit evaluation complete.',
    policyRecommendations
  );

  // Document Hygiene (20%)
  let docScore = 100;
  const docReasonCodes: string[] = [];
  const docRecommendations: string[] = [];

  if (!deal.contractText && !deal.contractUrl) {
    docScore -= 30;
    docReasonCodes.push('NO_CONTRACT_PROVIDED');
    docRecommendations.push('Upload a written contract.');
  }
  if (!deal.deliverables || deal.deliverables.length < 20) {
    docScore -= 20;
    docReasonCodes.push('VAGUE_DELIVERABLES');
    docRecommendations.push('Define specific deliverables.');
  }
  if (!deal.startDate || !deal.endDate) {
    docScore -= 10;
    docReasonCodes.push('NO_DURATION_SPECIFIED');
    docRecommendations.push('Specify clear start and end dates.');
  }

  const documentHygiene = createDimensionScore(
    docScore, DIMENSION_WEIGHTS.DOCUMENT_HYGIENE,
    docReasonCodes, 'Document hygiene evaluation complete.',
    docRecommendations
  );

  // FMV Verification (15%)
  const baseRate = 0.01;
  const engMultiplier = athlete.engagementRate > 5 ? 1.5 : athlete.engagementRate > 3 ? 1.2 : 1.0;
  const dealMultipliers: Record<string, number> = {
    'social_post': 1.0, 'appearance': 2.5, 'endorsement': 3.0,
    'brand_ambassador': 5.0, 'merchandise': 2.0, 'other': 1.5
  };
  const sportMultipliers: Record<string, number> = {
    'football': 1.3, 'basketball': 1.3, 'baseball': 1.1, 'soccer': 1.0
  };
  const dealMult = dealMultipliers[deal.dealType] || 1.0;
  const sportMult = sportMultipliers[athlete.sport.toLowerCase()] || 0.8;
  const expectedFMV = Math.max(100, athlete.followers * baseRate * engMultiplier * dealMult * sportMult);
  const variance = ((deal.compensation - expectedFMV) / expectedFMV) * 100;

  let fmvScore = 100;
  const fmvReasonCodes: string[] = [];
  const fmvRecommendations: string[] = [];

  if (variance > 200) {
    fmvScore = 20;
    fmvReasonCodes.push('FMV_EXTREME_OVERPAYMENT');
    fmvRecommendations.push(`Compensation is ${Math.round(variance)}% above market rate.`);
  } else if (variance > 100) {
    fmvScore = 50;
    fmvReasonCodes.push('FMV_SIGNIFICANT_OVERPAYMENT');
    fmvRecommendations.push('Document the business justification.');
  } else if (variance > 50) {
    fmvScore = 75;
    fmvReasonCodes.push('FMV_ABOVE_MARKET');
  }

  const fmvVerification = createDimensionScore(
    fmvScore, DIMENSION_WEIGHTS.FMV_VERIFICATION,
    fmvReasonCodes, `Expected FMV: $${expectedFMV.toLocaleString()}. Variance: ${Math.round(variance)}%`,
    fmvRecommendations
  );

  // Tax Readiness (15%)
  let taxScore = 100;
  const taxReasonCodes: string[] = [];
  const taxRecommendations: string[] = [];

  if (!athlete.hasAcknowledgedTaxObligations) {
    taxScore -= 40;
    taxReasonCodes.push('TAX_OBLIGATIONS_NOT_ACKNOWLEDGED');
    taxRecommendations.push('Acknowledge tax obligations.');
  }
  if (deal.compensation >= 600) {
    taxReasonCodes.push('W9_REQUIRED');
    taxRecommendations.push('You will likely receive a 1099 form.');
  }
  const estimatedTax = deal.compensation * 0.25;
  taxRecommendations.push(`Estimated tax: $${estimatedTax.toLocaleString()}`);

  const taxReadiness = createDimensionScore(
    taxScore, DIMENSION_WEIGHTS.TAX_READINESS,
    taxReasonCodes, `Estimated tax liability: $${estimatedTax.toLocaleString()}`,
    taxRecommendations
  );

  // Brand Safety (10%)
  const prohibitedCategories = ['alcohol', 'tobacco', 'cannabis', 'gambling', 'sports_betting'];
  let brandScore = 100;
  const brandReasonCodes: string[] = [];
  const brandRecommendations: string[] = [];
  const brandLower = deal.thirdPartyName.toLowerCase();

  for (const cat of prohibitedCategories) {
    if (brandLower.includes(cat)) {
      brandScore = 0;
      brandReasonCodes.push(`PROHIBITED_BRAND_CATEGORY_${cat.toUpperCase()}`);
      brandRecommendations.push(`${cat} brands are prohibited.`);
      break;
    }
  }
  if (deal.thirdPartyType === 'unknown') {
    brandScore -= 15;
    brandReasonCodes.push('UNVERIFIED_THIRD_PARTY');
    brandRecommendations.push('Verify the legitimacy of this third party.');
  }

  const brandSafety = createDimensionScore(
    brandScore, DIMENSION_WEIGHTS.BRAND_SAFETY,
    brandReasonCodes, brandScore >= 80 ? 'Brand appears appropriate.' : 'Brand requires review.',
    brandRecommendations
  );

  // Guardian Consent (10%)
  let consentScore = 100;
  const consentReasonCodes: string[] = [];
  const consentRecommendations: string[] = [];

  if (!athlete.isMinor) {
    consentReasonCodes.push('NOT_APPLICABLE_ADULT');
  } else {
    switch (athlete.consentStatus) {
      case 'approved':
        consentReasonCodes.push('GUARDIAN_CONSENT_APPROVED');
        break;
      case 'pending':
        consentScore = 40;
        consentReasonCodes.push('GUARDIAN_CONSENT_PENDING');
        consentRecommendations.push('Wait for parent/guardian approval.');
        break;
      case 'denied':
        consentScore = 0;
        consentReasonCodes.push('GUARDIAN_CONSENT_DENIED');
        consentRecommendations.push('Parent/guardian has denied consent.');
        break;
      default:
        consentScore = 0;
        consentReasonCodes.push('GUARDIAN_CONSENT_MISSING');
        consentRecommendations.push('Get parent/guardian consent.');
    }
  }

  const guardianConsent = createDimensionScore(
    consentScore, DIMENSION_WEIGHTS.GUARDIAN_CONSENT,
    consentReasonCodes, athlete.isMinor ? 'Guardian consent evaluation.' : 'Adult - consent not required.',
    consentRecommendations
  );

  // Calculate total
  const totalScore = Math.round(
    policyFit.weightedScore +
    documentHygiene.weightedScore +
    fmvVerification.weightedScore +
    taxReadiness.weightedScore +
    brandSafety.weightedScore +
    guardianConsent.weightedScore
  );

  const status = getStatusFromScore(totalScore);

  // Determine pay-for-play risk
  let payForPlayRisk: 'low' | 'medium' | 'high' = 'low';
  if (deal.isBoosterConnected || deal.performanceBased || deal.isSchoolAffiliated) {
    payForPlayRisk = 'high';
  } else if (fmvReasonCodes.includes('FMV_EXTREME_OVERPAYMENT')) {
    payForPlayRisk = 'high';
  } else if (fmvReasonCodes.includes('FMV_SIGNIFICANT_OVERPAYMENT') || policyFit.score < 70) {
    payForPlayRisk = 'medium';
  }

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
      guardianConsent,
    },
    overallReasonCodes: [
      ...policyReasonCodes, ...docReasonCodes, ...fmvReasonCodes,
      ...taxReasonCodes, ...brandReasonCodes, ...consentReasonCodes
    ],
    overallRecommendations: [
      ...policyRecommendations, ...docRecommendations, ...fmvRecommendations,
      ...taxRecommendations, ...brandRecommendations, ...consentRecommendations
    ].slice(0, 5),
    isThirdPartyVerified,
    payForPlayRisk,
    scoredAt: new Date().toISOString(),
  };
}

// ============================================================================
// Test Cases
// ============================================================================

async function runTests() {
  console.log('='.repeat(60));
  console.log('6-DIMENSIONAL COMPLIANCE SCORING ENGINE - TEST SUITE');
  console.log('='.repeat(60));
  console.log();

  // Test 1: Legitimate Nike Deal
  console.log('TEST 1: Legitimate Nike Deal (College Athlete)');
  console.log('-'.repeat(50));

  const testDeal1: DealInput = {
    athleteId: 'test-123',
    dealType: 'social_post',
    thirdPartyName: 'Nike',
    thirdPartyType: 'brand',
    compensation: 5000,
    deliverables: '3 Instagram posts featuring Nike products over 2 months',
    state: 'KY',
    startDate: '2025-02-01',
    endDate: '2025-04-01',
    isSchoolAffiliated: false,
    isBoosterConnected: false,
    performanceBased: false
  };

  const testAthlete1: AthleteContext = {
    id: 'test-123',
    role: 'college_athlete',
    isMinor: false,
    state: 'KY',
    sport: 'Basketball',
    followers: 50000,
    engagementRate: 4.5,
    hasAcknowledgedTaxObligations: true
  };

  const result1 = await testCalculateComplianceScore(testDeal1, testAthlete1);
  printResult(result1);

  // Test 2: Suspicious Booster Deal
  console.log('\nTEST 2: Suspicious Booster Deal');
  console.log('-'.repeat(50));

  const testDeal2: DealInput = {
    athleteId: 'test-456',
    dealType: 'appearance',
    thirdPartyName: 'Local Business LLC',
    thirdPartyType: 'unknown',
    compensation: 50000, // Suspicious amount
    deliverables: 'Appearance at event',
    state: 'KY',
    isSchoolAffiliated: false,
    isBoosterConnected: true, // Red flag!
    performanceBased: false
  };

  const testAthlete2: AthleteContext = {
    id: 'test-456',
    role: 'college_athlete',
    isMinor: false,
    state: 'KY',
    sport: 'Football',
    followers: 10000,
    engagementRate: 2.0,
    hasAcknowledgedTaxObligations: false
  };

  const result2 = await testCalculateComplianceScore(testDeal2, testAthlete2);
  printResult(result2);

  // Test 3: HS Athlete with Pending Consent
  console.log('\nTEST 3: High School Athlete with Pending Consent');
  console.log('-'.repeat(50));

  const testDeal3: DealInput = {
    athleteId: 'test-789',
    dealType: 'social_post',
    thirdPartyName: 'Local Gym',
    thirdPartyType: 'local_business',
    compensation: 500,
    deliverables: '2 Instagram posts about the gym',
    state: 'KY',
    startDate: '2025-02-01',
    endDate: '2025-03-01',
    isSchoolAffiliated: false,
    isBoosterConnected: false,
    performanceBased: false
  };

  const testAthlete3: AthleteContext = {
    id: 'test-789',
    role: 'hs_student',
    isMinor: true,
    state: 'KY',
    sport: 'Basketball',
    followers: 5000,
    engagementRate: 6.0,
    consentStatus: 'pending', // Yellow flag
    hasAcknowledgedTaxObligations: true
  };

  const result3 = await testCalculateComplianceScore(testDeal3, testAthlete3);
  printResult(result3);

  // Test 4: Prohibited Brand (Alcohol)
  console.log('\nTEST 4: Prohibited Brand (Alcohol)');
  console.log('-'.repeat(50));

  const testDeal4: DealInput = {
    athleteId: 'test-abc',
    dealType: 'endorsement',
    thirdPartyName: 'Budweiser Alcohol',
    thirdPartyType: 'brand',
    compensation: 10000,
    deliverables: 'Brand ambassador campaign',
    state: 'KY',
    isSchoolAffiliated: false,
    isBoosterConnected: false,
    performanceBased: false
  };

  const testAthlete4: AthleteContext = {
    id: 'test-abc',
    role: 'college_athlete',
    isMinor: false,
    state: 'KY',
    sport: 'Football',
    followers: 100000,
    engagementRate: 5.0,
    hasAcknowledgedTaxObligations: true
  };

  const result4 = await testCalculateComplianceScore(testDeal4, testAthlete4);
  printResult(result4);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Test 1 (Nike Deal):      ${getStatusEmoji(result1.status)} ${result1.status.toUpperCase()} - Score: ${result1.totalScore}`);
  console.log(`Test 2 (Booster Deal):   ${getStatusEmoji(result2.status)} ${result2.status.toUpperCase()} - Score: ${result2.totalScore}`);
  console.log(`Test 3 (HS Pending):     ${getStatusEmoji(result3.status)} ${result3.status.toUpperCase()} - Score: ${result3.totalScore}`);
  console.log(`Test 4 (Alcohol Brand):  ${getStatusEmoji(result4.status)} ${result4.status.toUpperCase()} - Score: ${result4.totalScore}`);
  console.log('='.repeat(60));
}

function printResult(result: ComplianceResult) {
  console.log(`\nTOTAL SCORE: ${result.totalScore}/100 ${getStatusEmoji(result.status)} ${result.status.toUpperCase()}`);
  console.log(`Pay-for-Play Risk: ${result.payForPlayRisk.toUpperCase()}`);
  console.log(`Third Party Verified: ${result.isThirdPartyVerified ? 'Yes' : 'No'}`);
  console.log('\nDimension Breakdown:');
  console.log(`  Policy Fit (30%):       ${result.dimensions.policyFit.score}/100 → ${result.dimensions.policyFit.weightedScore.toFixed(1)} pts`);
  console.log(`  Document Hygiene (20%): ${result.dimensions.documentHygiene.score}/100 → ${result.dimensions.documentHygiene.weightedScore.toFixed(1)} pts`);
  console.log(`  FMV Verification (15%): ${result.dimensions.fmvVerification.score}/100 → ${result.dimensions.fmvVerification.weightedScore.toFixed(1)} pts`);
  console.log(`  Tax Readiness (15%):    ${result.dimensions.taxReadiness.score}/100 → ${result.dimensions.taxReadiness.weightedScore.toFixed(1)} pts`);
  console.log(`  Brand Safety (10%):     ${result.dimensions.brandSafety.score}/100 → ${result.dimensions.brandSafety.weightedScore.toFixed(1)} pts`);
  console.log(`  Guardian Consent (10%): ${result.dimensions.guardianConsent.score}/100 → ${result.dimensions.guardianConsent.weightedScore.toFixed(1)} pts`);

  if (result.overallReasonCodes.length > 0) {
    console.log('\nReason Codes:', result.overallReasonCodes.slice(0, 5).join(', '));
  }

  if (result.overallRecommendations.length > 0) {
    console.log('\nTop Recommendations:');
    result.overallRecommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'green': return '🟢';
    case 'yellow': return '🟡';
    case 'red': return '🔴';
    default: return '⚪';
  }
}

// Run the tests
runTests().catch(console.error);
