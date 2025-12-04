import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting migration 075 - Adding match_tier and match_reasons columns');
  console.log('📊 Database:', supabaseUrl);

  try {
    // First, check if columns already exist by trying to select them
    console.log('\n🔍 Checking if columns already exist...');

    try {
      const { error: checkError } = await supabase
        .from('agency_athlete_matches')
        .select('match_tier, match_reasons')
        .limit(1);

      if (!checkError || !checkError.message.includes('does not exist')) {
        console.log('✅ Columns already exist! Migration already applied.');
        return;
      }
    } catch (e) {
      // Columns don't exist, continue with migration
      console.log('⚠️  Columns do not exist yet, proceeding with migration...');
    }

    // Use Supabase REST API to execute raw SQL
    console.log('\n📝 Executing migration SQL...');

    const migrationSQL = `
-- Add match_tier column
ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS match_tier TEXT
    CHECK (match_tier IN ('excellent', 'good', 'potential', 'poor'));

-- Add match_reasons column
ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS match_reasons TEXT[];

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_matches_tier
  ON agency_athlete_matches(match_tier);

CREATE INDEX IF NOT EXISTS idx_matches_agency_tier
  ON agency_athlete_matches(agency_id, match_tier);
`;

    // Use fetch to call Supabase's REST API directly for SQL execution
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      // Try alternative approach: execute each statement separately
      console.log('⚠️  RPC approach failed, trying direct column creation...');

      // We'll use the Supabase management API or direct PostgreSQL commands
      // For now, let's try a simpler approach using node-postgres
      console.log('📋 Please run this SQL manually in your Supabase SQL Editor:');
      console.log('---');
      console.log(migrationSQL);
      console.log('---');
      console.log('\nOr use the browser-based migration tool at:');
      console.log('http://localhost:3000/apply-migration-075.html');

      return;
    }

    console.log('✅ SQL executed successfully');

    // Verify the columns were added
    console.log('\n🔍 Verifying migration...');
    const { data, error: verifyError } = await supabase
      .from('agency_athlete_matches')
      .select('match_tier, match_reasons')
      .limit(1);

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`);
    }

    console.log('✅ Migration 075 completed successfully!');
    console.log('✅ Columns match_tier and match_reasons are now available');
    console.log('\n📊 You can now test the matchmaking functionality:');
    console.log('1. Go to /agencies/discover');
    console.log('2. Click "Generate Matches Now"');
    console.log('3. Check the browser console for detailed logs');

  } catch (error: any) {
    console.error('\n❌ Migration error:', error.message);
    console.log('\n💡 Manual migration required:');
    console.log('Please run the following SQL in your Supabase SQL Editor:\n');
    console.log(`
ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS match_tier TEXT
    CHECK (match_tier IN ('excellent', 'good', 'potential', 'poor'));

ALTER TABLE agency_athlete_matches
  ADD COLUMN IF NOT EXISTS match_reasons TEXT[];

CREATE INDEX IF NOT EXISTS idx_matches_tier
  ON agency_athlete_matches(match_tier);

CREATE INDEX IF NOT EXISTS idx_matches_agency_tier
  ON agency_athlete_matches(agency_id, match_tier);
    `);

    process.exit(1);
  }
}

applyMigration();
