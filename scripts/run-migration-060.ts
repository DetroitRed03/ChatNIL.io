import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Running Migration 060: Fix array_length NULL handling');
  console.log('================================================');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '060_fix_array_length_checks.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📖 Migration SQL loaded from:', migrationPath);
    console.log('');

    // Split SQL into statements (excluding comments and empty lines)
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} SQL statement(s)...`);
    console.log('');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back
      console.log(`📝 Statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');

      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error('❌ Error executing statement:', error);
        throw error;
      }

      console.log('✅ Statement executed successfully');
      console.log('');
    }

    console.log('✅ Migration 060 completed successfully!');
    console.log('');
    console.log('🧪 Testing the fix...');

    // Test by updating a profile with NULL arrays
    const testUserId = '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1';

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .update({
        hobbies: null,
        lifestyle_interests: null,
        brand_affinity: null,
        causes_care_about: null,
        content_creation_interests: null,
      })
      .eq('id', testUserId)
      .select('profile_completion_score')
      .single();

    if (profileError) {
      console.error('❌ Test update failed:', profileError);
    } else {
      console.log('✅ Test update successful!');
      console.log(`📊 Profile completion score: ${profileData.profile_completion_score}%`);
      console.log('');
      console.log('🎉 Empty/NULL arrays now work correctly!');
    }

    console.log('');
    console.log('================================================');
    console.log('Migration 060 Complete');
    console.log('================================================');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
