import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findPortfolioData() {
  console.log('🔍 Searching for portfolio data...\n');
  
  // Check athlete_profiles table
  console.log('1. Checking athlete_profiles table...');
  const { data: athleteProfiles, error: apError } = await supabase
    .from('athlete_profiles')
    .select('*')
    .limit(1);
  
  if (!apError && athleteProfiles) {
    console.log('✅ athlete_profiles exists');
    console.log('   Columns:', Object.keys(athleteProfiles[0] || {}).sort().join(', '));
  } else {
    console.log('❌ athlete_profiles not found or error:', apError?.message);
  }
  
  console.log('\n2. Checking for portfolio-related tables...');
  
  // Try portfolio_items
  const { data: portfolioItems, error: piError } = await supabase
    .from('portfolio_items')
    .select('*')
    .limit(1);
  
  if (!piError && portfolioItems) {
    console.log('✅ portfolio_items exists');
    console.log('   Columns:', Object.keys(portfolioItems[0] || {}).sort().join(', '));
  } else {
    console.log('❌ portfolio_items not found or error:', piError?.message);
  }
  
  console.log('\n3. Looking for athletes with usernames...');
  const { data: athletes } = await supabase
    .from('users')
    .select('id, username, first_name, last_name')
    .eq('role', 'athlete')
    .not('username', 'is', null)
    .limit(5);
    
  console.log('\nAthletes with usernames:');
  athletes?.forEach(a => console.log(`  - ${a.username} (${a.first_name} ${a.last_name})`));
}

findPortfolioData();
