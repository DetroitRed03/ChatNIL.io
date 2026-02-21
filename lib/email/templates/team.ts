import { baseTemplate } from './base';
import { EMAIL_CONFIG } from '../config';

export const teamEmails = {
  invitation: (inviterName: string, teamName: string, role: string, inviteUrl: string) => ({
    subject: `${inviterName} invited you to join ${teamName} on ChatNIL`,
    html: baseTemplate({
      title: 'Team Invitation',
      preheader: 'Join the compliance team on ChatNIL',
      content: `
        <div class="header">
          <h1>You're Invited!</h1>
          <p class="subtitle">Join the ${teamName} compliance team</p>
        </div>
        <div class="content">
          <p><strong>${inviterName}</strong> has invited you to join their compliance team on ChatNIL.</p>

          <div class="info-box">
            <p><strong>Team:</strong> ${teamName}</p>
            <p><strong>Your Role:</strong> ${role}</p>
          </div>

          <p>As a team member, you'll be able to:</p>
          <ul>
            <li>Review and approve athlete NIL deals</li>
            <li>Access AI-powered compliance scoring</li>
            <li>Collaborate with your team in real-time</li>
            <li>Generate audit-ready reports</li>
          </ul>

          <p style="text-align: center;">
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
          </p>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This invitation expires in 7 days
          </p>
        </div>
      `,
      footerText: 'You received this because someone invited you to ChatNIL.',
    }),
  }),

  invitationAccepted: (inviterName: string, newMemberName: string, newMemberEmail: string) => ({
    subject: `${newMemberName} joined your compliance team`,
    html: baseTemplate({
      title: 'New Team Member',
      preheader: `${newMemberName} accepted your invitation`,
      accentColor: '#22c55e',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
          <h1>New Team Member!</h1>
        </div>
        <div class="content">
          <p>Hi ${inviterName},</p>
          <p>Great news! <strong>${newMemberName}</strong> (${newMemberEmail}) has accepted your invitation and joined the team.</p>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/compliance/team" class="button" style="background: #22c55e;">View Team</a>
          </p>
        </div>
      `,
    }),
  }),

  roleChanged: (memberName: string, newRole: string, changedBy: string) => ({
    subject: 'Your role has been updated on ChatNIL',
    html: baseTemplate({
      title: 'Role Updated',
      preheader: `Your role is now ${newRole}`,
      content: `
        <div class="header">
          <h1>Role Updated</h1>
        </div>
        <div class="content">
          <p>Hi ${memberName},</p>
          <p>Your role on the compliance team has been updated by ${changedBy}.</p>

          <div class="info-box">
            <p><strong>New Role:</strong> <span class="badge badge-info">${newRole}</span></p>
          </div>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/compliance/dashboard" class="button">Go to Dashboard</a>
          </p>
        </div>
      `,
    }),
  }),

  removedFromTeam: (memberName: string, teamName: string) => ({
    subject: `You've been removed from ${teamName}`,
    html: baseTemplate({
      title: 'Team Membership Ended',
      preheader: `Your access to ${teamName} has been revoked`,
      accentColor: '#6b7280',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #6b7280, #4b5563);">
          <h1>Team Access Ended</h1>
        </div>
        <div class="content">
          <p>Hi ${memberName},</p>
          <p>Your membership in the <strong>${teamName}</strong> compliance team has ended.</p>
          <p>You no longer have access to the team's deals, athletes, or dashboard.</p>

          <p style="color: #6b7280;">
            If you believe this was a mistake, please contact your team administrator.
          </p>
        </div>
      `,
    }),
  }),
};
