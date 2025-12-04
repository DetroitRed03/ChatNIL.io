import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkMatches() {
  console.log('🔍 Checking created matches...\n');

  const { data: matches, error } = await supabase
    .from('agency_athlete_matches')
    .select(`
      *,
      athlete:users!agency_athlete_matches_athlete_id_fkey(
        first_name,
        last_name,
        email,
        primary_sport
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Found ${matches?.length || 0} matches\n`);

  if (matches && matches.length > 0) {
    matches.forEach((match, i) => {
      console.log(`${i + 1}. Match ID: ${match.id}`);
      console.log(`   Agency ID: ${match.agency_id}`);
      console.log(`   Athlete: ${match.athlete?.first_name} ${match.athlete?.last_name} (${match.athlete?.email})`);
      console.log(`   Sport: ${match.athlete?.primary_sport || 'N/A'}`);
      console.log(`   Score: ${match.match_score}`);
      console.log(`   Status: ${match.status}`);
      console.log(`   Highlights: ${match.match_highlights?.slice(0, 2).join(', ')}`);
      console.log(`   Created: ${new Date(match.created_at).toLocaleString()}\n`);
    });
  }
}

checkMatches();
