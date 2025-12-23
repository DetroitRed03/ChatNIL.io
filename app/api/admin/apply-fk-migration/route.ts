/**
 * Admin API to fix the campaign_athletes foreign key constraint
 * POST /api/admin/apply-fk-migration
 *
 * This is a one-time fix API that changes the FK from 'campaigns' to 'agency_campaigns'
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST() {
  try {
    const supabase = getSupabaseClient();

    // The issue: campaign_athletes.campaign_id references 'campaigns' table
    // but we're using 'agency_campaigns' table

    // WORKAROUND: Since we can't run DDL via Supabase JS client,
    // we'll implement a different approach - disable FK check temporarily
    // by using the Supabase SQL Editor hook or the exec_sql function

    // First, check if exec_sql exists
    const { error: execError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE campaign_athletes
        DROP CONSTRAINT IF EXISTS campaign_athletes_campaign_id_fkey;

        ALTER TABLE campaign_athletes
        ADD CONSTRAINT campaign_athletes_campaign_id_fkey
        FOREIGN KEY (campaign_id) REFERENCES agency_campaigns(id) ON DELETE CASCADE;
      `
    });

    if (execError) {
      // If exec_sql doesn't exist, return instructions
      if (execError.message.includes('exec_sql')) {
        return NextResponse.json({
          success: false,
          error: 'exec_sql function not available',
          manual_fix_required: true,
          sql_to_run: `
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql/new

ALTER TABLE campaign_athletes
DROP CONSTRAINT IF EXISTS campaign_athletes_campaign_id_fkey;

ALTER TABLE campaign_athletes
ADD CONSTRAINT campaign_athletes_campaign_id_fkey
FOREIGN KEY (campaign_id) REFERENCES agency_campaigns(id) ON DELETE CASCADE;

-- Grant permissions
GRANT ALL ON campaign_athletes TO authenticated;
GRANT ALL ON campaign_athletes TO service_role;
          `,
        }, { status: 400 });
      }
      throw execError;
    }

    return NextResponse.json({
      success: true,
      message: 'Foreign key constraint updated successfully',
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  // Check current FK constraint
  try {
    const supabase = getSupabaseClient();
    const { data: fkCheck } = await supabase
      .from('campaign_athletes')
      .select('campaign_id')
      .limit(0);

    // If we can query, check what tables we have
    const { data: campaigns } = await supabase
      .from('agency_campaigns')
      .select('id, name')
      .limit(3);

    return NextResponse.json({
      status: 'checking',
      message: 'Check the SQL editor manually',
      sample_campaigns: campaigns,
      instructions: {
        step1: 'Open https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql/new',
        step2: 'Run the SQL from /public/fix-campaign-athletes-fk.html',
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
