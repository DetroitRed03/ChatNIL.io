import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

async function executeSQL() {
  console.log('🔌 CONNECTING DIRECTLY TO POSTGRESQL\n');
  console.log('='.repeat(80));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];

  console.log(`\n📋 Project: ${projectRef}`);
  console.log('\n⚠️  This requires database password from Supabase dashboard');
  console.log('   Go to: Settings > Database > Connection string\n');

  // Try to connect using environment variable if it exists
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_PASSWORD;

  if (!dbPassword) {
    console.log('❌ No database password found in environment variables');
    console.log('\n📝 To apply SQL automatically, add to .env.local:');
    console.log('   SUPABASE_DB_PASSWORD=your_password_here\n');
    console.log('📋 OR apply manually via Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql\n');
    return false;
  }

  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

  console.log('🔗 Attempting connection...\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL!\n');

    // Read SQL file
    const sqlPath = join(process.cwd(), 'public', 'FINAL_WORKING_SETUP.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log(`📝 Executing SQL from: ${sqlPath}`);
    console.log(`   Size: ${sql.length} characters\n`);

    // Execute the SQL
    const result = await client.query(sql);

    console.log('✅ SQL executed successfully!\n');

    if (result && result.rows) {
      console.log('📊 Result:', result.rows);
    }

    await client.end();

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('🔗 Test URLs:');
    console.log('   • http://localhost:3000/athletes/sarah-johnson');
    console.log('   • http://localhost:3000/campaigns');
    console.log('   • http://localhost:3000/matches\n');

    return true;

  } catch (err: any) {
    console.error('\n❌ Error:', err.message);

    if (err.message.includes('password')) {
      console.log('\n💡 Get your database password from:');
      console.log('   https://supabase.com/dashboard/project/' + projectRef + '/settings/database');
      console.log('\n   Then add to .env.local:');
      console.log('   SUPABASE_DB_PASSWORD=your_password_here\n');
    }

    return false;
  }
}

executeSQL().then(success => {
  if (!success) {
    console.log('📋 Manual application required');
    console.log('   File: /public/FINAL_WORKING_SETUP.sql');
    console.log('   URL: http://localhost:3000/APPLY-NOW.html\n');
  }
});
