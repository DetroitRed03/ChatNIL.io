/**
 * Compliance Decision Notification Helpers
 *
 * Creates notifications for athletes when compliance decisions are made on their deals.
 */

import { createClient } from '@supabase/supabase-js';

// Notification type constants
export const COMPLIANCE_NOTIFICATION_TYPES = {
  APPROVED: 'deal_approved',
  REJECTED: 'deal_rejected',
  APPROVED_WITH_CONDITIONS: 'deal_approved_with_conditions',
  INFO_REQUESTED: 'deal_info_requested',
} as const;

export type ComplianceDecision = 'approved' | 'approved_with_conditions' | 'rejected' | 'info_requested';

interface NotificationContent {
  type: string;
  title: string;
  message: string;
}

/**
 * Maps compliance decisions to notification content
 */
function getNotificationContent(
  decision: ComplianceDecision,
  brandName: string,
  athleteNotes?: string
): NotificationContent {
  const baseMessages: Record<ComplianceDecision, NotificationContent> = {
    approved: {
      type: COMPLIANCE_NOTIFICATION_TYPES.APPROVED,
      title: 'Deal Approved!',
      message: `Great news! Your deal with ${brandName} has been approved by your compliance team. You can proceed with the partnership.`,
    },
    approved_with_conditions: {
      type: COMPLIANCE_NOTIFICATION_TYPES.APPROVED_WITH_CONDITIONS,
      title: 'Deal Approved with Conditions',
      message: `Your deal with ${brandName} has been conditionally approved. Please review the conditions from your compliance team before proceeding.`,
    },
    rejected: {
      type: COMPLIANCE_NOTIFICATION_TYPES.REJECTED,
      title: 'Deal Not Approved',
      message: `Your deal with ${brandName} was not approved by your compliance team. Please review the feedback for details and your options.`,
    },
    info_requested: {
      type: COMPLIANCE_NOTIFICATION_TYPES.INFO_REQUESTED,
      title: 'Additional Information Needed',
      message: `Your compliance team needs more information about your deal with ${brandName}. Please respond to their request to continue the review.`,
    },
  };

  const content = { ...baseMessages[decision] };

  // Append athlete notes if provided
  if (athleteNotes) {
    content.message += `\n\nNote from compliance: ${athleteNotes}`;
  }

  return content;
}

interface CreateComplianceNotificationParams {
  athleteUserId: string;  // The user_id from nil_deals.athlete_id
  dealId: string;
  brandName: string;
  decision: ComplianceDecision;
  athleteNotes?: string;
}

/**
 * Creates a notification for an athlete about a compliance decision
 * and updates the deal's athlete_notified_at timestamp
 */
export async function createComplianceDecisionNotification({
  athleteUserId,
  dealId,
  brandName,
  decision,
  athleteNotes,
}: CreateComplianceNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Create admin client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const notificationContent = getNotificationContent(decision, brandName, athleteNotes);

    // Create the notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: athleteUserId,
        type: notificationContent.type,
        title: notificationContent.title,
        message: notificationContent.message,
        metadata: {
          deal_id: dealId,
          decision,
          brand_name: brandName,
        },
        action_url: `/deals/${dealId}`,
        read_at: null,
      });

    if (notificationError) {
      console.error('Error creating compliance notification:', notificationError);
      return { success: false, error: notificationError.message };
    }

    // Update the deal's athlete_notified_at timestamp
    const { error: updateError } = await supabase
      .from('nil_deals')
      .update({ athlete_notified_at: new Date().toISOString() })
      .eq('id', dealId);

    if (updateError) {
      console.error('Error updating athlete_notified_at:', updateError);
      // Non-critical - notification was still created
    }

    console.log(`✅ Compliance notification created for athlete ${athleteUserId} - decision: ${decision}`);
    return { success: true };
  } catch (error) {
    console.error('Error in createComplianceDecisionNotification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Creates a notification for an appeal resolution
 */
export async function createAppealResolutionNotification({
  athleteUserId,
  dealId,
  brandName,
  resolution,
  resolutionNotes,
}: {
  athleteUserId: string;
  dealId: string;
  brandName: string;
  resolution: 'upheld' | 'modified' | 'reversed';
  resolutionNotes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const resolutionMessages = {
      upheld: {
        title: 'Appeal Decision: Original Decision Upheld',
        message: `Your appeal for the ${brandName} deal has been reviewed. The original decision has been upheld.`,
      },
      modified: {
        title: 'Appeal Decision: Decision Modified',
        message: `Your appeal for the ${brandName} deal has been reviewed and the decision has been modified. Please check the updated status.`,
      },
      reversed: {
        title: 'Appeal Decision: Decision Reversed',
        message: `Great news! Your appeal for the ${brandName} deal has been accepted and the decision has been reversed.`,
      },
    };

    const content = resolutionMessages[resolution];
    let message = content.message;
    if (resolutionNotes) {
      message += `\n\nNote: ${resolutionNotes}`;
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: athleteUserId,
      type: 'appeal_resolution',
      title: content.title,
      message,
      metadata: { deal_id: dealId, resolution },
      action_url: `/deals/${dealId}`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
