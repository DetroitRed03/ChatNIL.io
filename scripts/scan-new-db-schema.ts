import { createClient } from '@supabase/supabase-js';

// NEW Database (always use this one)
const supabaseUrl = 'https://lqskiijspudfocddhkqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function scanSchema() {
  console.log('🔍 COMPREHENSIVE DATABASE SCHEMA SCAN');
  console.log('═'.repeat(80));
  console.log(`📊 Database: ${supabaseUrl}\n`);

  try {
    // Define expected tables we need for seed data
    const expectedTables = [
      'athlete_profiles',
      'social_media_stats',
      'agency_campaigns',
      'agency_athlete_lists',
      'agency_message_threads'
    ];

    console.log('1️⃣ CHECKING FOR EXPECTED TABLES...\n');

    const allColumnData: any = {};

    for (const tableName of expectedTables) {
      console.log(`📋 Checking table: ${tableName}`);
      console.log('─'.repeat(80));

      // Try to query the table directly
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table does NOT exist or is not accessible`);
        console.log(`   Error: ${error.message}`);
        allColumnData[tableName] = { exists: false, error: error.message };
      } else {
        console.log(`✅ Table exists (${count || 0} rows)`);

        // Get column information using a SQL query via fetch
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                SELECT
                  column_name,
                  data_type,
                  is_nullable,
                  column_default
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = '${tableName}'
                ORDER BY ordinal_position;
              `
            })
          }
        );

        const columnResult = await response.json();

        if (Array.isArray(columnResult) && columnResult.length > 0) {
          console.log('   Columns:');
          columnResult.forEach((col: any) => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
            const defaultVal = col.column_default ? ` = ${col.column_default.substring(0, 30)}` : '';
            console.log(`      - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
          });
          allColumnData[tableName] = {
            exists: true,
            rowCount: count || 0,
            columns: columnResult.map((c: any) => c.column_name)
          };
        } else {
          console.log('   ⚠️  Could not fetch column details');
          allColumnData[tableName] = { exists: true, rowCount: count || 0, columns: [] };
        }
      }
      console.log('');
    }

    // Summary
    console.log('═'.repeat(80));
    console.log('📊 SCHEMA SCAN COMPLETE');
    console.log('═'.repeat(80));

    const existingTables = Object.keys(allColumnData).filter(t => allColumnData[t].exists);
    const missingTables = Object.keys(allColumnData).filter(t => !allColumnData[t].exists);

    console.log(`✅ Existing Tables: ${existingTables.length}/${expectedTables.length}`);
    existingTables.forEach(t => console.log(`   ✓ ${t} (${allColumnData[t].rowCount} rows, ${allColumnData[t].columns?.length || 0} columns)`));

    if (missingTables.length > 0) {
      console.log(`\n❌ Missing Tables: ${missingTables.length}`);
      missingTables.forEach(t => console.log(`   ✗ ${t}`));
    }
    console.log('');

    // Save detailed report
    const fs = require('fs');
    fs.writeFileSync(
      '/tmp/new-db-schema-report.json',
      JSON.stringify(allColumnData, null, 2)
    );
    console.log('💾 Detailed schema report saved to: /tmp/new-db-schema-report.json');

    // Return the data for further processing
    return allColumnData;

  } catch (error) {
    console.error('❌ Scan failed:', error);
  }
}

scanSchema().catch(console.error);
