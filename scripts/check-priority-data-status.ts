import { supabaseAdmin } from '../lib/supabase';

async function checkDataStatus() {
  console.log('=== PRIORITY 1 & 2 DATA STATUS ===\n');

  // PRIORITY 1
  console.log('📋 PRIORITY 1 (Critical)\n');

  // 1. FMV System
  const { data: fmvData, count: fmvCount } = await supabaseAdmin
    .from('athlete_fmv_data')
    .select('*', { count: 'exact' });
  console.log(`✅ FMV System: ${fmvCount} athletes with FMV scores`);
  if (fmvData && fmvData.length > 0) {
    console.log(`   Sample: ${fmvData[0].fmv_score}/100 (${fmvData[0].fmv_tier})`);
  }

  // 2. State NIL Rules
  const { count: rulesCount } = await supabaseAdmin
    .from('state_nil_rules')
    .select('*', { count: 'exact', head: true });
  console.log(`${rulesCount && rulesCount > 0 ? '✅' : '❌'} State NIL Rules: ${rulesCount || 0}/50 states`);

  // 3. Agencies
  const { count: agenciesCount } = await supabaseAdmin
    .from('agencies')
    .select('*', { count: 'exact', head: true });
  console.log(`✅ Sample Agencies: ${agenciesCount} agencies created`);

  // PRIORITY 2
  console.log('\n📋 PRIORITY 2 (Important)\n');

  // 1. Campaigns
  const { count: campaignsCount } = await supabaseAdmin
    .from('campaigns')
    .select('*', { count: 'exact', head: true });
  console.log(`${campaignsCount && campaignsCount > 0 ? '✅' : '❌'} Sample Campaigns: ${campaignsCount || 0} campaigns`);

  // 2. NIL Deals
  const { count: dealsCount } = await supabaseAdmin
    .from('nil_deals')
    .select('*', { count: 'exact', head: true });
  console.log(`${dealsCount && dealsCount > 0 ? '✅' : '❌'} NIL Deals: ${dealsCount || 0} deals`);

  // 3. Agency-Athlete Matches
  const { count: matchesCount } = await supabaseAdmin
    .from('agency_athlete_matches')
    .select('*', { count: 'exact', head: true });
  console.log(`${matchesCount && matchesCount > 0 ? '✅' : '❌'} Agency Matches: ${matchesCount || 0} matches`);

  console.log('\n=== SUMMARY ===\n');

  const priority1Complete = (fmvCount || 0) > 0 && (rulesCount || 0) >= 50 && (agenciesCount || 0) >= 8;
  const priority2Complete = (campaignsCount || 0) >= 5 && (dealsCount || 0) >= 3 && (matchesCount || 0) >= 3;

  console.log(`Priority 1: ${priority1Complete ? '✅ COMPLETE' : '⚠️ INCOMPLETE'}`);
  console.log(`Priority 2: ${priority2Complete ? '✅ COMPLETE' : '⚠️ INCOMPLETE'}`);

  if (!priority1Complete || !priority2Complete) {
    console.log('\n📌 MISSING DATA:');
    if (!rulesCount || rulesCount < 50) {
      console.log(`   - State NIL Rules: Need ${50 - (rulesCount || 0)} more states`);
    }
    if (!campaignsCount || campaignsCount < 5) {
      console.log(`   - Campaigns: Need ${5 - (campaignsCount || 0)} more campaigns`);
    }
    if (!dealsCount || dealsCount < 3) {
      console.log(`   - NIL Deals: Need ${3 - (dealsCount || 0)} more deals`);
    }
    if (!matchesCount || matchesCount < 3) {
      console.log(`   - Agency Matches: Need ${3 - (matchesCount || 0)} more matches`);
    }
  }
}

checkDataStatus();
