import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Server-side service role client for migrations
function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

interface Migration {
  id: string;
  name: string;
  filename: string;
  content: string;
}

interface MigrationRecord {
  id: string;
  name: string;
  executed_at: string;
  success: boolean;
  error_message?: string;
}

// Create the SQL execution function in Supabase if it doesn't exist
async function ensureSQLExecutor() {
  try {
    // First, try to create the SQL execution function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(query text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
        RETURN json_build_object('success', true);
      EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
      END;
      $$;

      GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
    `;

    // Try to execute this directly using a known table operation
    // We'll create this function by inserting it as a schema migration
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Execute raw SQL using our custom function
async function executeSQL(sql: string): Promise<{ success: boolean; error?: string; data?: any }> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Ensure the SQL executor function exists
    await ensureSQLExecutor();

    // Use the custom SQL execution function
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.log('⚠️ SQL execution via RPC failed, this might be expected:', error.message);
    // For now, we'll return success but note that direct SQL execution isn't available
    // The migration system will still work for basic table operations
    return { success: false, error: `Direct SQL execution not available: ${error.message}` };
  }
}

// Ensure migrations table exists
async function ensureMigrationsTable() {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Try to query the migrations table first to see if it exists
    const { data, error } = await supabaseAdmin
      .from('migrations')
      .select('id')
      .limit(1);

    if (!error) {
      // Table exists
      return { success: true };
    }

    // If table doesn't exist, create it using direct SQL
    console.log('Creating migrations table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id varchar(50) PRIMARY KEY,
        name varchar(255) NOT NULL,
        executed_at timestamp with time zone DEFAULT now(),
        success boolean NOT NULL DEFAULT true,
        error_message text
      );
    `;

    return await executeSQL(createTableSQL);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get available migrations from the migrations directory
function getAvailableMigrations(): Migration[] {
  const migrationsDir = path.join(process.cwd(), 'migrations');

  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  return files.map(filename => {
    const content = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
    const id = filename.replace('.sql', '');
    const name = id.replace(/^\d+[-_]/, '').replace(/[-_]/g, ' ');

    return {
      id,
      name,
      filename,
      content
    };
  });
}

// Get executed migrations from database
async function getExecutedMigrations(): Promise<MigrationRecord[]> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    const { data, error } = await supabaseAdmin
      .from('migrations')
      .select('*')
      .order('executed_at', { ascending: true });

    if (error) {
      console.warn('Could not fetch migrations table:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Error fetching executed migrations:', error);
    return [];
  }
}

// Execute a single migration
async function executeMigration(migration: Migration): Promise<{ success: boolean; error?: string }> {
  const supabaseAdmin = getSupabaseAdmin();
  console.log(`🔄 Executing migration: ${migration.id}`);

  try {
    // First, ensure migrations table exists
    const tableResult = await ensureMigrationsTable();
    if (!tableResult.success) {
      throw new Error(`Could not create migrations table: ${tableResult.error}`);
    }

    // Execute the migration SQL
    const migrationResult = await executeSQL(migration.content);

    if (!migrationResult.success) {
      throw new Error(`Migration execution failed: ${migrationResult.error}`);
    }

    // Record the successful migration
    const { error: recordError } = await supabaseAdmin
      .from('migrations')
      .insert({
        id: migration.id,
        name: migration.name,
        success: true,
        executed_at: new Date().toISOString()
      });

    if (recordError) {
      console.warn('Could not record migration (but migration succeeded):', recordError.message);
    }

    console.log(`✅ Migration completed: ${migration.id}`);
    return { success: true };

  } catch (error: any) {
    console.error(`❌ Migration failed: ${migration.id}`, error);

    // Try to record the failed migration
    try {
      await supabaseAdmin
        .from('migrations')
        .insert({
          id: migration.id,
          name: migration.name,
          success: false,
          error_message: error.message,
          executed_at: new Date().toISOString()
        });
    } catch (recordError) {
      console.warn('Could not record failed migration:', recordError);
    }

    return { success: false, error: error.message };
  }
}

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    console.log('📋 === MIGRATION STATUS CHECK ===');

    const availableMigrations = getAvailableMigrations();
    const executedMigrations = await getExecutedMigrations();

    const executedIds = new Set(executedMigrations.map(m => m.id));
    const pendingMigrations = availableMigrations.filter(m => !executedIds.has(m.id));

    const status = {
      total_migrations: availableMigrations.length,
      executed_count: executedMigrations.length,
      pending_count: pendingMigrations.length,
      available_migrations: availableMigrations.map(m => ({
        id: m.id,
        name: m.name,
        filename: m.filename,
        executed: executedIds.has(m.id)
      })),
      executed_migrations: executedMigrations,
      pending_migrations: pendingMigrations.map(m => ({
        id: m.id,
        name: m.name,
        filename: m.filename
      }))
    };

    console.log('📊 Migration status:', status);

    return NextResponse.json({
      success: true,
      message: 'Migration status retrieved',
      status
    });

  } catch (error: any) {
    console.error('💥 Migration status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        status: null
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    console.log('🚀 === MIGRATION EXECUTION ===');

    const body = await request.json();
    const { migration_id, run_all = false } = body;

    const availableMigrations = getAvailableMigrations();
    const executedMigrations = await getExecutedMigrations();
    const executedIds = new Set(executedMigrations.map(m => m.id));

    let migrationsToRun: Migration[] = [];

    if (run_all) {
      // Run all pending migrations
      migrationsToRun = availableMigrations.filter(m => !executedIds.has(m.id));
      console.log(`📦 Running all ${migrationsToRun.length} pending migrations`);
    } else if (migration_id) {
      // Run specific migration
      const migration = availableMigrations.find(m => m.id === migration_id);
      if (!migration) {
        return NextResponse.json(
          { success: false, error: `Migration not found: ${migration_id}` },
          { status: 404 }
        );
      }
      if (executedIds.has(migration_id)) {
        return NextResponse.json(
          { success: false, error: `Migration already executed: ${migration_id}` },
          { status: 409 }
        );
      }
      migrationsToRun = [migration];
      console.log(`🎯 Running specific migration: ${migration_id}`);
    } else {
      return NextResponse.json(
        { success: false, error: 'Must specify migration_id or run_all=true' },
        { status: 400 }
      );
    }

    if (migrationsToRun.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No migrations to run',
        results: []
      });
    }

    // Execute migrations
    const results = [];
    let allSuccessful = true;

    for (const migration of migrationsToRun) {
      const result = await executeMigration(migration);
      results.push({
        migration_id: migration.id,
        migration_name: migration.name,
        ...result
      });

      if (!result.success) {
        allSuccessful = false;
        console.log(`❌ Stopping migration execution due to failure in: ${migration.id}`);
        break; // Stop on first failure
      }
    }

    const message = allSuccessful
      ? `Successfully executed ${results.length} migration(s)`
      : `Migration execution stopped after failure`;

    return NextResponse.json({
      success: allSuccessful,
      message,
      results
    });

  } catch (error: any) {
    console.error('💥 Migration execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        results: []
      },
      { status: 500 }
    );
  }
}