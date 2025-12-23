/**
 * Verify Migration 302 - Check all tables are accessible
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyTables() {
  console.log('=== VERIFICATION: Table Access After Migration 302 ===\n');

  // Tables that should now work
  const newTables = [
    'quiz_sessions', 'badges', 'user_badges',
    'portfolio_items', 'quiz_answers'
  ];

  console.log('1. Testing new tables:');
  for (const table of newTables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   ❌ ${table}: ${error.message.slice(0, 60)}`);
    } else {
      console.log(`   ✅ ${table}: Accessible`);
    }
  }

  // Check new columns
  console.log('\n2. Testing new columns:');

  const { data: user } = await supabase.from('users').select('avatar_url').limit(1);
  console.log('   users.avatar_url:', user ? '✅ Exists' : '❌ Missing');

  const { data: athlete, error: athErr } = await supabase
    .from('athlete_profiles')
    .select('state, fmv_score')
    .limit(1);
  if (athErr) {
    console.log('   athlete_profiles columns:', athErr.message.slice(0, 60));
  } else {
    console.log('   athlete_profiles.state: ✅ Exists');
    console.log('   athlete_profiles.fmv_score: ✅ Exists');
  }

  // Check badges were seeded
  console.log('\n3. Checking seeded data:');
  const { data: badges, error: badgeErr } = await supabase
    .from('badges')
    .select('name, tier, category')
    .limit(5);

  if (badgeErr) {
    console.log('   Badges:', badgeErr.message);
  } else {
    console.log(`   ✅ ${badges?.length || 0} badges found:`);
    badges?.forEach(b => console.log(`      - ${b.name} (${b.tier}, ${b.category})`));
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verifyTables().catch(console.error);
