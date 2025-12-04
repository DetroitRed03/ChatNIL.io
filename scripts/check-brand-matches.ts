import { supabaseAdmin } from '../lib/supabase';

async function checkMatches() {
  console.log('🔍 Checking Brand Matches...\n');

  // Get Sarah's user ID
  const { data: sarah } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (!sarah) {
    console.log('❌ Sarah user not found');
    return;
  }

  console.log('✅ Found Sarah:', {
    id: sarah.id,
    name: `${sarah.first_name} ${sarah.last_name}`,
    email: sarah.email
  });
  console.log('');

  // Check for matches
  const { data: matches, error } = await supabaseAdmin
    .from('agency_athlete_matches')
    .select(`
      id,
      agency_id,
      athlete_id,
      match_score,
      status,
      tier,
      match_reasons,
      created_at
    `)
    .eq('athlete_id', sarah.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching matches:', error);
    return;
  }

  console.log(`📊 Found ${matches?.length || 0} matches for Sarah\n`);

  if (matches && matches.length > 0) {
    for (const [index, match] of matches.entries()) {
      // Fetch agency user separately
      const { data: agency } = await supabaseAdmin
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', match.agency_id)
        .single();

      console.log(`Match ${index + 1}:`);
      console.log(`  ID: ${match.id}`);
      console.log(`  Agency: ${agency?.first_name} ${agency?.last_name} (${agency?.email})`);
      console.log(`  Score: ${match.match_score}%`);
      console.log(`  Status: ${match.status}`);
      console.log(`  Tier: ${match.tier || 'N/A'}`);
      console.log(`  Created: ${match.created_at}`);
      console.log(`  Reasons: ${match.match_reasons?.slice(0, 2).join(', ') || 'N/A'}`);
      console.log('');
    }
  } else {
    console.log('⚠️  No matches found for Sarah');
    console.log('');

    // Check if table is empty
    const { count } = await supabaseAdmin
      .from('agency_athlete_matches')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total matches in database: ${count || 0}`);

    if (count === 0) {
      console.log('\n💡 The agency_athlete_matches table is empty.');
      console.log('   You may need to run the matchmaking engine to create matches.');
    }
  }

  // Test the activity API endpoint
  console.log('\n🧪 Testing Activity API endpoint...\n');

  const response = await fetch(
    `http://localhost:3000/api/dashboard/activity?userId=${sarah.id}&type=match`,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.ok) {
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
  } else {
    console.log('❌ API Error:', response.status, await response.text());
  }
}

checkMatches().catch(err => {
  console.error('💥 Fatal error:', err.message);
  process.exit(1);
});
