import { baseTemplate } from './base';
import { EMAIL_CONFIG } from '../config';

export const supportEmails = {
  ticketReceived: (userName: string, ticketId: string, subject: string) => ({
    subject: `Support ticket received: ${subject}`,
    html: baseTemplate({
      title: 'Support Ticket Received',
      preheader: "We've received your support request",
      content: `
        <div class="header">
          <h1>Ticket Received</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>We've received your support request and our team will respond as soon as possible.</p>

          <div class="info-box">
            <p><strong>Ticket ID:</strong> #${ticketId}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>

          <p>You'll receive an email notification when we respond. In the meantime:</p>
          <ul>
            <li>Check our <a href="${EMAIL_CONFIG.appUrl}/help">Help Center</a> for quick answers</li>
            <li>Chat with our AI assistant for immediate help</li>
          </ul>

          <p style="color: #6b7280; font-size: 14px;">
            Average response time: 4-8 hours during business days
          </p>
        </div>
      `,
    }),
  }),

  ticketResponse: (userName: string, ticketId: string, subject: string, response: string) => ({
    subject: `Re: ${subject} [#${ticketId}]`,
    html: baseTemplate({
      title: 'Support Response',
      preheader: "We've responded to your support ticket",
      content: `
        <div class="header">
          <h1>New Response</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>We've responded to your support ticket:</p>

          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f97316;">
            ${response}
          </div>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/support/tickets/${ticketId}" class="button">View Full Conversation</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            Reply to this email to continue the conversation.
          </p>
        </div>
      `,
    }),
  }),

  ticketResolved: (userName: string, ticketId: string, subject: string) => ({
    subject: `Resolved: ${subject} [#${ticketId}]`,
    html: baseTemplate({
      title: 'Ticket Resolved',
      preheader: 'Your support ticket has been resolved',
      accentColor: '#22c55e',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
          <h1>Ticket Resolved</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Your support ticket <strong>#${ticketId}</strong> has been marked as resolved.</p>

          <p style="text-align: center;">
            <a href="${EMAIL_CONFIG.appUrl}/support/tickets/${ticketId}/feedback" class="button" style="background: #22c55e;">Rate Your Experience</a>
          </p>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Need more help? <a href="${EMAIL_CONFIG.appUrl}/support/tickets/${ticketId}/reopen">Reopen this ticket</a>
          </p>
        </div>
      `,
    }),
  }),
};
