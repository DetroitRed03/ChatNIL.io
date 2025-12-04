import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testMatchInsertion() {
  console.log('🧪 Testing match insertion into agency_athlete_matches...\n');

  try {
    // First, let's get a test agency and athlete
    console.log('📋 Finding test agency...');
    const { data: agency, error: agencyError } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'agency')
      .limit(1)
      .single();

    if (agencyError || !agency) {
      console.error('❌ No agency found:', agencyError);
      return;
    }

    console.log('✅ Found agency:', agency.email);

    console.log('\n📋 Finding test athlete...');
    const { data: athlete, error: athleteError } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'athlete')
      .limit(1)
      .single();

    if (athleteError || !athlete) {
      console.error('❌ No athlete found:', athleteError);
      return;
    }

    console.log('✅ Found athlete:', athlete.email);

    // Test inserting a match
    console.log('\n🔄 Attempting to insert test match...');
    const testMatch = {
      agency_id: agency.id,
      athlete_id: athlete.id,
      match_score: 75,
      score_breakdown: {
        brand_values: 18,
        interests: 17,
        campaign_fit: 14,
        budget: 13,
        geography: 8,
        demographics: 9,
        engagement: 9
      },
      match_reason: 'Test match insertion - verifying table functionality',
      status: 'suggested',
      algorithm_version: 'v1.0-test'
    };

    const { data: insertedMatch, error: insertError } = await supabase
      .from('agency_athlete_matches')
      .insert(testMatch)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }

    console.log('✅ Match inserted successfully!');
    console.log('\n📊 Inserted match details:');
    console.log(JSON.stringify(insertedMatch, null, 2));

    // Clean up test data
    console.log('\n🧹 Cleaning up test match...');
    const { error: deleteError } = await supabase
      .from('agency_athlete_matches')
      .delete()
      .eq('id', insertedMatch.id);

    if (deleteError) {
      console.error('⚠️  Warning: Could not delete test match:', deleteError);
    } else {
      console.log('✅ Test match cleaned up');
    }

    console.log('\n🎉 SUCCESS! The agency_athlete_matches table is fully functional!');
    console.log('✨ The "Generate Matches Now" button will now work properly.');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testMatchInsertion();
