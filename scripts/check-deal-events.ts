import { supabaseAdmin } from '../lib/supabase';

async function checkDeals() {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return;
  }

  const { data: deals, error } = await supabaseAdmin
    .from('nil_deals')
    .select('*')
    .eq('athlete_id', 'ca05429a-0f32-4280-8b71-99dc5baee0dc');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sarah\'s NIL Deals:\n');
  deals?.forEach(deal => {
    console.log('---');
    console.log('Brand:', deal.brand_name);
    console.log('Title:', deal.deal_title);
    console.log('Status:', deal.status);
    console.log('Deliverables:', JSON.stringify(deal.deliverables, null, 2));
    console.log('Payment Schedule:', JSON.stringify(deal.payment_schedule, null, 2));
    console.log('');
  });
}

checkDeals().catch(console.error);
