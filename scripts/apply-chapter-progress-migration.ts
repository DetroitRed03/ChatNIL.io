/**
 * Apply chapter_progress table migration to Supabase
 * Run with: npx tsx scripts/apply-chapter-progress-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying chapter_progress table migration...\n');

  // Create chapter_progress table
  const { error: createTableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS chapter_progress (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pillar text NOT NULL,
        question_id text NOT NULL,
        question_index integer NOT NULL,
        answer text NOT NULL,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        CONSTRAINT unique_user_chapter_question UNIQUE (user_id, pillar, question_index)
      );
    `
  });

  if (createTableError) {
    // Try direct SQL if RPC doesn't work
    console.log('Attempting direct table creation...');

    // Check if table exists first
    const { data: existingTable } = await supabase
      .from('chapter_progress')
      .select('id')
      .limit(1);

    if (existingTable !== null) {
      console.log('chapter_progress table already exists!');
    } else {
      console.error('Could not create table. Please run the SQL migration manually in Supabase Dashboard:');
      console.error('Go to: SQL Editor -> New Query -> Paste the contents of supabase/migrations/023_chapter_progress.sql');
      return;
    }
  } else {
    console.log('chapter_progress table created successfully!');
  }

  // Create xp_transactions table
  const { error: xpTableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS xp_transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount integer NOT NULL,
        reason text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );
    `
  });

  if (xpTableError) {
    const { data: existingXPTable } = await supabase
      .from('xp_transactions')
      .select('id')
      .limit(1);

    if (existingXPTable !== null) {
      console.log('xp_transactions table already exists!');
    } else {
      console.error('Could not create xp_transactions table. Please include it in manual migration.');
    }
  } else {
    console.log('xp_transactions table created successfully!');
  }

  console.log('\n--- Migration Complete ---');
  console.log('If tables were not created automatically, please run the SQL migration manually:');
  console.log('1. Go to Supabase Dashboard -> SQL Editor');
  console.log('2. Create a new query');
  console.log('3. Paste the contents of: supabase/migrations/023_chapter_progress.sql');
  console.log('4. Run the query');
}

applyMigration().catch(console.error);
