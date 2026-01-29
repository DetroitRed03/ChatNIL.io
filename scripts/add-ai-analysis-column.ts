#!/usr/bin/env npx tsx
/**
 * Add AI Analysis Column to compliance_scores table
 * This column stores AI contract analysis results when enabled in settings
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env vars
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrations = [
  // Add ai_analysis JSONB column to compliance_scores
  `ALTER TABLE compliance_scores
   ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT NULL`,

  // Add index for querying deals with AI analysis
  `CREATE INDEX IF NOT EXISTS idx_compliance_scores_ai_analysis
   ON compliance_scores USING GIN (ai_analysis)
   WHERE ai_analysis IS NOT NULL`,

  // Add ai_analysis_enabled column to track if analysis was attempted
  `ALTER TABLE compliance_scores
   ADD COLUMN IF NOT EXISTS ai_analysis_enabled BOOLEAN DEFAULT false`,

  // Add ai_analysis_error column to track if analysis failed
  `ALTER TABLE compliance_scores
   ADD COLUMN IF NOT EXISTS ai_analysis_error TEXT DEFAULT NULL`,

  // Update column comment
  `COMMENT ON COLUMN compliance_scores.ai_analysis IS 'AI contract analysis results including red flags, key terms, and recommendations'`,
];

async function applyMigration() {
  console.log('='.repeat(60));
  console.log('Adding AI Analysis Column to compliance_scores');
  console.log('='.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    const preview = sql.substring(0, 60).replace(/\n/g, ' ') + '...';

    console.log(`\n[${i + 1}/${migrations.length}] ${preview}`);

    try {
      const { error } = await supabase.rpc('exec_sql', { query: sql });

      if (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`  ⏭️  Already exists (skipped)`);
          successCount++;
        } else {
          console.log(`  ❌ Error: ${error.message}`);
          failCount++;
        }
      } else {
        console.log(`  ✅ Success`);
        successCount++;
      }
    } catch (e: any) {
      console.log(`  ❌ Exception: ${e.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Migration Summary: ${successCount} succeeded, ${failCount} failed`);
  console.log('='.repeat(60));

  // Verify column exists
  console.log('\nVerifying ai_analysis column...');

  const { data, error } = await supabase
    .from('compliance_scores')
    .select('ai_analysis')
    .limit(1);

  if (error) {
    console.log(`  ❌ Verification failed: ${error.message}`);
  } else {
    console.log(`  ✅ ai_analysis column verified`);
  }

  console.log('\n✅ Migration complete!');
}

applyMigration().catch(console.error);
