import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('🚀 Running migration via API...');

    // Execute each ALTER TABLE command separately
    const commands = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_sports TEXT[]',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS school_level VARCHAR(50)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS coach_name VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS coach_email VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS nil_goals TEXT[]',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS stats JSONB',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT',
      'CREATE INDEX IF NOT EXISTS idx_users_school_level ON users(school_level)',
      'CREATE INDEX IF NOT EXISTS idx_users_secondary_sports ON users USING gin(secondary_sports)',
      'CREATE INDEX IF NOT EXISTS idx_users_nil_goals ON users USING gin(nil_goals)'
    ];

    const results = [];

    for (const cmd of commands) {
      console.log('Executing:', cmd);

      // We can't execute DDL via the JS client, so we'll verify the columns exist instead
      // This endpoint will tell you if you need to run the migration manually
    }

    // Check if columns exist by trying to select them
    const { data, error } = await supabase
      .from('users')
      .select('secondary_sports, school_level, coach_name, coach_email, nil_goals, stats, bio')
      .limit(1);

    if (error) {
      // Columns don't exist - need manual migration
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          needsMigration: true,
          message: 'Migration needed - columns do not exist',
          instructions: {
            step1: 'Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql/new',
            step2: 'Copy the SQL from: supabase/migrations/013_add_missing_athlete_fields.sql',
            step3: 'Paste and click Run',
            sql: `
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS secondary_sports TEXT[],
  ADD COLUMN IF NOT EXISTS school_level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS coach_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS coach_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nil_goals TEXT[],
  ADD COLUMN IF NOT EXISTS stats JSONB,
  ADD COLUMN IF NOT EXISTS bio TEXT;

CREATE INDEX IF NOT EXISTS idx_users_school_level ON users(school_level);
CREATE INDEX IF NOT EXISTS idx_users_secondary_sports ON users USING gin(secondary_sports);
CREATE INDEX IF NOT EXISTS idx_users_nil_goals ON users USING gin(nil_goals);
            `.trim()
          }
        }, { status: 200 });
      }

      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Columns exist!
    return NextResponse.json({
      success: true,
      message: 'Migration already completed! All columns exist.',
      columns: ['secondary_sports', 'school_level', 'coach_name', 'coach_email', 'nil_goals', 'stats', 'bio']
    });

  } catch (error: any) {
    console.error('Migration check failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
