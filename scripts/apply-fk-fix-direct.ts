import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
  console.log('Connecting to PostgreSQL database...');

  const client = await pool.connect();

  try {
    console.log('Connected! Applying foreign key fix...\n');

    // Step 1: Drop the old foreign key constraint
    console.log('Step 1: Dropping old foreign key constraint...');
    await client.query(`
      ALTER TABLE campaign_athletes
      DROP CONSTRAINT IF EXISTS campaign_athletes_campaign_id_fkey
    `);
    console.log('✅ Old constraint dropped (or did not exist)\n');

    // Step 2: Add new foreign key referencing agency_campaigns
    console.log('Step 2: Adding new foreign key to agency_campaigns...');
    await client.query(`
      ALTER TABLE campaign_athletes
      ADD CONSTRAINT campaign_athletes_campaign_id_fkey
      FOREIGN KEY (campaign_id) REFERENCES agency_campaigns(id) ON DELETE CASCADE
    `);
    console.log('✅ New constraint added!\n');

    // Verify
    console.log('Verifying constraint...');
    const result = await client.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'campaign_athletes'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'campaign_id'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Constraint verified:');
      console.log(`   - Name: ${result.rows[0].constraint_name}`);
      console.log(`   - Column: ${result.rows[0].column_name}`);
      console.log(`   - References: ${result.rows[0].foreign_table_name}`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('   Campaign invites should now work correctly.');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch(console.error);
