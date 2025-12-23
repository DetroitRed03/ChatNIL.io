/**
 * Update NIL deals with proper compensation values
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function updateDeals() {
  console.log('=== UPDATING NIL DEAL VALUES ===\n');

  // Get Sarah's ID
  const { data: sarah } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (!sarah) {
    console.log('ERROR: Sarah not found');
    return;
  }

  console.log('Sarah ID:', sarah.id);

  // Get Sarah's deals with correct column names
  const { data: deals, error: dealErr } = await supabase
    .from('nil_deals')
    .select('id, deal_title, compensation_amount')
    .eq('athlete_id', sarah.id);

  if (dealErr) {
    console.log('Error:', dealErr.message);
    return;
  }

  console.log(`Found ${deals?.length || 0} deals\n`);

  // Update each deal with compensation values
  const amounts = [25000, 5000, 15000, 8500];

  for (let i = 0; i < (deals?.length || 0); i++) {
    const deal = deals![i];
    const amount = amounts[i % amounts.length];

    const { error } = await supabase
      .from('nil_deals')
      .update({ compensation_amount: amount })
      .eq('id', deal.id);

    if (error) {
      console.log(`❌ ${deal.deal_title}:`, error.message);
    } else {
      console.log(`✅ ${deal.deal_title}: $${amount}`);
    }
  }

  // Verify
  const { data: updated } = await supabase
    .from('nil_deals')
    .select('deal_title, compensation_amount, status')
    .eq('athlete_id', sarah.id);

  console.log('\n=== FINAL STATE ===');
  let total = 0;
  updated?.forEach(d => {
    console.log(`   - ${d.deal_title}: $${d.compensation_amount || 0} (${d.status})`);
    total += d.compensation_amount || 0;
  });
  console.log(`\nTotal NIL Value: $${total}`);
}

updateDeals().catch(console.error);
