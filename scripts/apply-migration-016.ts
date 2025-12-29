#!/usr/bin/env npx tsx
/**
 * Apply Migration 016: AI Response Cache
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('='.repeat(60));
  console.log('Applying Migration 016: AI Response Cache');
  console.log('='.repeat(60));

  const migrationPath = path.join(__dirname, '../supabase/migrations/016_ai_response_cache.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Split by semicolons but be careful with function bodies
  const statements = sql
    .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    if (!statement || statement.startsWith('--')) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });

      if (error) {
        // Check for "already exists" type errors
        if (error.message.includes('already exists') ||
            error.message.includes('duplicate')) {
          console.log('⏭️  Skipped (already exists):', statement.substring(0, 60) + '...');
          skipCount++;
        } else {
          console.error('❌ Error:', error.message);
          console.error('   Statement:', statement.substring(0, 100) + '...');
          errorCount++;
        }
      } else {
        console.log('✓', statement.substring(0, 60) + '...');
        successCount++;
      }
    } catch (err: any) {
      console.error('❌ Exception:', err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete');
  console.log('='.repeat(60));
  console.log(`Success: ${successCount}`);
  console.log(`Skipped: ${skipCount}`);
  console.log(`Errors: ${errorCount}`);

  // Verify table exists
  console.log('\nVerifying...');

  const { data: cacheTable, error: cacheError } = await supabase
    .from('ai_response_cache')
    .select('id')
    .limit(1);

  if (!cacheError) {
    console.log('✓ ai_response_cache table exists');
  } else {
    console.log('⚠️  ai_response_cache table check:', cacheError.message);
  }

  // Get cache stats
  const { count } = await supabase
    .from('ai_response_cache')
    .select('*', { count: 'exact', head: true });

  console.log(`   Current cache entries: ${count || 0}`);
}

applyMigration().catch(console.error);
