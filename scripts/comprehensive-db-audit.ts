import { createClient } from '@supabase/supabase-js';

// NEW Database credentials
const supabaseUrl = 'https://lqskiijspudfocddhkqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

const supabase = createClient(supabaseUrl, supabaseKey);

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface TableAudit {
  exists: boolean;
  rowCount: number;
  columns: ColumnInfo[];
  sampleData?: any[];
  error?: string;
}

async function auditDatabase() {
  console.log('═'.repeat(100));
  console.log('🔍 COMPREHENSIVE DATABASE AUDIT');
  console.log('═'.repeat(100));
  console.log(`📊 Database: ${supabaseUrl}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  const tables = [
    'athlete_profiles',
    'social_media_stats',
    'agency_campaigns',
    'agency_athlete_lists',
    'agency_message_threads',
  ];

  const audit: Record<string, TableAudit> = {};

  for (const tableName of tables) {
    console.log(`\n${'─'.repeat(100)}`);
    console.log(`📋 TABLE: ${tableName}`);
    console.log('─'.repeat(100));

    try {
      // 1. Check if table exists and get row count
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: false })
        .limit(3);

      if (error) {
        console.log(`❌ ERROR: ${error.message}`);
        audit[tableName] = {
          exists: false,
          rowCount: 0,
          columns: [],
          error: error.message,
        };
        continue;
      }

      console.log(`✅ Table exists`);
      console.log(`📊 Row count: ${count || 0}`);

      // 2. Get column information by querying actual data structure
      let columns: ColumnInfo[] = [];

      if (data && data.length > 0) {
        // Infer columns from actual data
        const sampleRow = data[0];
        columns = Object.keys(sampleRow).map(key => ({
          column_name: key,
          data_type: typeof sampleRow[key],
          is_nullable: 'UNKNOWN',
          column_default: null,
        }));

        console.log(`\n📋 COLUMNS (${columns.length} total):`);
        columns.forEach(col => {
          console.log(`   • ${col.column_name} (${col.data_type})`);
        });

        console.log(`\n📝 SAMPLE DATA (first 3 rows):`);
        data.forEach((row, idx) => {
          console.log(`\n   Row ${idx + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            const displayValue = value === null ? 'NULL' :
                               typeof value === 'object' ? JSON.stringify(value).substring(0, 50) :
                               String(value).substring(0, 50);
            console.log(`      ${key}: ${displayValue}`);
          });
        });
      } else {
        console.log(`\n⚠️  Table is EMPTY - cannot infer column structure`);
      }

      audit[tableName] = {
        exists: true,
        rowCount: count || 0,
        columns,
        sampleData: data || [],
      };

    } catch (err) {
      console.log(`❌ EXCEPTION: ${err instanceof Error ? err.message : 'Unknown error'}`);
      audit[tableName] = {
        exists: false,
        rowCount: 0,
        columns: [],
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // Summary Report
  console.log(`\n\n${'═'.repeat(100)}`);
  console.log('📊 AUDIT SUMMARY');
  console.log('═'.repeat(100));

  const existingTables = Object.keys(audit).filter(t => audit[t].exists);
  const missingTables = Object.keys(audit).filter(t => !audit[t].exists);
  const emptyTables = Object.keys(audit).filter(t => audit[t].exists && audit[t].rowCount === 0);
  const populatedTables = Object.keys(audit).filter(t => audit[t].exists && audit[t].rowCount > 0);

  console.log(`\n✅ EXISTING TABLES: ${existingTables.length}/${tables.length}`);
  existingTables.forEach(t => {
    const status = audit[t].rowCount === 0 ? '(EMPTY)' : `(${audit[t].rowCount} rows, ${audit[t].columns.length} cols)`;
    console.log(`   ✓ ${t} ${status}`);
  });

  if (missingTables.length > 0) {
    console.log(`\n❌ MISSING TABLES: ${missingTables.length}`);
    missingTables.forEach(t => console.log(`   ✗ ${t} - ${audit[t].error}`));
  }

  if (emptyTables.length > 0) {
    console.log(`\n⚠️  EMPTY TABLES: ${emptyTables.length}`);
    emptyTables.forEach(t => console.log(`   ⚠ ${t} (${audit[t].columns.length} columns defined)`));
  }

  console.log(`\n📈 POPULATED TABLES: ${populatedTables.length}`);
  populatedTables.forEach(t => {
    console.log(`   ✓ ${t} - ${audit[t].rowCount} rows`);
  });

  // Check for expected columns in key tables
  console.log(`\n\n${'═'.repeat(100)}`);
  console.log('🔎 COLUMN VERIFICATION');
  console.log('═'.repeat(100));

  const expectedColumns = {
    agency_campaigns: ['id', 'name', 'budget', 'spent', 'status', 'created_at'],
    athlete_profiles: ['user_id', 'sport', 'school', 'position', 'estimated_fmv'],
    social_media_stats: ['user_id', 'instagram_followers', 'tiktok_followers', 'engagement_rate'],
    agency_athlete_lists: ['id', 'created_at'],
  };

  Object.entries(expectedColumns).forEach(([table, expectedCols]) => {
    if (audit[table]?.exists && audit[table].columns.length > 0) {
      const actualCols = audit[table].columns.map(c => c.column_name);
      const missing = expectedCols.filter(col => !actualCols.includes(col));
      const extra = actualCols.filter(col => !expectedCols.includes(col));

      console.log(`\n📋 ${table}:`);
      console.log(`   Expected: ${expectedCols.join(', ')}`);
      console.log(`   Actual: ${actualCols.join(', ')}`);

      if (missing.length > 0) {
        console.log(`   ❌ MISSING: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        console.log(`   ➕ EXTRA: ${extra.join(', ')}`);
      }
      if (missing.length === 0 && extra.length === 0) {
        console.log(`   ✅ All expected columns present`);
      }
    }
  });

  // Save detailed report
  const fs = require('fs');
  const reportPath = '/tmp/db-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(audit, null, 2));
  console.log(`\n\n💾 Detailed audit report saved to: ${reportPath}`);

  console.log(`\n${'═'.repeat(100)}\n`);

  return audit;
}

auditDatabase().catch(console.error);
