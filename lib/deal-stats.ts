/**
 * Shared Deal Statistics Calculator
 *
 * Single source of truth for deal stats across all pages.
 */

import { getDealDisplayStatus } from './deal-status';

interface DealForStats {
  id: string;
  status?: string;
  compliance_decision?: string | null;
  has_active_appeal?: boolean;
  compensation_amount?: number;
}

export interface DealStats {
  total: number;
  pendingReview: number;   // pending_review + response_submitted + conditions_completed
  needsAction: number;     // info_requested + approved_with_conditions (athlete must act)
  approved: number;
  rejected: number;
  appealed: number;
  notSubmitted: number;
  totalValue: number;
  approvedValue: number;
}

export function calculateDealStats(deals: DealForStats[]): DealStats {
  const stats: DealStats = {
    total: deals.length,
    pendingReview: 0,
    needsAction: 0,
    approved: 0,
    rejected: 0,
    appealed: 0,
    notSubmitted: 0,
    totalValue: 0,
    approvedValue: 0,
  };

  for (const deal of deals) {
    const displayStatus = getDealDisplayStatus(deal);
    const value = deal.compensation_amount || 0;
    stats.totalValue += value;

    switch (displayStatus.key) {
      case 'pending_review':
      case 'response_submitted':
      case 'conditions_completed':
        stats.pendingReview++;
        break;
      case 'info_requested':
      case 'approved_with_conditions':
        stats.needsAction++;
        break;
      case 'approved':
      case 'active':
      case 'completed':
        stats.approved++;
        stats.approvedValue += value;
        break;
      case 'rejected':
        stats.rejected++;
        break;
      case 'appeal_pending':
        stats.appealed++;
        break;
      case 'not_submitted':
      case 'draft':
        stats.notSubmitted++;
        break;
    }
  }

  return stats;
}
