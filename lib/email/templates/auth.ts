import { baseTemplate } from './base';
import { EMAIL_CONFIG } from '../config';

export const authEmails = {
  welcome: (userName: string, role: 'athlete' | 'parent' | 'compliance_officer') => {
    const roleContent = {
      athlete: {
        title: 'Welcome to ChatNIL!',
        message: "You're now set up to manage your NIL opportunities the smart way.",
        cta: 'Complete Your Profile',
        ctaUrl: '/onboarding',
        tips: [
          'Complete your profile to attract brand deals',
          'Connect your social media accounts',
          'Learn about NIL rules in your state',
          'Chat with our AI assistant anytime',
        ],
      },
      parent: {
        title: 'Welcome to ChatNIL!',
        message: "You're set up to help your athlete navigate NIL opportunities safely.",
        cta: 'View Dashboard',
        ctaUrl: '/parent/dashboard',
        tips: [
          "Review your athlete's profile",
          'Set up deal approval requirements',
          'Learn about NIL compliance',
          'Monitor activity and opportunities',
        ],
      },
      compliance_officer: {
        title: 'Welcome to ChatNIL!',
        message: 'Your compliance dashboard is ready to streamline deal reviews.',
        cta: 'Open Dashboard',
        ctaUrl: '/compliance/dashboard',
        tips: [
          'Import your athlete roster',
          'Set up your review team',
          'Configure compliance rules',
          'Enable automated scoring',
        ],
      },
    };

    const content = roleContent[role];

    return {
      subject: content.title,
      html: baseTemplate({
        title: content.title,
        preheader: content.message,
        content: `
          <div class="header">
            <h1>${content.title}</h1>
            <p class="subtitle">${content.message}</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>${content.message}</p>

            <p style="text-align: center;">
              <a href="${EMAIL_CONFIG.appUrl}${content.ctaUrl}" class="button">${content.cta}</a>
            </p>

            <hr class="divider">

            <h3>Quick Start Tips</h3>
            <ul>
              ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>

            <div class="info-box">
              <strong>Need help?</strong> Our AI assistant is available 24/7 to answer your questions.
              Just click the chat icon in the bottom right corner of any page.
            </div>
          </div>
        `,
      }),
    };
  },

  verifyEmail: (userName: string, verificationUrl: string) => ({
    subject: 'Verify your ChatNIL email address',
    html: baseTemplate({
      title: 'Verify Your Email',
      preheader: 'Please verify your email to complete registration',
      content: `
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Thanks for signing up for ChatNIL! Please verify your email address to complete your registration.</p>

          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>

          <div class="info-box">
            <strong>Link not working?</strong> Copy and paste this URL into your browser:<br>
            <span style="word-break: break-all; font-size: 12px;">${verificationUrl}</span>
          </div>
        </div>
      `,
    }),
  }),

  passwordReset: (userName: string, resetUrl: string) => ({
    subject: 'Reset your ChatNIL password',
    html: baseTemplate({
      title: 'Reset Your Password',
      preheader: 'You requested a password reset',
      accentColor: '#6366f1',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>

          <p style="text-align: center;">
            <a href="${resetUrl}" class="button" style="background: #6366f1;">Reset Password</a>
          </p>

          <div class="alert-box" style="border-color: #6366f1; background: #eef2ff;">
            <strong>Security Notice</strong><br>
            This link expires in 1 hour. If you didn't request this reset, please ignore this email or contact support if you're concerned.
          </div>
        </div>
      `,
    }),
  }),

  passwordChanged: (userName: string) => ({
    subject: 'Your ChatNIL password was changed',
    html: baseTemplate({
      title: 'Password Changed',
      preheader: 'Your password was successfully changed',
      accentColor: '#22c55e',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #22c55e, #16a34a);">
          <h1>Password Changed</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Your ChatNIL password was successfully changed.</p>

          <div class="alert-box" style="border-color: #f59e0b; background: #fffbeb;">
            <strong>Wasn't you?</strong><br>
            If you didn't make this change, please <a href="${EMAIL_CONFIG.appUrl}/security/reset">reset your password immediately</a> and contact our support team.
          </div>
        </div>
      `,
    }),
  }),

  newDeviceLogin: (userName: string, deviceInfo: { device: string; location: string; time: string }) => ({
    subject: 'New sign-in to your ChatNIL account',
    html: baseTemplate({
      title: 'New Sign-In Detected',
      preheader: `New sign-in from ${deviceInfo.device}`,
      accentColor: '#6366f1',
      content: `
        <div class="header" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
          <h1>New Sign-In</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>We noticed a new sign-in to your ChatNIL account:</p>

          <div class="info-box">
            <p><strong>Device:</strong> ${deviceInfo.device}</p>
            <p><strong>Location:</strong> ${deviceInfo.location}</p>
            <p><strong>Time:</strong> ${deviceInfo.time}</p>
          </div>

          <p>If this was you, no action is needed.</p>

          <div class="alert-box" style="border-color: #ef4444; background: #fef2f2;">
            <strong>Not you?</strong><br>
            <a href="${EMAIL_CONFIG.appUrl}/security/reset" style="color: #ef4444;">Secure your account now</a>
          </div>
        </div>
      `,
    }),
  }),
};
