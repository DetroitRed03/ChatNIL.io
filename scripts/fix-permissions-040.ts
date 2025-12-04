/**
 * Fix permissions for migration 040 tables
 * Grants full access to service_role
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function fixPermissions() {
  try {
    console.log('🔧 Fixing permissions for migration 040 tables...\n');

    const sql = `
-- Grant full permissions to service_role
GRANT ALL ON athlete_public_profiles TO service_role;
GRANT ALL ON agency_campaigns TO service_role;
GRANT ALL ON campaign_athlete_invites TO service_role;
GRANT ALL ON agency_athlete_messages TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure anon and authenticated can read
GRANT SELECT ON athlete_public_profiles TO anon, authenticated;
GRANT SELECT ON agency_campaigns TO anon, authenticated;

-- Drop and recreate service role policies to ensure they work
DROP POLICY IF EXISTS "service_role_all_access_athlete_public_profiles" ON athlete_public_profiles;
DROP POLICY IF EXISTS "service_role_all_access_agency_campaigns" ON agency_campaigns;
DROP POLICY IF EXISTS "service_role_all_access_campaign_athlete_invites" ON campaign_athlete_invites;
DROP POLICY IF EXISTS "service_role_all_access_agency_athlete_messages" ON agency_athlete_messages;

CREATE POLICY "service_role_all_access_athlete_public_profiles"
ON athlete_public_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_access_agency_campaigns"
ON agency_campaigns FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_access_campaign_athlete_invites"
ON campaign_athlete_invites FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_access_agency_athlete_messages"
ON agency_athlete_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
`;

    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Permissions fixed successfully!\n');
    console.log('📋 Applied changes:');
    console.log('   - Granted ALL to service_role on all 4 tables');
    console.log('   - Granted SELECT to anon/authenticated on public tables');
    console.log('   - Recreated service_role RLS policies');
    console.log('\n✅ Demo APIs should now work!\n');

  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

fixPermissions();
