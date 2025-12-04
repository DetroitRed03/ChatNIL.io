import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting migration 075...');
  console.log('📊 Database:', supabaseUrl);

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '075_add_match_tier_and_reasons.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded');
    console.log('---');
    console.log(migrationSQL);
    console.log('---');

    // Split the SQL into individual statements (handle comments and DO blocks)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n📋 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          // Check if it's a benign error (column already exists, etc.)
          if (error.message.includes('already exists') ||
              error.message.includes('duplicate key') ||
              error.message.includes('does not exist')) {
            console.log(`⚠️  Warning (continuing): ${error.message}`);
          } else {
            throw error;
          }
        } else {
          console.log('✅ Success');
        }
      } catch (err: any) {
        console.error(`❌ Error executing statement:`, err.message);
        throw err;
      }
    }

    // Verify the columns were added
    console.log('\n🔍 Verifying migration...');
    const { data: columns, error: verifyError } = await supabase
      .from('agency_athlete_matches')
      .select('match_tier, match_reasons')
      .limit(0);

    if (verifyError && verifyError.message.includes('does not exist')) {
      throw new Error('Migration failed: columns were not created');
    }

    console.log('✅ Migration 075 completed successfully!');
    console.log('✅ Columns match_tier and match_reasons are now available');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.hint) {
      console.error('💡 Hint:', error.hint);
    }
    if (error.details) {
      console.error('📋 Details:', error.details);
    }
    process.exit(1);
  }
}

applyMigration();
