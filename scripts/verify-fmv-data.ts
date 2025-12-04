#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyFMV() {
  console.log('🔍 Verifying FMV Data...\n');

  const { data: fmvData, error } = await supabase
    .from('athlete_fmv_data')
    .select('*')
    .order('fmv_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Found ${fmvData?.length || 0} FMV records in the top 10\n`);

  if (fmvData && fmvData.length > 0) {
    console.log('🏆 Top 10 Athletes by FMV Score:\n');

    for (const record of fmvData) {
      const { data: athlete } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', record.athlete_id)
        .single();

      console.log(`${record.fmv_score}/100 (${record.fmv_tier.toUpperCase()}) - ${athlete?.first_name} ${athlete?.last_name}`);
      console.log(`  Social: ${record.social_score} | Athletic: ${record.athletic_score} | Market: ${record.market_score} | Brand: ${record.brand_score}`);
      console.log(`  Deal Value: $${record.estimated_deal_value_low.toLocaleString()} - $${record.estimated_deal_value_high.toLocaleString()}`);
      console.log(`  Strengths: ${record.strengths.join(', ')}`);
      console.log(`  Percentile: ${record.percentile_rank}%\n`);
    }
  }

  // Count by tier
  const { data: tierCounts } = await supabase
    .from('athlete_fmv_data')
    .select('fmv_tier');

  if (tierCounts) {
    const counts = tierCounts.reduce((acc: any, r: any) => {
      acc[r.fmv_tier] = (acc[r.fmv_tier] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 FMV Distribution by Tier:\n');
    Object.entries(counts)
      .sort(([,a]: any, [,b]: any) => b - a)
      .forEach(([tier, count]) => {
        console.log(`  ${tier.toUpperCase()}: ${count} athletes`);
      });
  }

  console.log('\n✅ FMV data verified!');
}

verifyFMV();
