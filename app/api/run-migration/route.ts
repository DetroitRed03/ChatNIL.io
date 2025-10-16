import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/run-migration
 * Runs the badge RLS fix migration
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service role client not configured' },
        { status: 500 }
      );
    }

    console.log('🔧 Running badge RLS migration...');

    // Drop existing policies
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Everyone can read active badges" ON badges;
        DROP POLICY IF EXISTS "Service role can manage badges" ON badges;
      `
    });

    // Create new policy for authenticated users
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Authenticated users can read active badges" ON badges
          FOR SELECT
          TO authenticated
          USING (is_active = true);
      `
    });

    // Create new policy for service role
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Service role has full access to badges" ON badges
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
      `
    });

    console.log('✅ Badge RLS migration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Badge RLS policies fixed successfully'
    });
  } catch (error: any) {
    console.error('❌ Error running migration:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to run migration'
      },
      { status: 500 }
    );
  }
}
