/**
 * GET /api/compliance/export/audit-log
 *
 * Export compliance audit log as CSV or JSON.
 * Filterable by date range, athlete, deal, action, academic year.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    let { data: { user } } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      if (tokenUser) user = tokenUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify compliance officer role
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('role, institution_id')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer' && officer?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const athleteId = searchParams.get('athleteId');
    const dealId = searchParams.get('dealId');
    const action = searchParams.get('action');
    const academicYear = searchParams.get('academicYear');

    // Build query
    let query = supabaseAdmin
      .from('compliance_audit_log')
      .select(`
        id,
        deal_id,
        athlete_id,
        performed_by,
        user_name,
        user_email,
        user_role,
        action,
        previous_status,
        new_status,
        decision,
        internal_note,
        athlete_note,
        details,
        metadata,
        created_at,
        academic_year
      `)
      .order('created_at', { ascending: false });

    // Scope to institution if available
    if (officer?.institution_id) {
      query = query.eq('institution_id', officer.institution_id);
    }

    // Apply filters
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate + 'T23:59:59Z');
    if (athleteId) query = query.eq('athlete_id', athleteId);
    if (dealId) query = query.eq('deal_id', dealId);
    if (action) query = query.eq('action', action);
    if (academicYear) query = query.eq('academic_year', academicYear);

    const { data: logs, error: queryError } = await query.limit(10000);

    if (queryError) {
      console.error('Audit log query error:', queryError);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    if (format === 'json') {
      return NextResponse.json({ logs, count: logs?.length || 0 });
    }

    // CSV format
    const headers = [
      'Date/Time',
      'Action',
      'Deal ID',
      'Athlete ID',
      'Reviewer',
      'Reviewer Email',
      'Role',
      'Previous Status',
      'New Status',
      'Decision',
      'Internal Note',
      'Athlete Note',
      'Academic Year',
    ];

    const rows = (logs || []).map(log => [
      new Date(log.created_at).toISOString(),
      log.action || '',
      log.deal_id || '',
      log.athlete_id || '',
      log.user_name || '',
      log.user_email || '',
      log.user_role || '',
      log.previous_status || '',
      log.new_status || '',
      log.decision || '',
      (log.internal_note || '').replace(/"/g, '""'),
      (log.athlete_note || '').replace(/"/g, '""'),
      log.academic_year || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const filename = `compliance-audit-log-${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Audit log export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
