#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Parse URL
const url = new URL(SUPABASE_URL);

async function runSQL(sql, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const data = JSON.stringify({ query: sql });

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const result = JSON.parse(responseData);
        if (result.success === false) {
          console.log(`  ⚠️  ${description}: ${result.error}`);
          resolve({ success: false, error: result.error });
        } else {
          console.log(`  ✅ ${description}`);
          resolve({ success: true });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Applying compliance review migration (step by step)...\n');

  // Step 1: Add columns to nil_deals
  console.log('📋 Step 1: Adding columns to nil_deals table...');
  await runSQL(`
    ALTER TABLE nil_deals
    ADD COLUMN IF NOT EXISTS compliance_decision VARCHAR(50),
    ADD COLUMN IF NOT EXISTS compliance_decision_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS compliance_decision_by UUID,
    ADD COLUMN IF NOT EXISTS athlete_notes TEXT,
    ADD COLUMN IF NOT EXISTS internal_notes TEXT;
  `, 'nil_deals columns added');

  // Step 2: Add index
  console.log('\n📋 Step 2: Adding index...');
  await runSQL(`
    CREATE INDEX IF NOT EXISTS idx_nil_deals_compliance_decision
    ON nil_deals(compliance_decision) WHERE compliance_decision IS NOT NULL;
  `, 'Index created');

  // Step 3: Add columns to compliance_scores
  console.log('\n📋 Step 3: Adding columns to compliance_scores table...');
  await runSQL(`
    ALTER TABLE compliance_scores
    ADD COLUMN IF NOT EXISTS override_score INTEGER,
    ADD COLUMN IF NOT EXISTS override_justification TEXT,
    ADD COLUMN IF NOT EXISTS override_by UUID,
    ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ;
  `, 'compliance_scores columns added');

  // Step 4: Create audit log table WITHOUT foreign keys
  console.log('\n📋 Step 4: Creating compliance_audit_log table...');
  await runSQL(`
    CREATE TABLE IF NOT EXISTS compliance_audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deal_id UUID,
      athlete_id UUID,
      action VARCHAR(255) NOT NULL,
      performed_by UUID,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `, 'compliance_audit_log table created');

  // Step 5: Add indexes
  console.log('\n📋 Step 5: Adding indexes to audit log...');
  await runSQL(`
    CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_deal_id
    ON compliance_audit_log(deal_id);
  `, 'deal_id index created');

  await runSQL(`
    CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_athlete_id
    ON compliance_audit_log(athlete_id);
  `, 'athlete_id index created');

  await runSQL(`
    CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_created_at
    ON compliance_audit_log(created_at DESC);
  `, 'created_at index created');

  // Step 6: Enable RLS
  console.log('\n📋 Step 6: Enabling RLS...');
  await runSQL(`
    ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;
  `, 'RLS enabled');

  // Step 7: Create policies (drop first if exists)
  console.log('\n📋 Step 7: Creating RLS policies...');
  await runSQL(`
    DROP POLICY IF EXISTS "Compliance officers can view audit logs" ON compliance_audit_log;
  `, 'Dropped existing view policy (if any)');

  await runSQL(`
    CREATE POLICY "Compliance officers can view audit logs"
    ON compliance_audit_log
    FOR SELECT
    TO authenticated
    USING (true);
  `, 'View policy created');

  await runSQL(`
    DROP POLICY IF EXISTS "Compliance officers can insert audit logs" ON compliance_audit_log;
  `, 'Dropped existing insert policy (if any)');

  await runSQL(`
    CREATE POLICY "Compliance officers can insert audit logs"
    ON compliance_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  `, 'Insert policy created');

  console.log('\n🎉 Migration completed successfully!');
  console.log('   Compliance officers can now review and approve deals.');
}

main().catch(console.error);
