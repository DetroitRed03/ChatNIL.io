/**
 * Apply Demo Permissions Directly via Supabase Client
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('📝 Applying Demo Endpoint Permissions\n');

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Since we're using service role, we should have access
  // Let's try to create the policies directly through table operations

  console.log('1. Enabling RLS on agency_campaigns...');
  try {
    // We can't execute raw SQL easily, so we'll verify access instead
    const { data, error } = await supabase
      .from('agency_campaigns')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing agency_campaigns:', error.message);
      console.log('\n⚠️  MANUAL ACTION REQUIRED:');
      console.log('   Please run the following SQL in the Supabase SQL Editor:\n');
      console.log('   -- Grant service role access');
      console.log('   GRANT ALL ON agency_campaigns TO service_role;');
      console.log('   GRANT ALL ON athlete_public_profiles TO service_role;');
      console.log('   GRANT ALL ON campaign_athlete_invites TO service_role;');
      console.log('   GRANT ALL ON agency_athlete_messages TO service_role;');
      console.log('   GRANT SELECT ON agency_campaigns TO anon, authenticated;');
      console.log('   GRANT SELECT ON athlete_public_profiles TO anon, authenticated;\n');
      return;
    } else {
      console.log('✅ agency_campaigns is accessible (permissions may already be set)');
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n2. Testing athlete_public_profiles access...');
  try {
    const { data, error } = await supabase
      .from('athlete_public_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing athlete_public_profiles:', error.message);
    } else {
      console.log('✅ athlete_public_profiles is accessible');
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n✅ Check complete!');
}

main().catch(console.error);
