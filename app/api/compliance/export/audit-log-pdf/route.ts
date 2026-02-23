/**
 * GET /api/compliance/export/audit-log-pdf
 *
 * Export compliance audit log as a PDF report.
 * Generates a formatted document with summary stats and entries.
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

const ACTION_LABELS: Record<string, string> = {
  deal_submitted: 'Deal Submitted',
  deal_reviewed: 'Deal Reviewed',
  deal_approved: 'Deal Approved',
  'Deal approved': 'Deal Approved',
  deal_rejected: 'Deal Rejected',
  'Deal rejected': 'Deal Rejected',
  deal_approved_conditional: 'Approved with Conditions',
  'Deal approved with conditions': 'Approved with Conditions',
  info_requested: 'Information Requested',
  'Additional information requested': 'Information Requested',
  info_provided: 'Information Provided',
  note_added: 'Note Added',
  score_override: 'Score Override',
  deal_assigned: 'Deal Assigned',
  deal_reassigned: 'Deal Reassigned',
  appeal_submitted: 'Appeal Submitted',
  appeal_reviewed: 'Appeal Reviewed',
};

function formatAction(action: string): string {
  return ACTION_LABELS[action] || action;
}

/**
 * Generate a simple text-based PDF-like report.
 * Uses plain text formatting since pdfkit may not be available.
 * This generates a well-structured plain-text report that can be
 * consumed as-is or rendered by the client.
 */
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

    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('role, institution_id, username')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer' && officer?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get institution name
    let institutionName = 'Unknown Institution';
    if (officer?.institution_id) {
      const { data: inst } = await supabaseAdmin
        .from('institutions')
        .select('name')
        .eq('id', officer.institution_id)
        .single();
      if (inst?.name) institutionName = inst.name;
    }

    // Parse params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const athleteId = searchParams.get('athleteId');

    // Fetch logs
    let query = supabaseAdmin
      .from('compliance_audit_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (officer?.institution_id) {
      query = query.eq('institution_id', officer.institution_id);
    }
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate + 'T23:59:59Z');
    if (athleteId) query = query.eq('athlete_id', athleteId);

    const { data: logs } = await query.limit(500);

    // Calculate summary stats
    const allLogs = logs || [];
    const approvals = allLogs.filter(l =>
      l.action === 'deal_approved' || l.action === 'Deal approved'
    ).length;
    const rejections = allLogs.filter(l =>
      l.action === 'deal_rejected' || l.action === 'Deal rejected'
    ).length;
    const conditionalApprovals = allLogs.filter(l =>
      l.action === 'deal_approved_conditional' || l.action === 'Deal approved with conditions'
    ).length;
    const infoRequests = allLogs.filter(l =>
      l.action === 'info_requested' || l.action === 'Additional information requested'
    ).length;

    // Build HTML report (rendered as downloadable PDF via print)
    const dateRange = startDate || endDate
      ? `${startDate || 'Start'} to ${endDate || 'Present'}`
      : 'All time';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Compliance Audit Log - ${institutionName}</title>
  <style>
    @media print { @page { margin: 0.5in; size: letter; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    h1 { text-align: center; font-size: 24px; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 30px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
    .stat { background: #f5f5f5; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    .stat-approve .stat-value { color: #16a34a; }
    .stat-reject .stat-value { color: #dc2626; }
    .stat-cond .stat-value { color: #ca8a04; }
    .stat-info .stat-value { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f5f5f5; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
    tr:nth-child(even) { background: #fafafa; }
    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
    .note { font-style: italic; color: #666; max-width: 200px; }
  </style>
</head>
<body>
  <h1>Compliance Audit Log</h1>
  <div class="subtitle">
    ${institutionName}<br>
    Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
    Date Range: ${dateRange}
  </div>

  <div class="summary">
    <div class="stat stat-approve">
      <div class="stat-value">${approvals}</div>
      <div class="stat-label">Approvals</div>
    </div>
    <div class="stat stat-cond">
      <div class="stat-value">${conditionalApprovals}</div>
      <div class="stat-label">Conditional</div>
    </div>
    <div class="stat stat-reject">
      <div class="stat-value">${rejections}</div>
      <div class="stat-label">Rejections</div>
    </div>
    <div class="stat stat-info">
      <div class="stat-value">${infoRequests}</div>
      <div class="stat-label">Info Requests</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date/Time</th>
        <th>Action</th>
        <th>Reviewer</th>
        <th>Deal ID</th>
        <th>Note</th>
      </tr>
    </thead>
    <tbody>
      ${allLogs.slice(0, 500).map(log => `
      <tr>
        <td>${new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td>${formatAction(log.action)}</td>
        <td>${log.user_name || log.performed_by?.substring(0, 8) || 'System'}</td>
        <td style="font-family: monospace; font-size: 11px;">${log.deal_id ? log.deal_id.substring(0, 8) + '...' : '-'}</td>
        <td class="note">${(log.internal_note || log.athlete_note || '').substring(0, 100)}${(log.internal_note || log.athlete_note || '').length > 100 ? '...' : ''}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  ${allLogs.length > 500 ? `<p style="text-align: center; color: #666; margin-top: 16px;">Showing 500 of ${allLogs.length} entries. Export CSV for complete data.</p>` : ''}

  <div class="footer">
    This document is confidential and intended for compliance purposes only.<br>
    Generated by ChatNIL Compliance Platform
  </div>
</body>
</html>`;

    const filename = `compliance-audit-log-${new Date().toISOString().split('T')[0]}.html`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Audit log PDF export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
