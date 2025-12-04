import { supabaseAdmin } from '../lib/supabase';
import fs from 'fs';
import path from 'path';

const MIGRATIONS = [
  'supabase/migrations/010_create_chat_sessions_table.sql',
  'supabase/migrations/011_create_chat_messages_table.sql',
  'supabase/migrations/012_create_chat_attachments_table.sql',
  'supabase/migrations/013_fix_chat_rls_policies.sql',
  'supabase/migrations/050_enhance_chat_attachments.sql'
];

async function applyMigrations() {
  console.log('🔧 Applying Chat Migrations...\n');

  for (const migrationPath of MIGRATIONS) {
    const fullPath = path.join(process.cwd(), migrationPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Skipping ${migrationPath} - file not found`);
      continue;
    }

    console.log(`📝 Applying ${migrationPath}...`);
    const sql = fs.readFileSync(fullPath, 'utf-8');

    try {
      // Execute the SQL directly via service role
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: sql
      });

      if (error) {
        console.error(`❌ Error in ${migrationPath}:`, error.message);
      } else {
        console.log(`✅ Applied ${migrationPath}`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to apply ${migrationPath}:`, err.message);
    }

    console.log('');
  }

  // Verify tables were created
  console.log('📊 Verifying chat tables...\n');

  const tables = ['chat_sessions', 'chat_messages', 'chat_attachments'];

  for (const table of tables) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists`);
    }
  }

  console.log('\n🎉 Chat migrations complete!');
}

applyMigrations();
