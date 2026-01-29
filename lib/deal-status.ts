/**
 * Unified Deal Display Status
 *
 * Single source of truth for mapping deal state → display status.
 * Use this everywhere instead of ad-hoc status logic.
 */

export type DisplayStatusKey =
  | 'appeal_pending'
  | 'conditions_completed'
  | 'response_submitted'
  | 'approved'
  | 'approved_with_conditions'
  | 'rejected'
  | 'info_requested'
  | 'pending_review'
  | 'not_submitted'
  | 'active'
  | 'completed'
  | 'draft';

export interface DisplayStatus {
  key: DisplayStatusKey;
  label: string;
  friendlyLabel: string;
  color: string; // tailwind bg + text classes
  bgClass: string;
  textClass: string;
}

const STATUS_MAP: Record<DisplayStatusKey, DisplayStatus> = {
  appeal_pending: {
    key: 'appeal_pending',
    label: 'Appeal Pending',
    friendlyLabel: 'Appeal under review',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
  conditions_completed: {
    key: 'conditions_completed',
    label: 'Conditions Submitted',
    friendlyLabel: 'Awaiting final approval',
    color: 'teal',
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-700',
  },
  response_submitted: {
    key: 'response_submitted',
    label: 'Response Submitted',
    friendlyLabel: 'Awaiting re-review',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
  approved: {
    key: 'approved',
    label: 'Approved',
    friendlyLabel: 'All good!',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  approved_with_conditions: {
    key: 'approved_with_conditions',
    label: 'Approved with Conditions',
    friendlyLabel: 'Conditions required',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  rejected: {
    key: 'rejected',
    label: 'Rejected',
    friendlyLabel: 'Not approved',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
  info_requested: {
    key: 'info_requested',
    label: 'Information Requested',
    friendlyLabel: 'School needs more info',
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
  pending_review: {
    key: 'pending_review',
    label: 'Pending Review',
    friendlyLabel: 'Waiting on school',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
  },
  not_submitted: {
    key: 'not_submitted',
    label: 'Not Submitted',
    friendlyLabel: 'Needs to be reported',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
  },
  active: {
    key: 'active',
    label: 'Active',
    friendlyLabel: 'Deal in progress',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  completed: {
    key: 'completed',
    label: 'Completed',
    friendlyLabel: 'Done',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
  draft: {
    key: 'draft',
    label: 'Draft',
    friendlyLabel: 'Not started',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
};

interface DealForStatus {
  status?: string;
  compliance_decision?: string | null;
  has_active_appeal?: boolean;
}

/**
 * Returns the unified display status for a deal.
 * Priority order: appeal > conditions_completed > response_submitted > decision > status
 */
export function getDealDisplayStatus(deal: DealForStatus): DisplayStatus {
  // Active appeal takes highest priority
  if (deal.has_active_appeal) {
    return STATUS_MAP.appeal_pending;
  }

  // Then check compliance_decision (most specific)
  const decision = deal.compliance_decision;
  if (decision === 'conditions_completed') return STATUS_MAP.conditions_completed;
  if (decision === 'response_submitted') return STATUS_MAP.response_submitted;
  if (decision === 'approved') return STATUS_MAP.approved;
  if (decision === 'approved_with_conditions') return STATUS_MAP.approved_with_conditions;
  if (decision === 'rejected') return STATUS_MAP.rejected;
  if (decision === 'info_requested') return STATUS_MAP.info_requested;

  // Fall back to deal status
  const status = deal.status;
  if (status === 'pending_review') return STATUS_MAP.pending_review;
  if (status === 'approved' || status === 'approved_conditional') return STATUS_MAP.approved;
  if (status === 'rejected') return STATUS_MAP.rejected;
  if (status === 'active') return STATUS_MAP.active;
  if (status === 'completed') return STATUS_MAP.completed;
  if (status === 'draft') return STATUS_MAP.draft;
  if (status === 'pending') return STATUS_MAP.pending_review;

  return STATUS_MAP.not_submitted;
}

/**
 * Get a specific display status by key.
 */
export function getDisplayStatusByKey(key: DisplayStatusKey): DisplayStatus {
  return STATUS_MAP[key];
}
