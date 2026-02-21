import { sendEmail } from './resend';
import { authEmails } from './templates/auth';
import { teamEmails } from './templates/team';
import { dealEmails } from './templates/deals';
import { digestEmails } from './templates/digest';
import { supportEmails } from './templates/support';

// ============ AUTH EMAILS ============

export async function sendWelcomeEmail(
  to: string,
  userName: string,
  role: 'athlete' | 'parent' | 'compliance_officer'
) {
  const template = authEmails.welcome(userName, role);
  return sendEmail({
    to,
    from: 'welcome',
    ...template,
    tags: [{ name: 'category', value: 'welcome' }],
  });
}

export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationUrl: string
) {
  const template = authEmails.verifyEmail(userName, verificationUrl);
  return sendEmail({
    to,
    from: 'welcome',
    ...template,
    tags: [{ name: 'category', value: 'verification' }],
  });
}

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string
) {
  const template = authEmails.passwordReset(userName, resetUrl);
  return sendEmail({
    to,
    from: 'security',
    ...template,
    tags: [{ name: 'category', value: 'security' }],
  });
}

export async function sendPasswordChangedEmail(to: string, userName: string) {
  const template = authEmails.passwordChanged(userName);
  return sendEmail({
    to,
    from: 'security',
    ...template,
    tags: [{ name: 'category', value: 'security' }],
  });
}

export async function sendNewDeviceLoginEmail(
  to: string,
  userName: string,
  deviceInfo: { device: string; location: string; time: string }
) {
  const template = authEmails.newDeviceLogin(userName, deviceInfo);
  return sendEmail({
    to,
    from: 'security',
    ...template,
    tags: [{ name: 'category', value: 'security' }],
  });
}

// ============ TEAM EMAILS ============

export async function sendTeamInvitationEmail(
  to: string,
  inviterName: string,
  teamName: string,
  role: string,
  inviteToken: string
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://chatnil.io'}/compliance/join?token=${inviteToken}`;
  const template = teamEmails.invitation(inviterName, teamName, role, inviteUrl);
  return sendEmail({
    to,
    from: 'team',
    ...template,
    tags: [{ name: 'category', value: 'team' }],
  });
}

export async function sendInvitationAcceptedEmail(
  to: string,
  inviterName: string,
  newMemberName: string,
  newMemberEmail: string
) {
  const template = teamEmails.invitationAccepted(inviterName, newMemberName, newMemberEmail);
  return sendEmail({
    to,
    from: 'team',
    ...template,
    tags: [{ name: 'category', value: 'team' }],
  });
}

export async function sendRoleChangedEmail(
  to: string,
  memberName: string,
  newRole: string,
  changedBy: string
) {
  const template = teamEmails.roleChanged(memberName, newRole, changedBy);
  return sendEmail({
    to,
    from: 'team',
    ...template,
    tags: [{ name: 'category', value: 'team' }],
  });
}

// ============ DEAL EMAILS ============

export async function sendDealSubmittedEmail(
  to: string,
  athleteName: string,
  deal: { id: string; companyName: string; amount: number; type?: string }
) {
  const template = dealEmails.submitted(athleteName, deal);
  return sendEmail({
    to,
    from: 'deals',
    ...template,
    tags: [{ name: 'category', value: 'deals' }],
  });
}

export async function sendDealApprovedEmail(
  to: string,
  athleteName: string,
  deal: { id: string; companyName: string; amount: number },
  notes?: string
) {
  const template = dealEmails.approved(athleteName, deal, notes);
  return sendEmail({
    to,
    from: 'deals',
    ...template,
    tags: [{ name: 'category', value: 'deals' }],
  });
}

export async function sendDealRejectedEmail(
  to: string,
  athleteName: string,
  deal: { id: string; companyName: string; amount: number },
  reason: string
) {
  const template = dealEmails.rejected(athleteName, deal, reason);
  return sendEmail({
    to,
    from: 'deals',
    ...template,
    tags: [{ name: 'category', value: 'deals' }],
  });
}

export async function sendInfoRequestedEmail(
  to: string,
  athleteName: string,
  deal: { id: string; companyName: string; amount: number },
  requestedItems: string[]
) {
  const template = dealEmails.infoRequested(athleteName, deal, requestedItems);
  return sendEmail({
    to,
    from: 'deals',
    ...template,
    tags: [{ name: 'category', value: 'deals' }],
  });
}

export async function sendDealAssignedEmail(
  to: string,
  officerName: string,
  deal: { id: string; companyName: string; amount: number; athleteName: string },
  assignerName: string,
  priority: string
) {
  const template = dealEmails.assigned(officerName, deal, assignerName, priority);
  return sendEmail({
    to,
    from: 'deals',
    ...template,
    tags: [{ name: 'category', value: 'deals' }],
  });
}

export async function sendUrgentDealAlertEmail(
  to: string,
  officerName: string,
  deal: { id: string; companyName: string; amount: number; athleteName: string },
  riskScore: number,
  flags: string[]
) {
  const template = dealEmails.urgentAlert(officerName, deal, riskScore, flags);
  return sendEmail({
    to,
    from: 'deals',
    ...template,
    tags: [{ name: 'category', value: 'urgent' }],
  });
}

// ============ DIGEST EMAILS ============

export async function sendComplianceDailyDigest(
  to: string,
  officerName: string,
  stats: { pending: number; urgent: number; approvedToday: number; rejectedToday: number; avgReviewTime: string },
  topItems: Array<{ athlete: string; company: string; priority: string }>
) {
  const template = digestEmails.complianceDaily(officerName, stats, topItems);
  return sendEmail({
    to,
    from: 'digest',
    ...template,
    tags: [{ name: 'category', value: 'digest' }],
  });
}

export async function sendAthleteWeeklyDigest(
  to: string,
  athleteName: string,
  stats: { activeDeals: number; pendingDeals: number; totalEarnings: number; profileViews: number }
) {
  const template = digestEmails.athleteWeekly(athleteName, stats);
  return sendEmail({
    to,
    from: 'digest',
    ...template,
    tags: [{ name: 'category', value: 'digest' }],
  });
}

// ============ SUPPORT EMAILS ============

export async function sendTicketReceivedEmail(
  to: string,
  userName: string,
  ticketId: string,
  subject: string
) {
  const template = supportEmails.ticketReceived(userName, ticketId, subject);
  return sendEmail({
    to,
    from: 'support',
    replyTo: 'support@chatnil.io',
    ...template,
    tags: [{ name: 'category', value: 'support' }],
  });
}

export async function sendTicketResponseEmail(
  to: string,
  userName: string,
  ticketId: string,
  subject: string,
  response: string
) {
  const template = supportEmails.ticketResponse(userName, ticketId, subject, response);
  return sendEmail({
    to,
    from: 'support',
    replyTo: 'support@chatnil.io',
    ...template,
    tags: [{ name: 'category', value: 'support' }],
  });
}
