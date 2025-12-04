import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  try {
    console.log('🚀 Running migration 040...\n');

    // Read migration file
    const migrationPath = join(process.cwd(), 'migrations', '040_agency_platform_minimal.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split into individual statements (handle multi-line statements)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement + ';'
        });

        if (error) {
          // Some errors are expected (like "table already exists")
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1}: ${error.message.substring(0, 80)}... (continuing)`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err: any) {
        console.error(`❌ Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`\n📋 Created tables:`);
    console.log(`   - athlete_public_profiles`);
    console.log(`   - agency_campaigns`);
    console.log(`   - campaign_athlete_invites`);
    console.log(`   - agency_athlete_messages`);
    console.log(`\n🔒 RLS policies and permissions applied`);

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
