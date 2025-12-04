#!/usr/bin/env tsx

/**
 * Grant Service Role Permissions for Seeding
 * Grants full access to service role for all tables that need seeding
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TABLES_TO_GRANT = [
  'athlete_public_profiles',
  'agency_campaigns',
  'nil_deals',
  'agency_athlete_matches',
  'notifications',
  'events',
  'quiz_progress',
  'badges',
  'user_badges'
];

async function grantPermissions() {
  console.log('🔐 Granting service role permissions for seeding...\n');

  for (const tableName of TABLES_TO_GRANT) {
    console.log(`📋 Granting permissions on ${tableName}...`);

    const { error } = await supabase.rpc('exec_sql', {
      query: `
        -- Create policy to allow service role full access
        DO $$
        BEGIN
          -- Drop existing service role policy if it exists
          DROP POLICY IF EXISTS "Service role full access" ON ${tableName};

          -- Create new policy for service role
          CREATE POLICY "Service role full access"
            ON ${tableName}
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);

          RAISE NOTICE 'Policy created for ${tableName}';
        EXCEPTION
          WHEN undefined_table THEN
            RAISE NOTICE 'Table ${tableName} does not exist, skipping...';
          WHEN others THEN
            RAISE NOTICE 'Error on ${tableName}: %', SQLERRM;
        END $$;
      `
    });

    if (error) {
      console.log(`   ⚠️  ${tableName}: ${error.message}`);
    } else {
      console.log(`   ✅ ${tableName}: Permissions granted`);
    }
  }

  console.log('\n✨ All permissions granted!');
  console.log('\n📝 Note: Service role can now bypass RLS for seeding operations');
}

grantPermissions();
