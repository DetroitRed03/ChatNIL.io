import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFKMigration() {
  console.log('Attempting to fix campaign_athletes foreign key...\n');

  // Try exec_sql RPC function
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Drop the old foreign key constraint
      ALTER TABLE campaign_athletes
      DROP CONSTRAINT IF EXISTS campaign_athletes_campaign_id_fkey;

      -- Add new foreign key referencing agency_campaigns
      ALTER TABLE campaign_athletes
      ADD CONSTRAINT campaign_athletes_campaign_id_fkey
      FOREIGN KEY (campaign_id) REFERENCES agency_campaigns(id) ON DELETE CASCADE;
    `
  });

  if (error) {
    console.log('exec_sql RPC failed:', error.message);
    console.log('\nTrying query RPC...');

    const { data: data2, error: error2 } = await supabase.rpc('query', {
      sql: `
        ALTER TABLE campaign_athletes
        DROP CONSTRAINT IF EXISTS campaign_athletes_campaign_id_fkey;

        ALTER TABLE campaign_athletes
        ADD CONSTRAINT campaign_athletes_campaign_id_fkey
        FOREIGN KEY (campaign_id) REFERENCES agency_campaigns(id) ON DELETE CASCADE;
      `
    });

    if (error2) {
      console.log('query RPC also failed:', error2.message);
      console.log('\n❌ No SQL execution RPC available.');
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql/new');
      console.log('\n---');
      console.log(`
ALTER TABLE campaign_athletes
DROP CONSTRAINT IF EXISTS campaign_athletes_campaign_id_fkey;

ALTER TABLE campaign_athletes
ADD CONSTRAINT campaign_athletes_campaign_id_fkey
FOREIGN KEY (campaign_id) REFERENCES agency_campaigns(id) ON DELETE CASCADE;
      `);
      return;
    }

    console.log('✅ Migration applied via query RPC!');
    return;
  }

  console.log('✅ Migration applied via exec_sql RPC!');
}

applyFKMigration();
