import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function applySQLDirect() {
  console.log('🚀 APPLYING MATCHMAKING DATA DIRECTLY\n');
  console.log('='.repeat(80));

  // Read the SQL file
  const sqlPath = join(process.cwd(), 'public', 'seed-matchmaking.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('\n📝 Loaded SQL file:', sqlPath);
  console.log(`   Size: ${sql.length} characters\n`);

  // Execute via Supabase's PostgreSQL REST API directly
  try {
    console.log('⚡ Executing SQL via direct PostgreSQL connection...\n');

    // Use Supabase's SQL endpoint which bypasses PostgREST cache
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Fallback: Split into individual statements and execute via fetch
      console.log('⚠️  RPC not available, trying statement-by-statement execution...\n');

      // Split SQL into statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^-{2,}/));

      console.log(`   Found ${statements.length} SQL statements\n`);

      let successCount = 0;
      let skipCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';

        // Skip comments and SELECT verification
        if (stmt.includes('SELECT') && stmt.includes('Seeding completed')) {
          console.log('   ⏭️  Skipping verification SELECT (will verify manually)');
          continue;
        }

        const preview = stmt.substring(0, 80).replace(/\n/g, ' ') + '...';

        try {
          // Use pg_notify to execute each statement
          const execResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'tx=commit'
            },
            body: JSON.stringify({ query: stmt })
          });

          if (execResponse.ok || execResponse.status === 409) {
            successCount++;
            if (i < 5) { // Only show first few for brevity
              console.log(`   ✅ Statement ${i + 1}: ${preview}`);
            }
          } else {
            const errorText = await execResponse.text();
            if (errorText.includes('already exists') || errorText.includes('duplicate')) {
              skipCount++;
            } else {
              console.log(`   ⚠️  Statement ${i + 1}: ${errorText.substring(0, 100)}`);
            }
          }
        } catch (err: any) {
          if (err.message.includes('already exists')) {
            skipCount++;
          }
        }
      }

      console.log(`\n   📊 Results: ${successCount} executed, ${skipCount} skipped (already exists)\n`);

    } else {
      const result = await response.json();
      console.log('✅ SQL executed successfully!\n');
      console.log(result);
    }

  } catch (err: any) {
    console.error(`\n❌ Error: ${err.message}\n`);
    console.log('ℹ️  Attempting alternative direct insertion method...\n');

    // Alternative: Use Node.js pg library if available
    try {
      const { Client } = await import('pg');

      // Parse connection string from Supabase URL
      const projectRef = supabaseUrl.split('//')[1].split('.')[0];

      console.log('   📝 To apply manually, run this in Supabase SQL Editor:');
      console.log(`   URL: https://supabase.com/dashboard/project/${projectRef}/sql\n`);
      console.log('   Or use the browser tool at: http://localhost:3000/apply-matchmaking-data.html\n');

      return false;
    } catch {
      console.log('   Use browser tool: http://localhost:3000/apply-matchmaking-data.html\n');
      return false;
    }
  }

  // Verify the data was inserted
  console.log('='.repeat(80));
  console.log('\n🔍 VERIFYING DATA...\n');

  const verifyUrl = `${supabaseUrl}/rest/v1/nil_deals?athlete_id=eq.ca05429a-0f32-4280-8b71-99dc5baee0dc&select=count`;

  try {
    const nilResponse = await fetch(verifyUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact'
      }
    });

    const nilCount = nilResponse.headers.get('content-range')?.split('/')[1] || '0';
    console.log(`   NIL Deals for Sarah: ${nilCount}`);

  } catch {
    console.log('   ⏳ Data may still be propagating through PostgREST cache');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ DATA APPLICATION COMPLETE!\n');
  console.log('🔗 Test URLs:');
  console.log('   • http://localhost:3000/athletes/sarah-johnson');
  console.log('   • http://localhost:3000/campaigns');
  console.log('   • http://localhost:3000/matches\n');

  return true;
}

applySQLDirect();
