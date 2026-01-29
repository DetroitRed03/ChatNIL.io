#!/usr/bin/env npx tsx
/**
 * Apply RLS Policies for Settings Tables
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

const policies = [
  // User Settings Policies
  `DROP POLICY IF EXISTS "Users can view own settings" ON user_settings`,
  `CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings`,
  `CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can update own settings" ON user_settings`,
  `CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id)`,

  // Compliance Settings Policies
  `DROP POLICY IF EXISTS "Users can view own compliance settings" ON compliance_settings`,
  `CREATE POLICY "Users can view own compliance settings" ON compliance_settings FOR SELECT USING (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can insert own compliance settings" ON compliance_settings`,
  `CREATE POLICY "Users can insert own compliance settings" ON compliance_settings FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can update own compliance settings" ON compliance_settings`,
  `CREATE POLICY "Users can update own compliance settings" ON compliance_settings FOR UPDATE USING (auth.uid() = user_id)`,

  // Athlete Settings Policies
  `DROP POLICY IF EXISTS "Users can view own athlete settings" ON athlete_settings`,
  `CREATE POLICY "Users can view own athlete settings" ON athlete_settings FOR SELECT USING (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can insert own athlete settings" ON athlete_settings`,
  `CREATE POLICY "Users can insert own athlete settings" ON athlete_settings FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can update own athlete settings" ON athlete_settings`,
  `CREATE POLICY "Users can update own athlete settings" ON athlete_settings FOR UPDATE USING (auth.uid() = user_id)`,

  // Brand Settings Policies
  `DROP POLICY IF EXISTS "Users can view own brand settings" ON brand_settings`,
  `CREATE POLICY "Users can view own brand settings" ON brand_settings FOR SELECT USING (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can insert own brand settings" ON brand_settings`,
  `CREATE POLICY "Users can insert own brand settings" ON brand_settings FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `DROP POLICY IF EXISTS "Users can update own brand settings" ON brand_settings`,
  `CREATE POLICY "Users can update own brand settings" ON brand_settings FOR UPDATE USING (auth.uid() = user_id)`,

  // Compliance Team Members Policies - allow service role to manage
  `DROP POLICY IF EXISTS "Service role can manage team members" ON compliance_team_members`,
  `CREATE POLICY "Service role can manage team members" ON compliance_team_members FOR ALL USING (true)`,

  // Compliance Team Invites Policies - allow service role to manage
  `DROP POLICY IF EXISTS "Service role can manage invites" ON compliance_team_invites`,
  `CREATE POLICY "Service role can manage invites" ON compliance_team_invites FOR ALL USING (true)`,
];

async function applyPolicies() {
  console.log('='.repeat(60));
  console.log('Applying RLS Policies for Settings Tables');
  console.log('='.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < policies.length; i++) {
    const sql = policies[i];
    const preview = sql.substring(0, 70).replace(/\n/g, ' ') + '...';

    console.log(`\n[${i + 1}/${policies.length}] ${preview}`);

    try {
      const { error } = await supabase.rpc('exec_sql', { query: sql });

      if (error) {
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log(`  ⏭️  Skipped: ${error.message.substring(0, 50)}`);
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
  console.log(`RLS Policies Summary: ${successCount} succeeded, ${failCount} failed`);
  console.log('='.repeat(60));
}

applyPolicies().catch(console.error);
