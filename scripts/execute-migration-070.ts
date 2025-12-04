import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeMigration() {
  console.log('📝 Executing Migration 070: Profile and Cover Photo Support\n');
  console.log('=' .repeat(60));

  const migrationPath = path.join(process.cwd(), 'migrations', '070_add_profile_cover_photos.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  try {
    // Split SQL into individual statements (respecting BEGIN/COMMIT blocks)
    // For Supabase, we'll execute via REST API using a custom approach

    console.log('\n🔄 Step 1: Adding photo URL columns...');
    const { error: step1Error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_uploaded_at TIMESTAMPTZ;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_photo_uploaded_at TIMESTAMPTZ;
      `
    }).catch(() => ({ error: null })); // Ignore if RPC doesn't exist

    // Alternative: Use direct SQL execution via PostgREST
    // Since exec RPC doesn't exist, we'll need to use the REST API directly
    const executeSQL = async (sqlQuery: string, description: string) => {
      console.log(`\n🔄 ${description}...`);

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: sqlQuery }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed: ${errorText}`);
        return false;
      }

      console.log(`✅ ${description} - Success`);
      return true;
    };

    // Since we can't execute arbitrary SQL via Supabase JS client,
    // we need to use a different approach
    console.log('\n⚠️  Direct SQL execution not available via Supabase JS client.');
    console.log('\nℹ️  Please execute the migration manually via Supabase Dashboard:');
    console.log(`\n🔗 ${supabaseUrl.replace('/rest/v1', '')}/project/default/sql`);
    console.log('\n📋 Copy and paste the contents of: migrations/070_add_profile_cover_photos.sql');
    console.log('\n✅ The backend API routes and utilities are ready to use once migration is applied!\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

executeMigration();
