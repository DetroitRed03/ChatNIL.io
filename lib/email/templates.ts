/**
 * Email Templates for ChatNIL
 *
 * HTML templates for various email types.
 */

export interface ConversationSummaryData {
  userName: string;
  conversationTitle: string;
  messageCount: number;
  topicsDiscussed: string[];
  keyTakeaways: string[];
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }[];
  exportDate: string;
}

/**
 * Generate HTML for conversation summary email
 */
export function generateConversationSummaryEmail(data: ConversationSummaryData): string {
  const topicsHtml = data.topicsDiscussed.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1F2937; margin-bottom: 8px; font-size: 16px;">Topics Discussed</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
          ${data.topicsDiscussed.map(topic => `<li style="margin-bottom: 4px;">${topic}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const takeawaysHtml = data.keyTakeaways.length > 0
    ? `
      <div style="margin-bottom: 24px; background-color: #FFF7ED; border-left: 4px solid #F97316; padding: 16px; border-radius: 4px;">
        <h3 style="color: #EA580C; margin: 0 0 8px 0; font-size: 16px;">Key Takeaways</h3>
        <ul style="margin: 0; padding-left: 20px; color: #9A3412;">
          ${data.keyTakeaways.map(takeaway => `<li style="margin-bottom: 4px;">${takeaway}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const messagesHtml = data.messages.map(msg => {
    const isUser = msg.role === 'user';
    const bgColor = isUser ? '#FFF7ED' : '#F3F4F6';
    const label = isUser ? 'You' : 'ChatNIL';
    const labelColor = isUser ? '#F97316' : '#6B7280';

    return `
      <div style="margin-bottom: 16px; padding: 12px; background-color: ${bgColor}; border-radius: 8px;">
        <div style="font-size: 12px; font-weight: bold; color: ${labelColor}; margin-bottom: 8px;">
          ${label}
          ${msg.timestamp ? `<span style="font-weight: normal; color: #9CA3AF; margin-left: 8px;">${new Date(msg.timestamp).toLocaleTimeString()}</span>` : ''}
        </div>
        <div style="color: #1F2937; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(msg.content)}</div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChatNIL Conversation Summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #F97316; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">ChatNIL</span>
      </div>
      <h1 style="color: #1F2937; margin: 0; font-size: 24px;">Conversation Summary</h1>
      <p style="color: #6B7280; margin: 8px 0 0 0; font-size: 14px;">
        ${data.conversationTitle}
      </p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Greeting -->
      <p style="color: #1F2937; font-size: 16px; margin-bottom: 24px;">
        Hi ${data.userName},
      </p>
      <p style="color: #4B5563; font-size: 14px; margin-bottom: 24px;">
        Here's a summary of your ChatNIL conversation from ${data.exportDate}.
        This conversation included ${data.messageCount} messages.
      </p>

      ${topicsHtml}
      ${takeawaysHtml}

      <!-- Conversation -->
      <div style="margin-top: 24px;">
        <h3 style="color: #1F2937; margin-bottom: 16px; font-size: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
          Full Conversation
        </h3>
        ${messagesHtml}
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        This email was sent by ChatNIL - Your NIL Education Partner
      </p>
      <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0 0;">
        <a href="https://chatnil.io" style="color: #F97316; text-decoration: none;">Visit ChatNIL</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extract topics from conversation
 */
export function extractTopicsFromConversation(messages: { role: string; content: string }[]): string[] {
  const topics: string[] = [];
  const keywords = {
    'NIL basics': /\b(nil|name image likeness|what is nil)\b/i,
    'Compliance': /\b(compliance|ncaa|rules|regulations|eligibility)\b/i,
    'Contracts': /\b(contract|deal|agreement|sign|negotiate)\b/i,
    'Branding': /\b(brand|personal brand|marketing|social media)\b/i,
    'Taxes': /\b(tax|taxes|1099|income|irs)\b/i,
    'State rules': /\b(state|california|texas|florida|ohio|law)\b/i,
    'Collectives': /\b(collective|booster|donor)\b/i,
    'Opportunities': /\b(opportunity|deal|endorsement|sponsor)\b/i,
  };

  const allContent = messages.map(m => m.content).join(' ');

  for (const [topic, pattern] of Object.entries(keywords)) {
    if (pattern.test(allContent)) {
      topics.push(topic);
    }
  }

  return topics.slice(0, 5); // Limit to 5 topics
}

/**
 * Generate key takeaways from assistant messages
 */
export function generateKeyTakeaways(messages: { role: string; content: string }[]): string[] {
  const takeaways: string[] = [];
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  // Look for key patterns in assistant messages
  for (const msg of assistantMessages) {
    // Look for sentences that start with important indicators
    const sentences = msg.content.split(/[.!?]+/).filter(s => s.trim().length > 20);

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (
        /^(important|key|remember|note|tip|always|never|make sure)/i.test(trimmed) ||
        /\b(you should|you need to|it's important|be sure to)\b/i.test(trimmed)
      ) {
        takeaways.push(trimmed.substring(0, 150) + (trimmed.length > 150 ? '...' : ''));
      }
    }

    if (takeaways.length >= 3) break;
  }

  return takeaways.slice(0, 3);
}
