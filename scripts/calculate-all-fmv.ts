#!/usr/bin/env tsx

/**
 * Calculate FMV scores for all seeded athletes
 */

import { createClient } from '@supabase/supabase-js';
import { calculateFMV, FMVCalculation } from '../lib/fmv/calculator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function calculateAllFMV() {
  console.log('🎯 Calculating FMV for all athletes...\n');

  // Get all athletes
  const { data: athletes, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('role', 'athlete'); // Get all athletes

  if (error || !athletes) {
    console.error('❌ Error fetching athletes:', error);
    return;
  }

  console.log(`Found ${athletes.length} athletes to process\n`);

  let successCount = 0;
  let errorCount = 0;
  const results: any[] = [];

  for (const athlete of athletes) {
    try {
      console.log(`⚙️  Calculating FMV for ${athlete.first_name} ${athlete.last_name}...`);

      // Calculate FMV
      const fmv: FMVCalculation = await calculateFMV(athlete.id);

      console.log(`   Score: ${fmv.total}/100 (${fmv.tier.toUpperCase()})`);
      console.log(`   Social: ${fmv.social} | Athletic: ${fmv.athletic} | Market: ${fmv.market} | Brand: ${fmv.brand}`);
      console.log(`   Deal Value: $${fmv.estimatedDealValueLow.toLocaleString()} - $${fmv.estimatedDealValueHigh.toLocaleString()}`);

      // Store in database
      const { error: insertError } = await supabase
        .from('athlete_fmv_data')
        .upsert({
          athlete_id: athlete.id,
          fmv_score: fmv.total,
          fmv_tier: fmv.tier,
          social_score: fmv.social,
          athletic_score: fmv.athletic,
          market_score: fmv.market,
          brand_score: fmv.brand,
          estimated_deal_value_low: fmv.estimatedDealValueLow,
          estimated_deal_value_mid: fmv.estimatedDealValueMid,
          estimated_deal_value_high: fmv.estimatedDealValueHigh,
          strengths: fmv.strengths,
          weaknesses: fmv.weaknesses,
          improvement_suggestions: fmv.improvementSuggestions,
          percentile_rank: fmv.percentileRank,
          is_public_score: fmv.total >= 55, // Make scores public if medium tier or above
          last_calculation_date: new Date().toISOString(),
          calculation_count_today: 1,
          last_calculation_reset_date: new Date().toISOString().split('T')[0],
          calculation_version: 'v1.0',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'athlete_id'
        });

      if (insertError) {
        console.log(`   ❌ Error storing FMV: ${insertError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Stored successfully\n`);
        successCount++;

        results.push({
          name: `${athlete.first_name} ${athlete.last_name}`,
          score: fmv.total,
          tier: fmv.tier,
          dealValue: `$${fmv.estimatedDealValueLow.toLocaleString()} - $${fmv.estimatedDealValueHigh.toLocaleString()}`
        });
      }

    } catch (error: any) {
      console.log(`   ❌ Calculation error: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('━'.repeat(60));
  console.log('✨ FMV Calculation Complete!\n');
  console.log(`✅ Success: ${successCount} athletes`);
  console.log(`❌ Errors: ${errorCount} athletes`);

  if (results.length > 0) {
    console.log('\n📊 Top 10 Athletes by FMV:\n');

    const top10 = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    top10.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`);
      console.log(`   Score: ${result.score}/100 (${result.tier.toUpperCase()})`);
      console.log(`   Value: ${result.dealValue}\n`);
    });
  }

  console.log('━'.repeat(60));
  console.log('\n🎉 All FMV scores calculated and stored!');
}

calculateAllFMV();
