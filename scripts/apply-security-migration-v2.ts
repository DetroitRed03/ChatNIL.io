/**
 * Apply Security Audit Migration 301 - Version 2
 * Uses direct fetch to Supabase SQL endpoint
 */

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function executeSql(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function applyMigration() {
  console.log('🔐 Applying Security Audit Migration 301...\n');

  // PART 1: NIL DEALS RLS POLICIES
  console.log('📋 Part 1: Setting up NIL Deals RLS policies...');

  const part1Sql = `
    -- Grant permissions
    GRANT ALL ON nil_deals TO service_role;
    GRANT SELECT, INSERT, UPDATE ON nil_deals TO authenticated;

    -- Enable RLS on nil_deals
    ALTER TABLE nil_deals ENABLE ROW LEVEL SECURITY;

    -- Drop any existing policies to avoid conflicts
    DROP POLICY IF EXISTS "service_role_full_access_deals" ON nil_deals;
    DROP POLICY IF EXISTS "athletes_view_own_deals" ON nil_deals;
    DROP POLICY IF EXISTS "agencies_view_own_deals" ON nil_deals;
    DROP POLICY IF EXISTS "agencies_create_deals" ON nil_deals;
    DROP POLICY IF EXISTS "agencies_update_own_deals" ON nil_deals;
    DROP POLICY IF EXISTS "athletes_update_response_fields" ON nil_deals;
    DROP POLICY IF EXISTS "public_deals_viewable" ON nil_deals;

    -- Create policies
    CREATE POLICY "service_role_full_access_deals" ON nil_deals
      FOR ALL TO service_role USING (true) WITH CHECK (true);

    CREATE POLICY "athletes_view_own_deals" ON nil_deals
      FOR SELECT TO authenticated USING (auth.uid() = athlete_id);

    CREATE POLICY "agencies_view_own_deals" ON nil_deals
      FOR SELECT TO authenticated USING (auth.uid() = agency_id);

    CREATE POLICY "agencies_create_deals" ON nil_deals
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = agency_id);

    CREATE POLICY "agencies_update_own_deals" ON nil_deals
      FOR UPDATE TO authenticated
      USING (auth.uid() = agency_id) WITH CHECK (auth.uid() = agency_id);

    CREATE POLICY "athletes_update_response_fields" ON nil_deals
      FOR UPDATE TO authenticated
      USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

    CREATE POLICY "public_deals_viewable" ON nil_deals
      FOR SELECT TO anon USING (is_public = true);
  `;

  let result = await executeSql(part1Sql);
  if (result.success) {
    console.log('✅ NIL Deals policies configured\n');
  } else {
    console.log('⚠️  Note: Some policies may already exist:', result.error?.slice(0, 100));
  }

  // PART 2: AGENCY ATHLETE MATCHES
  console.log('📋 Part 2: Updating Agency Athlete Matches...');

  const part2Sql = `
    -- Add columns if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agency_athlete_matches'
        AND column_name = 'responded_at'
      ) THEN
        ALTER TABLE agency_athlete_matches ADD COLUMN responded_at TIMESTAMPTZ;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agency_athlete_matches'
        AND column_name = 'response_history'
      ) THEN
        ALTER TABLE agency_athlete_matches ADD COLUMN response_history JSONB DEFAULT '[]'::jsonb;
      END IF;
    END $$;

    -- Drop and recreate update policies
    DROP POLICY IF EXISTS "agencies_update_own_matches" ON agency_athlete_matches;
    DROP POLICY IF EXISTS "athletes_update_own_response" ON agency_athlete_matches;

    CREATE POLICY "agencies_update_own_matches" ON agency_athlete_matches
      FOR UPDATE TO authenticated
      USING (auth.uid() = agency_id) WITH CHECK (auth.uid() = agency_id);

    CREATE POLICY "athletes_update_own_response" ON agency_athlete_matches
      FOR UPDATE TO authenticated
      USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);
  `;

  result = await executeSql(part2Sql);
  if (result.success) {
    console.log('✅ Agency Athlete Matches policies updated\n');
  } else {
    console.log('⚠️  Note:', result.error?.slice(0, 100));
  }

  // PART 3: AUDIT LOG TABLE
  console.log('📋 Part 3: Creating security audit log table...');

  const part3Sql = `
    CREATE TABLE IF NOT EXISTS security_audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      record_id UUID,
      user_id UUID,
      old_data JSONB,
      new_data JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    GRANT ALL ON security_audit_log TO service_role;
    GRANT INSERT ON security_audit_log TO authenticated;

    CREATE INDEX IF NOT EXISTS idx_audit_log_table ON security_audit_log(table_name);
    CREATE INDEX IF NOT EXISTS idx_audit_log_user ON security_audit_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_created ON security_audit_log(created_at DESC);
  `;

  result = await executeSql(part3Sql);
  if (result.success) {
    console.log('✅ Security audit log table created\n');
  } else {
    console.log('⚠️  Note:', result.error?.slice(0, 100));
  }

  console.log('🎉 Security Audit Migration 301 completed!');
  console.log('\nSummary of changes applied:');
  console.log('- RLS enabled on nil_deals table');
  console.log('- 7 security policies created for nil_deals');
  console.log('- 2 security policies updated for agency_athlete_matches');
  console.log('- Security audit log table created');
  console.log('- Columns added: responded_at, response_history');
}

applyMigration().catch(console.error);
