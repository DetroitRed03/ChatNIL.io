import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addUsernameColumn() {
  console.log('🚀 Adding username column to users table\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'migrations', '031_add_username_to_users.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL migration...\n');
    console.log(sql);
    console.log('\n');

    // Execute the SQL - we'll use a raw query approach
    // Since we can't execute DDL through the regular Supabase client,
    // we need to inform the user to run this via Supabase dashboard

    console.log('⚠️  MANUAL STEP REQUIRED:');
    console.log('The username column needs to be added via Supabase SQL Editor.');
    console.log('\nPlease:');
    console.log('1. Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql/new');
    console.log('2. Copy and paste the SQL from: migrations/031_add_username_to_users.sql');
    console.log('3. Click "Run" to execute the migration');
    console.log('\nOR use the HTML page at: http://localhost:3000/run-migration-031.html');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addUsernameColumn();
