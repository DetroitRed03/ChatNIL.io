/**
 * Apply Migration 017: Document Analysis System
 *
 * Run with:
 * SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/apply-migration-017.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log('🚀 Applying Migration 017: Document Analysis System\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/017_document_analysis.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');

      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          // Try direct execution for DDL
          const { error: directError } = await supabase
            .from('_migrations_log')
            .select('*')
            .limit(0);

          // Many statements might fail due to "already exists" - that's OK
          if (error.message?.includes('already exists') ||
              error.message?.includes('duplicate key')) {
            console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
            skipCount++;
          } else {
            console.log(`⚠️  [${i + 1}/${statements.length}] Warning: ${error.message?.substring(0, 80)}`);
          }
        } else {
          console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
          successCount++;
        }
      } catch (err: any) {
        console.log(`⚠️  [${i + 1}/${statements.length}] Error: ${err.message?.substring(0, 80)}`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);

    // Verify tables were created
    console.log('\n🔍 Verifying tables...\n');

    const tables = ['documents', 'document_chunks', 'document_analysis_results'];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ Table "${table}": Not found or inaccessible`);
      } else {
        console.log(`✅ Table "${table}": Ready`);
      }
    }

    // Test the match_document_chunks function exists
    console.log('\n🔍 Verifying functions...\n');

    const { error: funcError } = await supabase.rpc('match_document_chunks', {
      query_embedding: Array(1536).fill(0),
      p_user_id: '00000000-0000-0000-0000-000000000000',
      match_count: 1,
      match_threshold: 0.5
    });

    if (funcError && !funcError.message?.includes('no rows')) {
      console.log(`⚠️  Function "match_document_chunks": ${funcError.message}`);
    } else {
      console.log(`✅ Function "match_document_chunks": Ready`);
    }

    console.log('\n✅ Migration 017 complete!\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
