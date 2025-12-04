import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testAthleteMatches() {
  console.log('🔍 Testing athlete campaign matches...\n');

  // Get Sarah Johnson (Basketball player)
  const { data: sarahData } = await supabase
    .from('users')
    .select('id, first_name, last_name, primary_sport')
    .eq('first_name', 'Sarah')
    .eq('last_name', 'Johnson')
    .single();

  if (!sarahData) {
    console.log('❌ Sarah Johnson not found, using first athlete');
    const { data: firstAthlete } = await supabase
      .from('users')
      .select('id, first_name, last_name, primary_sport')
      .eq('role', 'athlete')
      .limit(1)
      .single();

    if (!firstAthlete) {
      console.log('❌ No athletes found!');
      return;
    }

    console.log(`Using: ${firstAthlete.first_name} ${firstAthlete.last_name}`);
    await testAPI(firstAthlete.id);
  } else {
    console.log(`✅ Found: ${sarahData.first_name} ${sarahData.last_name} (${sarahData.primary_sport})`);
    console.log(`   ID: ${sarahData.id}\n`);
    await testAPI(sarahData.id);
  }
}

async function testAPI(athleteId: string) {
  console.log('📡 Testing API endpoint...\n');

  try {
    const response = await fetch(`http://localhost:3000/api/demo/matchmaking/athlete/${athleteId}/campaigns`);

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.text();
      console.log(`   ❌ Error: ${error}`);
      return;
    }

    const data = await response.json();

    console.log(`\n✅ API Response:`);
    console.log(`   Total matches: ${data.total || 0}`);
    console.log(`   Matches array length: ${data.matches?.length || 0}`);

    if (data.matches && data.matches.length > 0) {
      console.log(`\n📋 Match details:`);
      data.matches.slice(0, 3).forEach((match: any, index: number) => {
        console.log(`\n${index + 1}. ${match.athlete_name}`);
        console.log(`   Match Score: ${match.match_score}%`);
        console.log(`   Confidence: ${match.confidence_level}`);
        console.log(`   Offer Range: $${(match.recommended_offer_low / 100).toLocaleString()} - $${(match.recommended_offer_high / 100).toLocaleString()}`);
        console.log(`   Strengths: ${match.strengths?.slice(0, 2).join(', ')}`);
      });
    } else {
      console.log(`\n❌ No matches returned!`);
      console.log(`\nFull response:`);
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log(`❌ Fetch error:`, error);
  }
}

testAthleteMatches().catch(console.error);
