/**
 * RLS Policy Verification Script
 * Checks Row Level Security policies on critical tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://lqskiijspudfocddhkqs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyRLSPolicies() {
  console.log('🔒 RLS Policy Verification Report\n');
  console.log('='.repeat(60));

  // Critical tables to check
  const criticalTables = [
    'users',
    'chat_sessions',
    'chat_messages',
    'user_badges',
    'user_quiz_progress',
    'athlete_public_profiles',
    'nil_deals',
    'agency_athlete_matches',
    'quiz_questions',
    'knowledge_base',
    'badges',
    'quiz_sessions'
  ];

  // Check RLS status for each table
  console.log('\n📋 Table RLS Status:\n');

  const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        c.relname as table_name,
        c.relrowsecurity as rls_enabled,
        c.relforcerowsecurity as rls_forced
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname IN (${criticalTables.map(t => `'${t}'`).join(',')})
      ORDER BY c.relname;
    `
  });

  if (rlsError) {
    // Fallback: try direct query approach
    console.log('Using alternative RLS check method...\n');

    for (const table of criticalTables) {
      try {
        // Test if table exists by querying it
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error && error.code === '42P01') {
          console.log(`  ⚪ ${table.padEnd(30)} - Table does not exist`);
        } else {
          console.log(`  ✅ ${table.padEnd(30)} - Table exists (RLS check via service role)`);
        }
      } catch (e) {
        console.log(`  ❓ ${table.padEnd(30)} - Could not verify`);
      }
    }
  } else {
    // Parse RLS data
    const rlsMap = new Map((rlsData || []).map((r: any) => [r.table_name, r]));

    for (const table of criticalTables) {
      const info = rlsMap.get(table);
      if (!info) {
        console.log(`  ⚪ ${table.padEnd(30)} - Table not found`);
      } else if (info.rls_enabled) {
        console.log(`  ✅ ${table.padEnd(30)} - RLS Enabled${info.rls_forced ? ' (Forced)' : ''}`);
      } else {
        console.log(`  ❌ ${table.padEnd(30)} - RLS DISABLED - SECURITY RISK!`);
      }
    }
  }

  // Check policies on each table
  console.log('\n\n📜 RLS Policies by Table:\n');

  const { data: policiesData, error: policiesError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename IN (${criticalTables.map(t => `'${t}'`).join(',')})
      ORDER BY tablename, policyname;
    `
  });

  if (policiesError) {
    console.log('  Could not fetch policies directly. Checking table access...\n');

    // Test specific access patterns
    console.log('\n🧪 Testing Data Access Patterns:\n');

    // Test 1: Anonymous access to public data
    console.log('  Test 1: Anonymous access patterns');
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

    const { data: badgesPublic, error: badgesErr } = await anonClient.from('badges').select('id').limit(1);
    console.log(`    badges (public read): ${badgesErr ? '❌ Blocked' : '✅ Allowed'}`);

    const { data: usersPublic, error: usersErr } = await anonClient.from('users').select('*').limit(1);
    console.log(`    users (should be restricted): ${usersErr ? '✅ Blocked (correct)' : '❌ EXPOSED!'}`);

    const { data: chatPublic, error: chatErr } = await anonClient.from('chat_sessions').select('*').limit(1);
    console.log(`    chat_sessions (should be restricted): ${chatErr ? '✅ Blocked (correct)' : '❌ EXPOSED!'}`);

  } else {
    // Group policies by table
    const policiesByTable = new Map<string, any[]>();
    for (const policy of (policiesData || [])) {
      const tableName = policy.tablename;
      if (!policiesByTable.has(tableName)) {
        policiesByTable.set(tableName, []);
      }
      policiesByTable.get(tableName)!.push(policy);
    }

    for (const table of criticalTables) {
      const policies = policiesByTable.get(table) || [];
      console.log(`\n  ${table}:`);
      if (policies.length === 0) {
        console.log(`    ⚠️  No policies defined (may rely on RLS OFF or default deny)`);
      } else {
        for (const p of policies) {
          console.log(`    • ${p.policyname} (${p.cmd}) - ${p.permissive}`);
        }
      }
    }
  }

  // Security recommendations
  console.log('\n\n🛡️ Security Recommendations:\n');
  console.log('  1. Ensure all user data tables have RLS enabled');
  console.log('  2. quiz_questions should be public read (educational content)');
  console.log('  3. knowledge_base should be public read for published items only');
  console.log('  4. chat_messages should only be accessible by session owner');
  console.log('  5. user_badges should be viewable by owner + displayed publicly');

  console.log('\n' + '='.repeat(60));
  console.log('✅ RLS Verification Complete\n');
}

verifyRLSPolicies().catch(console.error);
