#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const sqlFile = process.argv[2];

  if (!sqlFile) {
    console.error('Usage: npx tsx scripts/run-sql-via-rpc.ts <sql-file>');
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log(`Executing SQL from ${sqlFile}...`);

  const { data, error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('Result:', data);

  // Verify the profiles were created
  const verifySQL = `
    SELECT display_name, sport, school_name, instagram_followers, tiktok_followers, total_followers, estimated_fmv_min, estimated_fmv_max
    FROM athlete_public_profiles
    ORDER BY total_followers DESC;
  `;

  const { data: profilesData, error: profilesError } = await supabase.rpc('exec_sql', { query: verifySQL });

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nTo view the athlete profiles, go to Supabase Dashboard → Table Editor → athlete_public_profiles');
  }
}

main();
