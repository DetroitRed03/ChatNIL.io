import { supabaseAdmin } from '../lib/supabase';

async function checkColumns() {
  const { data, error } = await supabaseAdmin
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', 'ca05429a-0f32-4280-8b71-99dc5baee0dc')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\nColumns with data:');
  Object.entries(data || {})
    .filter(([key, value]) => value !== null && value !== undefined)
    .forEach(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : value;
      console.log(`  ${key}: ${displayValue}`);
    });
}

checkColumns();
