import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSecondarySports() {
  console.log('🔧 Fixing secondary sports data with raw SQL...\n');

  // Method 1: Update using JSONB array directly
  const sql = `
    UPDATE users
    SET secondary_sports = '[
      {"sport": "Softball", "position": "Catcher"},
      {"sport": "Track", "position": "Sprints"}
    ]'::jsonb
    WHERE email = 'sarah.johnson@test.com';
  `;

  const { error } = await supabase.rpc('exec_sql', {
    query: sql
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Updated successfully!');

  // Verify
  const { data } = await supabase
    .from('users')
    .select('secondary_sports')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  console.log('\n🔍 Verified data:');
  console.log(JSON.stringify(data?.secondary_sports, null, 2));
  console.log('\nType:', typeof data?.secondary_sports);
  console.log('Is Array:', Array.isArray(data?.secondary_sports));

  if (Array.isArray(data?.secondary_sports) && data.secondary_sports.length > 0) {
    console.log('\n✅ Secondary sports structure:');
    data.secondary_sports.forEach((sport: any, idx: number) => {
      console.log(`  ${idx + 1}. Sport: ${sport.sport}, Position: ${sport.position}`);
    });
  }
}

fixSecondarySports();
