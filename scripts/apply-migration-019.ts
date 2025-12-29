/**
 * Apply Migration 019: Core Traits Assessment
 *
 * Run with:
 * SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/apply-migration-019.ts
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
  console.log('🚀 Applying Migration 019: Core Traits Assessment\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/019_core_traits_assessment.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split into individual statements more carefully
    // Handle function definitions which contain semicolons
    const statements: string[] = [];
    let currentStatement = '';
    let inFunction = false;
    let dollarQuoteTag = '';

    for (const line of migrationSQL.split('\n')) {
      const trimmedLine = line.trim();

      // Skip pure comment lines
      if (trimmedLine.startsWith('--') && !currentStatement.trim()) {
        continue;
      }

      // Detect start of function body ($$)
      if (trimmedLine.includes('$$') && !inFunction) {
        inFunction = true;
        dollarQuoteTag = '$$';
      }

      currentStatement += line + '\n';

      // Detect end of function body
      if (inFunction && trimmedLine.includes(dollarQuoteTag) && currentStatement.split(dollarQuoteTag).length > 2) {
        inFunction = false;
        if (trimmedLine.endsWith(';')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      } else if (!inFunction && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.startsWith('--')) continue;

      const preview = statement.substring(0, 60).replace(/\n/g, ' ').replace(/\s+/g, ' ');

      try {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          if (error.message?.includes('already exists') ||
              error.message?.includes('duplicate')) {
            console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (exists): ${preview}...`);
            skipCount++;
          } else {
            console.log(`❌ [${i + 1}/${statements.length}] Error: ${error.message?.substring(0, 80)}`);
            console.log(`   Statement: ${preview}...`);
            errorCount++;
          }
        } else {
          console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
          successCount++;
        }
      } catch (err: any) {
        if (err.message?.includes('already exists') ||
            err.message?.includes('duplicate')) {
          console.log(`⏭️  [${i + 1}/${statements.length}] Skipped: ${preview}...`);
          skipCount++;
        } else {
          console.log(`❌ [${i + 1}/${statements.length}] Exception: ${err.message?.substring(0, 80)}`);
          errorCount++;
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Verify tables were created
    console.log('\n🔍 Verifying tables...\n');

    const tables = ['core_traits', 'assessment_questions', 'trait_archetypes', 'assessment_sessions', 'assessment_responses', 'user_trait_results'];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table "${table}": Not found - ${error.message}`);
      } else {
        console.log(`✅ Table "${table}": Ready (${count || 0} rows)`);
      }
    }

    // Verify seed data
    console.log('\n🔍 Verifying seed data...\n');

    const { count: traitsCount } = await supabase
      .from('core_traits')
      .select('*', { count: 'exact', head: true });
    console.log(`   Core Traits: ${traitsCount || 0} (expected 12)`);

    const { count: questionsCount } = await supabase
      .from('assessment_questions')
      .select('*', { count: 'exact', head: true });
    console.log(`   Assessment Questions: ${questionsCount || 0} (expected 20)`);

    const { count: archetypesCount } = await supabase
      .from('trait_archetypes')
      .select('*', { count: 'exact', head: true });
    console.log(`   Trait Archetypes: ${archetypesCount || 0} (expected 8)`);

    console.log('\n✅ Migration 019 complete!\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
