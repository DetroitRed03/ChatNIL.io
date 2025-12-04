import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigration() {
  console.log('🚀 Running Migration 027: School System & Two-Tier Onboarding...\n');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'migrations', '027_school_system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing SQL migration via exec_sql function...');

    // Execute using the exec_sql function
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }

    console.log('✅ Migration 027 completed successfully!\n');
    console.log('📊 Changes applied:');
    console.log('  • schools table created');
    console.log('  • 5 new columns added to users table');
    console.log('  • 6 indexes created for performance');
    console.log('  • RLS policies configured');
    console.log('  • Triggers and comments added');
    console.log('\n🎉 Database is ready for Phase 6B!');

  } catch (error) {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  }
}

runMigration()
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
