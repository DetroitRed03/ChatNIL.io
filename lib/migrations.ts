import fs from 'fs';
import path from 'path';

export interface Migration {
  id: string;
  name: string;
  filename: string;
  content: string;
  version: number;
}

export interface MigrationStatus {
  total_migrations: number;
  executed_count: number;
  pending_count: number;
  available_migrations: Array<{
    id: string;
    name: string;
    filename: string;
    executed: boolean;
    version: number;
  }>;
  pending_migrations: Array<{
    id: string;
    name: string;
    filename: string;
    version: number;
  }>;
}

/**
 * Get the migrations directory path
 */
export function getMigrationsDir(): string {
  return path.join(process.cwd(), 'migrations');
}

/**
 * Ensure migrations directory exists
 */
export function ensureMigrationsDir(): void {
  const migrationsDir = getMigrationsDir();
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('📁 Created migrations directory:', migrationsDir);
  }
}

/**
 * Parse migration filename to extract version and name
 */
export function parseMigrationFilename(filename: string): { version: number; name: string } | null {
  const match = filename.match(/^(\d+)[-_](.+)\.sql$/);
  if (!match) {
    return null;
  }

  const [, versionStr, name] = match;
  return {
    version: parseInt(versionStr, 10),
    name: name.replace(/[-_]/g, ' ')
  };
}

/**
 * Load all available migrations from the migrations directory
 */
export function loadAvailableMigrations(): Migration[] {
  ensureMigrationsDir();
  const migrationsDir = getMigrationsDir();

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  const migrations: Migration[] = [];

  for (const filename of files) {
    const parsed = parseMigrationFilename(filename);
    if (!parsed) {
      console.warn(`⚠️ Skipping invalid migration filename: ${filename}`);
      continue;
    }

    const content = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');

    migrations.push({
      id: filename.replace('.sql', ''),
      name: parsed.name,
      filename,
      content,
      version: parsed.version
    });
  }

  // Sort by version number
  return migrations.sort((a, b) => a.version - b.version);
}

/**
 * Generate the next migration filename
 */
export function generateMigrationFilename(name: string): string {
  const availableMigrations = loadAvailableMigrations();
  const maxVersion = availableMigrations.reduce((max, migration) =>
    Math.max(max, migration.version), 0
  );

  const nextVersion = String(maxVersion + 1).padStart(3, '0');
  const safeName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  return `${nextVersion}_${safeName}.sql`;
}

/**
 * Create a new migration file
 */
export function createMigrationFile(name: string, content: string): string {
  ensureMigrationsDir();

  const filename = generateMigrationFilename(name);
  const filepath = path.join(getMigrationsDir(), filename);

  // Add a header comment to the migration
  const migrationContent = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Version: ${filename.split('_')[0]}

${content}
`;

  fs.writeFileSync(filepath, migrationContent, 'utf8');
  console.log('✅ Created migration file:', filename);

  return filename;
}

/**
 * Migration runner utilities for API endpoints
 */
export class MigrationRunner {
  static async runMigration(migrationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migration_id: migrationId })
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.success ? `Migration ${migrationId} completed` : result.error
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to run migration: ${error.message}`
      };
    }
  }

  static async runAllPendingMigrations(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_all: true })
      });

      const result = await response.json();
      return {
        success: result.success,
        message: result.success ? 'All migrations completed' : result.error
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to run migrations: ${error.message}`
      };
    }
  }

  static async getMigrationStatus(): Promise<MigrationStatus | null> {
    try {
      const response = await fetch('/api/migrate');
      const result = await response.json();

      if (result.success) {
        return result.status;
      }

      console.error('Failed to get migration status:', result.error);
      return null;
    } catch (error: any) {
      console.error('Failed to fetch migration status:', error.message);
      return null;
    }
  }
}

/**
 * Common migration templates
 */
export const MigrationTemplates = {
  createTable: (tableName: string, columns: Array<{ name: string; type: string; constraints?: string }>) => `
-- Create table: ${tableName}
CREATE TABLE IF NOT EXISTS ${tableName} (
${columns.map(col => `  ${col.name} ${col.type}${col.constraints ? ' ' + col.constraints : ''}`).join(',\n')}
);

-- Add table permissions
GRANT ALL ON ${tableName} TO service_role;
GRANT ALL ON ${tableName} TO postgres;
`,

  addColumn: (tableName: string, columnName: string, columnType: string, constraints?: string) => `
-- Add column: ${columnName} to ${tableName}
ALTER TABLE ${tableName}
ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}${constraints ? ' ' + constraints : ''};
`,

  createIndex: (tableName: string, columnName: string, indexName?: string) => `
-- Create index on ${tableName}.${columnName}
CREATE INDEX IF NOT EXISTS ${indexName || `idx_${tableName}_${columnName}`}
ON ${tableName}(${columnName});
`,

  enableRLS: (tableName: string) => `
-- Enable Row Level Security on ${tableName}
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
`,

  disableRLS: (tableName: string) => `
-- Disable Row Level Security on ${tableName}
ALTER TABLE ${tableName} DISABLE ROW LEVEL SECURITY;
`
};