#!/usr/bin/env tsx

/**
 * Score All Existing Deals
 * ========================
 * Runs the 6-dimensional compliance scoring engine against all
 * deals that don't yet have compliance scores.
 *
 * Usage: npx tsx scripts/score-all-deals.ts
 */

import { createClient } from '@supabase/supabase-js';
import { calculateComplianceScore } from '../lib/compliance/calculate-score';
import type { DealInput, AthleteContext } from '../lib/compliance/types';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🔍 Checking database state...\n');

  // Check deal count
  const { count: dealCount } = await supabase
    .from('nil_deals')
    .select('*', { count: 'exact', head: true });

  const { count: scoreCount } = await supabase
    .from('compliance_scores')
    .select('*', { count: 'exact', head: true });

  console.log(`  Deals in database: ${dealCount}`);
  console.log(`  Existing scores:   ${scoreCount}\n`);

  // Get all deals
  const { data: deals, error: dealsError } = await supabase
    .from('nil_deals')
    .select('*')
    .order('created_at', { ascending: false });

  if (dealsError || !deals) {
    console.error('Failed to fetch deals:', dealsError);
    process.exit(1);
  }

  // Get existing score deal_ids
  const { data: existingScores } = await supabase
    .from('compliance_scores')
    .select('deal_id');

  const scoredDealIds = new Set(existingScores?.map((s) => s.deal_id) || []);
  const dealsToScore = deals.filter((d) => !scoredDealIds.has(d.id));

  console.log(`  Deals needing scores: ${dealsToScore.length}\n`);

  if (dealsToScore.length === 0) {
    console.log('All deals already have scores. Re-scoring all deals...\n');
    dealsToScore.push(...deals);
  }

  let scored = 0;
  let failed = 0;

  for (const deal of dealsToScore) {
    try {
      // Fetch athlete profile
      const { data: athlete } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', deal.athlete_id)
        .single();

      const dealInput: DealInput = {
        id: deal.id,
        athleteId: deal.athlete_id,
        dealType: deal.deal_type || 'other',
        thirdPartyName: deal.third_party_name || deal.brand_name || 'Unknown',
        compensation: deal.compensation_amount || deal.deal_value || 0,
        deliverables: deal.deliverables || deal.description || '',
        contractText: deal.contract_text,
        contractUrl: deal.contract_url,
        state: athlete?.primary_state || 'CA',
        isSchoolAffiliated: deal.school_affiliated || false,
        isBoosterConnected: deal.booster_connected || false,
        performanceBased: deal.performance_based || false,
      };

      const athleteContext: AthleteContext = {
        id: deal.athlete_id,
        role: athlete?.role === 'hs_student' ? 'hs_student' : 'college_athlete',
        isMinor: false,
        state: athlete?.primary_state || 'CA',
        sport: athlete?.primary_sport || athlete?.sport || 'other',
        followers: athlete?.total_followers || 1000,
        engagementRate: athlete?.engagement_rate || 2,
        hasAcknowledgedTaxObligations: athlete?.understands_tax_obligations || false,
      };

      const result = await calculateComplianceScore(dealInput, athleteContext);

      // Upsert score
      const { error: saveError } = await supabase
        .from('compliance_scores')
        .upsert(
          {
            deal_id: deal.id,
            user_id: deal.athlete_id,
            policy_fit_score: result.dimensions.policyFit.score,
            policy_fit_weight: result.dimensions.policyFit.weight,
            policy_fit_notes: result.dimensions.policyFit.notes,
            fmv_score: result.dimensions.fmvVerification.score,
            fmv_weight: result.dimensions.fmvVerification.weight,
            fmv_notes: result.dimensions.fmvVerification.notes,
            document_score: result.dimensions.documentHygiene.score,
            document_weight: result.dimensions.documentHygiene.weight,
            document_notes: result.dimensions.documentHygiene.notes,
            tax_score: result.dimensions.taxReadiness.score,
            tax_weight: result.dimensions.taxReadiness.weight,
            tax_notes: result.dimensions.taxReadiness.notes,
            brand_safety_score: result.dimensions.brandSafety.score,
            brand_safety_weight: result.dimensions.brandSafety.weight,
            brand_safety_notes: result.dimensions.brandSafety.notes,
            guardian_consent_score: result.dimensions.guardianConsent.score,
            guardian_consent_weight: result.dimensions.guardianConsent.weight,
            guardian_consent_notes: result.dimensions.guardianConsent.notes,
            total_score: result.totalScore,
            weighted_score: result.totalScore,
            status: result.status,
            reason_codes: result.overallReasonCodes,
            fix_recommendations: result.overallRecommendations,
            scored_at: result.scoredAt,
          },
          { onConflict: 'deal_id' }
        );

      if (saveError) {
        console.error(`  ❌ Save failed for deal ${deal.id}:`, saveError.message);
        failed++;
        continue;
      }

      // Update deal compliance_status
      await supabase
        .from('nil_deals')
        .update({
          compliance_status: result.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deal.id);

      const statusEmoji =
        result.status === 'green' ? '🟢' : result.status === 'yellow' ? '🟡' : '🔴';
      console.log(
        `  ${statusEmoji} ${deal.third_party_name || deal.brand_name || deal.deal_title || 'Unknown'} → ${result.totalScore}/100 (${result.status})`
      );
      scored++;
    } catch (err: any) {
      console.error(`  ❌ Failed to score deal ${deal.id}:`, err.message);
      failed++;
    }
  }

  console.log(`\n✅ Done: ${scored} scored, ${failed} failed`);

  // Final count
  const { count: finalScoreCount } = await supabase
    .from('compliance_scores')
    .select('*', { count: 'exact', head: true });
  console.log(`  Total compliance_scores rows: ${finalScoreCount}`);
}

main().catch(console.error);
