import { Resend } from 'resend';
import { EMAIL_CONFIG, EmailSender } from './config';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailSender;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'default',
  replyTo,
  tags,
}: SendEmailParams) {
  if (!resend) {
    console.warn('Resend not configured - RESEND_API_KEY not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.senders[from],
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || stripHtml(html),
      reply_to: replyTo,
      tags,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Email sent: ${subject} to ${to} [${data?.id}]`);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Batch send for multiple recipients with different content
export async function sendBatchEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    from?: EmailSender;
  }>
) {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  return results.map((result, index) => ({
    to: emails[index].to,
    success: result.status === 'fulfilled' && result.value.success,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
