import { baseTemplate } from './base';
import { EMAIL_CONFIG } from '../config';

interface DealInfo {
  id: string;
  companyName: string;
  amount: number;
  type?: string;
  athleteName?: string;
}

export const dealEmails = {
  submitted: (athleteName: string, deal: DealInfo) => ({
    subject: `Deal submitted: ${deal.companyName}`,
    html: baseTemplate({
      title: 'Deal Submitted',
      preheader: `Your ${deal.companyName} deal is under review`,
      content: `
        <div class="header">
          <h1>Deal Submitted</h1>
        </div>
        <div class="content">
          <p>Hi ${athleteName},</p>
          <p>Your NIL deal has been submitted for compliance review.</p>

          <div class="info-box">
            <p><strong>Company:</strong> ${deal.companyName}</p>
            <p><strong>Amount:</strong> $${deal.amount.toLocaleString()}</p>
            ${deal.type ? `<p><strong>Type:</strong> ${deal.type}</p>` : ''}
          </div>

          <p>You'll receive an email once your compliance office has reviewed the deal. This typically takes 1-3 business days.</p>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/deals/${deal.id}" class="button">View Deal Status</a>
          </p>
        </div>
      `,
    }),
  }),

  approved: (athleteName: string, deal: DealInfo, notes?: string) => ({
    subject: `Deal approved: ${deal.companyName}`,
    html: baseTemplate({
      title: 'Deal Approved!',
      preheader: `Great news! Your ${deal.companyName} deal is approved`,
      accentColor: '#22c55e',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
          <h1>Deal Approved!</h1>
        </div>
        <div class="content">
          <p>Hi ${athleteName},</p>
          <p>Great news! Your NIL deal has been approved by the compliance office.</p>

          <div class="info-box">
            <p><strong>Company:</strong> ${deal.companyName}</p>
            <p><strong>Amount:</strong> $${deal.amount.toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="badge badge-success">Approved</span></p>
          </div>

          ${notes ? `
            <div class="alert-box" style="border-color: #22c55e; background: #f0fdf4;">
              <strong>Note from Compliance:</strong><br>
              ${notes}
            </div>
          ` : ''}

          <p>You're all set to proceed with this partnership!</p>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/deals/${deal.id}" class="button" style="background: #22c55e;">View Deal</a>
          </p>
        </div>
      `,
    }),
  }),

  rejected: (athleteName: string, deal: DealInfo, reason: string) => ({
    subject: `Deal update: ${deal.companyName}`,
    html: baseTemplate({
      title: 'Deal Not Approved',
      preheader: `Your ${deal.companyName} deal requires attention`,
      accentColor: '#ef4444',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
          <h1>Deal Not Approved</h1>
        </div>
        <div class="content">
          <p>Hi ${athleteName},</p>
          <p>Your NIL deal with <strong>${deal.companyName}</strong> was not approved by the compliance office.</p>

          <div class="alert-box" style="border-color: #ef4444; background: #fef2f2;">
            <strong>Reason:</strong><br>
            ${reason}
          </div>

          <h3>What You Can Do</h3>
          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/deals/${deal.id}/appeal" class="button" style="background: #6366f1;">Appeal Decision</a>
            <a href="${EMAIL_CONFIG.appUrl}/deals/${deal.id}/modify" class="button button-secondary">Modify &amp; Resubmit</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            Have questions? Contact your compliance office or chat with our AI assistant for guidance.
          </p>
        </div>
      `,
    }),
  }),

  infoRequested: (athleteName: string, deal: DealInfo, requestedItems: string[]) => ({
    subject: `Action needed: ${deal.companyName} deal`,
    html: baseTemplate({
      title: 'Information Needed',
      preheader: 'Please provide additional information for your deal',
      accentColor: '#f59e0b',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
          <h1>Information Needed</h1>
        </div>
        <div class="content">
          <p>Hi ${athleteName},</p>
          <p>The compliance office needs additional information to review your deal with <strong>${deal.companyName}</strong>.</p>

          <div class="info-box">
            <strong>Please provide:</strong>
            <ul>
              ${requestedItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/deals/${deal.id}/respond" class="button" style="background: #f59e0b;">Submit Information</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            Please respond within 7 days to avoid delays in processing your deal.
          </p>
        </div>
      `,
    }),
  }),

  assigned: (officerName: string, deal: DealInfo, assignerName: string, priority: string) => ({
    subject: `New deal assigned: ${deal.athleteName} - ${deal.companyName}`,
    html: baseTemplate({
      title: 'Deal Assigned to You',
      preheader: `${assignerName} assigned you a deal to review`,
      content: `
        <div class="header">
          <h1>New Assignment</h1>
        </div>
        <div class="content">
          <p>Hi ${officerName},</p>
          <p><strong>${assignerName}</strong> has assigned you a deal to review.</p>

          <div class="info-box">
            <p><strong>Athlete:</strong> ${deal.athleteName}</p>
            <p><strong>Company:</strong> ${deal.companyName}</p>
            <p><strong>Amount:</strong> $${deal.amount.toLocaleString()}</p>
            <p><strong>Priority:</strong> <span class="badge ${
              priority === 'urgent' ? 'badge-danger' :
              priority === 'high' ? 'badge-warning' : 'badge-info'
            }">${priority.toUpperCase()}</span></p>
          </div>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/compliance/deals/${deal.id}/review" class="button">Review Deal</a>
          </p>
        </div>
      `,
    }),
  }),

  urgentAlert: (officerName: string, deal: DealInfo, riskScore: number, flags: string[]) => ({
    subject: 'URGENT: High-risk deal requires immediate review',
    html: baseTemplate({
      title: 'Urgent Review Required',
      preheader: `Critical deal flagged with ${riskScore} risk score`,
      accentColor: '#ef4444',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
          <h1>URGENT REVIEW</h1>
        </div>
        <div class="content">
          <p>Hi ${officerName},</p>
          <p>A high-risk deal has been flagged and requires your immediate attention.</p>

          <div style="text-align: center; margin: 20px 0;">
            <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background: #fef2f2; border: 4px solid #ef4444; line-height: 72px; font-size: 28px; font-weight: bold; color: #ef4444;">
              ${riskScore}
            </div>
            <p style="color: #ef4444; font-weight: 600;">Risk Score</p>
          </div>

          <div class="info-box">
            <p><strong>Athlete:</strong> ${deal.athleteName}</p>
            <p><strong>Company:</strong> ${deal.companyName}</p>
            <p><strong>Amount:</strong> $${deal.amount.toLocaleString()}</p>
          </div>

          <div class="alert-box" style="border-color: #ef4444; background: #fef2f2;">
            <strong>AI Flags:</strong>
            <ul style="margin: 8px 0 0 0;">
              ${flags.map(flag => `<li>${flag}</li>`).join('')}
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/compliance/deals/${deal.id}/review" class="button" style="background: #ef4444;">Review Now</a>
          </p>
        </div>
      `,
    }),
  }),
};
