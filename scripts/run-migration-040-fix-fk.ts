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
    console.log('🔧 Fixing foreign key constraints...\n');

    const migrationPath = join(process.cwd(), 'migrations', '040_fix_foreign_keys.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Foreign keys fixed successfully!\n');
    console.log('📋 Changed references from auth.users to public.users');
    console.log('✅ Athlete profiles can now be created!\n');

  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

runMigration();
