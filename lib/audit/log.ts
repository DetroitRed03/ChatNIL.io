import { createServiceRoleClient } from '@/lib/supabase/server';

export type AuditAction =
  | 'deal_submitted'
  | 'deal_reviewed'
  | 'deal_approved'
  | 'deal_rejected'
  | 'deal_approved_conditional'
  | 'info_requested'
  | 'info_provided'
  | 'note_added'
  | 'score_override'
  | 'deal_assigned'
  | 'deal_reassigned'
  | 'appeal_submitted'
  | 'appeal_reviewed';

export interface AuditLogEntry {
  dealId?: string;
  athleteId?: string;
  action: AuditAction;
  previousStatus?: string;
  newStatus?: string;
  decision?: string;
  internalNote?: string;
  athleteNote?: string;
  metadata?: Record<string, any>;
}

export interface LogDealActionOptions {
  previousStatus?: string;
  newStatus?: string;
  decision?: string;
  internalNote?: string;
  athleteNote?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an audit event to the compliance_audit_log table.
 * Uses the service role client to bypass RLS.
 */
export async function logAuditEvent(
  userId: string,
  entry: AuditLogEntry
) {
  const supabaseAdmin = createServiceRoleClient();

  // Get user profile for name/role/institution
  const { data: profile } = await supabaseAdmin
    .from('athlete_profiles')
    .select('username, role, institution_id')
    .eq('user_id', userId)
    .single();

  // Get email from auth.users
  const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(userId);

  // Determine academic year
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const academicYear = `${year}-${year + 1}`;

  const { error } = await supabaseAdmin
    .from('compliance_audit_log')
    .insert({
      deal_id: entry.dealId,
      athlete_id: entry.athleteId,
      performed_by: userId,
      user_name: profile?.username || authUser?.email,
      user_email: authUser?.email,
      user_role: profile?.role,
      action: entry.action,
      previous_status: entry.previousStatus,
      new_status: entry.newStatus,
      decision: entry.decision,
      internal_note: entry.internalNote,
      athlete_note: entry.athleteNote,
      metadata: entry.metadata || {},
      institution_id: profile?.institution_id,
      academic_year: academicYear,
    });

  if (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Helper to log an action on a specific deal.
 * Automatically resolves the athlete_id from the deal.
 */
export async function logDealAction(
  userId: string,
  dealId: string,
  action: AuditAction,
  options: LogDealActionOptions = {}
) {
  const supabaseAdmin = createServiceRoleClient();

  const { data: deal } = await supabaseAdmin
    .from('nil_deals')
    .select('athlete_id')
    .eq('id', dealId)
    .single();

  return logAuditEvent(userId, {
    dealId,
    athleteId: deal?.athlete_id,
    action,
    ...options,
  });
}
