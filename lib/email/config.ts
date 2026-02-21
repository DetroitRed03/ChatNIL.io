export const EMAIL_CONFIG = {
  // Sender addresses for different purposes
  senders: {
    default: 'ChatNIL <notifications@chatnil.io>',
    welcome: 'ChatNIL <welcome@chatnil.io>',
    team: 'ChatNIL Team <team@chatnil.io>',
    deals: 'ChatNIL Deals <deals@chatnil.io>',
    support: 'ChatNIL Support <support@chatnil.io>',
    security: 'ChatNIL Security <security@chatnil.io>',
    digest: 'ChatNIL Digest <digest@chatnil.io>',
  },

  // Reply-to addresses
  replyTo: {
    support: 'support@chatnil.io',
    noReply: 'no-reply@chatnil.io',
  },

  // App URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://chatnil.io',

  // Logo URL for emails
  logoUrl: 'https://chatnil.io/logo.png',
} as const;

export type EmailSender = keyof typeof EMAIL_CONFIG.senders;
