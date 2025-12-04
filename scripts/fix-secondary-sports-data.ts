import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSecondarySports() {
  console.log('🔧 Fixing secondary sports data...\n');

  // Get Sarah's data
  const { data: sarah, error: fetchError } = await supabase
    .from('users')
    .select('id, email, secondary_sports')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (fetchError) {
    console.error('❌ Error fetching:', fetchError);
    return;
  }

  console.log('📊 Current secondary_sports:');
  console.log(JSON.stringify(sarah.secondary_sports, null, 2));

  // Set proper data structure
  const correctData = [
    { sport: 'Softball', position: 'Catcher' },
    { sport: 'Track', position: 'Sprints' }
  ];

  console.log('\n✅ Fixing to:');
  console.log(JSON.stringify(correctData, null, 2));

  // Update
  const { error: updateError } = await supabase
    .from('users')
    .update({ secondary_sports: correctData })
    .eq('id', sarah.id);

  if (updateError) {
    console.error('❌ Error updating:', updateError);
    return;
  }

  console.log('\n✅ Secondary sports fixed!');

  // Verify
  const { data: verified } = await supabase
    .from('users')
    .select('secondary_sports')
    .eq('id', sarah.id)
    .single();

  console.log('\n🔍 Verified data:');
  console.log(JSON.stringify(verified?.secondary_sports, null, 2));
}

fixSecondarySports();
