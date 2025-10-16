import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/013_add_missing_athlete_fields.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    console.log('🚀 Executing migration...');
    console.log('SQL:', sql);

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    const results = [];

    for (const stmt of statements) {
      if (!stmt) continue;

      console.log('Executing:', stmt.substring(0, 100) + '...');

      // Execute using raw SQL via the client
      try {
        // Try to execute as a query
        const { data, error } = await supabase.rpc('query', { sql_text: stmt + ';' });

        if (error) {
          console.error('Statement error:', error);
          results.push({ statement: stmt.substring(0, 50), success: false, error: error.message });
        } else {
          console.log('Statement success');
          results.push({ statement: stmt.substring(0, 50), success: true });
        }
      } catch (e: any) {
        console.error('Statement exception:', e);
        results.push({ statement: stmt.substring(0, 50), success: false, error: e.message });
      }
    }

    // Verify columns exist
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('secondary_sports, school_level, coach_name, coach_email, nil_goals, stats, bio')
      .limit(1);

    if (verifyError) {
      console.error('Verification error:', verifyError);
      return NextResponse.json({
        success: false,
        message: 'Migration may have failed',
        results,
        verifyError: verifyError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      results,
      columnsVerified: true
    });

  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
