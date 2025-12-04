import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function applySQLNow() {
  console.log('🚀 APPLYING SQL DIRECTLY TO DATABASE\n');
  console.log('='.repeat(80));

  // Read the SQL file
  const sqlPath = join(process.cwd(), 'public', 'FINAL_WORKING_SETUP.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log(`\n📝 Loaded: ${sqlPath}`);
  console.log(`   Size: ${sql.length} characters\n`);

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      // Filter out comments and empty statements
      if (!s) return false;
      if (s.startsWith('--')) return false;
      if (s.match(/^-{2,}/)) return false;
      return true;
    });

  console.log(`   Found ${statements.length} SQL statements\n`);
  console.log('⚡ Executing statements...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim() + ';';

    // Skip SELECT verification at the end
    if (stmt.includes('Setup complete!')) {
      console.log('   ⏭️  Skipping verification SELECT (will verify after)');
      continue;
    }

    const preview = stmt.substring(0, 100).replace(/\n/g, ' ');

    try {
      // Use the query endpoint directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: stmt })
      });

      if (response.ok) {
        successCount++;
        if (successCount <= 5 || stmt.includes('INSERT')) {
          console.log(`   ✅ ${i + 1}/${statements.length}: ${preview}...`);
        }
      } else {
        const errorText = await response.text();

        // Check if it's just a "already exists" or conflict error
        if (errorText.includes('already exists') ||
            errorText.includes('duplicate') ||
            errorText.includes('ON CONFLICT')) {
          skipCount++;
        } else {
          errorCount++;
          console.log(`   ⚠️  ${i + 1}/${statements.length}: ${errorText.substring(0, 100)}`);
        }
      }
    } catch (err: any) {
      errorCount++;
      console.log(`   ❌ ${i + 1}/${statements.length}: ${err.message.substring(0, 100)}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Results: ${successCount} executed, ${skipCount} skipped, ${errorCount} errors\n`);

  // Now verify what was created
  console.log('🔍 VERIFYING DATA...\n');

  const verifyQueries = [
    { name: 'NIL Deals for Sarah', url: `/rest/v1/nil_deals?athlete_id=eq.ca05429a-0f32-4280-8b71-99dc5baee0dc&select=count` },
    { name: 'Active Campaigns', url: `/rest/v1/agency_campaigns?status=eq.active&select=count` },
    { name: 'Matches for Sarah', url: `/rest/v1/agency_athlete_matches?athlete_id=eq.ca05429a-0f32-4280-8b71-99dc5baee0dc&select=count` },
    { name: 'State Rules', url: `/rest/v1/state_nil_rules?select=count` }
  ];

  for (const query of verifyQueries) {
    try {
      const response = await fetch(`${supabaseUrl}${query.url}`, {
        method: 'HEAD',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      });

      const count = response.headers.get('content-range')?.split('/')[1] || '?';
      console.log(`   ${query.name}: ${count}`);
    } catch (err) {
      console.log(`   ${query.name}: Error (may need cache reload)`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ SQL APPLICATION COMPLETE!\n');
  console.log('🔗 Test URLs:');
  console.log('   • http://localhost:3000/athletes/sarah-johnson');
  console.log('   • http://localhost:3000/campaigns');
  console.log('   • http://localhost:3000/matches\n');
}

applySQLNow().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  console.log('\n📋 Fallback: Please apply manually via Supabase SQL Editor');
  console.log('   URL: https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql');
  console.log('   File: /public/FINAL_WORKING_SETUP.sql\n');
});
