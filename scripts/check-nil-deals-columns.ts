import { supabaseAdmin } from '../lib/supabase';

async function checkColumns() {
  if (!supabaseAdmin) return;

  const { data, error } = await supabaseAdmin
    .from('nil_deals')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('nil_deals table columns:');
  console.log(Object.keys(data || {}).sort().join('\n'));
}

checkColumns();
