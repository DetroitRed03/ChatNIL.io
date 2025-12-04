/**
 * Direct PostgreSQL Migration Runner
 * Applies migration 009 using the pg library
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Supabase connection details
const SUPABASE_URL = 'https://enbuwffusjhpcyoveewb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnV3ZmZ1c2pocGN5b3ZlZXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjcwOSwiZXhwIjoyMDc0MjYyNzA5fQ.fXvyvHrUoNLdAr1expbRsguM8fkmurrNQi3-7xk8-TM';

console.log('🚀 Starting Migration 009 Application');
console.log('📊 Supabase URL:', SUPABASE_URL);
console.log('');

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '009_create_user_quiz_progress_table.sql');
console.log('📂 Reading migration file:', migrationPath);

const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
console.log(`✅ Migration file loaded (${migrationSQL.length} characters)`);
console.log('');

// Split into individual statements (split by semicolon, but preserve DO blocks)
console.log('🔄 Parsing SQL statements...');
const statements = [];
let currentStatement = '';
let inDoBlock = false;

for (const line of migrationSQL.split('\n')) {
  const trimmed = line.trim();

  // Track DO blocks
  if (trimmed.startsWith('DO $$') || trimmed.startsWith('DO$')) {
    inDoBlock = true;
  }

  currentStatement += line + '\n';

  // End of statement (semicolon not in DO block or end of DO block)
  if (trimmed.endsWith(';')) {
    if (inDoBlock && (trimmed.includes('END $$') || trimmed.includes('END$'))) {
      inDoBlock = false;
      statements.push(currentStatement.trim());
      currentStatement = '';
    } else if (!inDoBlock) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }
}

// Filter out comments and empty statements
const validStatements = statements.filter(s =>
  s.length > 0 &&
  !s.startsWith('--') &&
  !s.match(/^\/\*/) &&
  s !== ';'
);

console.log(`✅ Found ${validStatements.length} SQL statements to execute`);
console.log('');

// Function to execute SQL via Supabase REST API
async function executeSQLViaRest(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: sql
    });

    const options = {
      hostname: 'enbuwffusjhpcyoveewb.supabase.co',
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, error: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Execute statements sequentially
async function runMigration() {
  console.log('🔄 Executing migration statements...');
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < validStatements.length; i++) {
    const statement = validStatements[i];

    // Skip NOTICE statements (they're just informational)
    if (statement.includes('RAISE NOTICE')) {
      console.log(`  ⏭️  Statement ${i + 1}: Skipping informational message`);
      continue;
    }

    try {
      const result = await executeSQLViaRest(statement);

      if (result.success) {
        console.log(`  ✅ Statement ${i + 1}: Success`);
        successCount++;
      } else {
        const errorText = result.error || '';

        // Check if it's an "already exists" error (which is OK)
        if (errorText.includes('already exists') || errorText.includes('duplicate')) {
          console.log(`  ⚠️  Statement ${i + 1}: Already exists (skipping)`);
        } else if (result.statusCode === 404) {
          console.log(`  ❌ Statement ${i + 1}: exec_sql function not found`);
          console.log('');
          console.log('⚠️  The exec_sql function does not exist in your database.');
          console.log('💡 Please apply migration 001 first, or use the Supabase dashboard method.');
          console.log('');
          console.log('Dashboard Method:');
          console.log('  1. Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql');
          console.log('  2. Copy contents of: supabase/migrations/009_create_user_quiz_progress_table.sql');
          console.log('  3. Paste and run');
          process.exit(1);
        } else {
          console.log(`  ❌ Statement ${i + 1}: ${errorText}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.log(`  ❌ Statement ${i + 1}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('');
  console.log(`✅ Executed ${successCount} statements successfully`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} statements had errors`);
  }
  console.log('');

  // Verify functions
  console.log('🔍 Verifying database functions...');

  const functionsToCheck = [
    'get_user_quiz_stats',
    'get_recommended_questions',
    'record_quiz_answer',
    'get_quiz_session_results'
  ];

  for (const funcName of functionsToCheck) {
    const checkSQL = `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = '${funcName}';`;

    try {
      const result = await executeSQLViaRest(checkSQL);
      if (result.success && result.data && !result.data.includes('[]')) {
        console.log(`  ✅ ${funcName} - EXISTS`);
      } else {
        console.log(`  ❌ ${funcName} - NOT FOUND`);
      }
    } catch (e) {
      console.log(`  ❓ ${funcName} - Could not verify`);
    }
  }

  console.log('');
  console.log('🎉 Migration 009 application completed!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Restart your development server');
  console.log('  2. Test quiz stats on dashboard');
  console.log('  3. Check for PGRST202 errors');
}

runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
