import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running Migration 019: Agency-Athlete Matches Table');
  console.log('================================================\n');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'migrations', '019_agency_athlete_matches.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded successfully');
    console.log('⏳ Executing SQL...\n');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration 019 completed successfully!');
    console.log('\n📊 Results:', data);

    // Verify the table was created
    const { data: tableCheck, error: checkError } = await supabase
      .from('agency_athlete_matches')
      .select('count')
      .limit(1);

    if (checkError) {
      console.error('⚠️  Warning: Could not verify table creation:', checkError);
    } else {
      console.log('✅ Table verification passed - agency_athlete_matches is accessible');
    }

    console.log('\n🎉 All done! The "Generate Matches Now" button should work now!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

runMigration();
