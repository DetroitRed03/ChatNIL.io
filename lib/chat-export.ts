/**
 * Chat Export Utilities
 *
 * Export chat conversations to various formats (JSON, Markdown, TXT)
 */

import { Chat } from './chat-history-store';
import { format as formatDate } from 'date-fns';

export type ExportFormat = 'json' | 'markdown' | 'txt';

interface ExportOptions {
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  prettify?: boolean;
}

/**
 * Export a single chat to JSON format
 */
export function exportChatToJSON(chat: Chat, options: ExportOptions = {}): string {
  const {
    includeMetadata = true,
    prettify = true
  } = options;

  const exportData: any = {
    title: chat.title,
    messages: chat.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }))
  };

  if (includeMetadata) {
    exportData.metadata = {
      chatId: chat.id,
      roleContext: chat.roleContext,
      isPinned: chat.isPinned,
      isArchived: chat.isArchived,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messageCount: chat.messages.length
    };
  }

  return JSON.stringify(exportData, null, prettify ? 2 : 0);
}

/**
 * Export a single chat to Markdown format
 */
export function exportChatToMarkdown(chat: Chat, options: ExportOptions = {}): string {
  const {
    includeMetadata = true,
    includeTimestamps = true
  } = options;

  let markdown = '';

  // Header
  markdown += `# ${chat.title}\n\n`;

  // Metadata section
  if (includeMetadata) {
    markdown += `---\n`;
    markdown += `**Created:** ${formatDate(new Date(chat.createdAt), 'PPpp')}\n`;
    markdown += `**Updated:** ${formatDate(new Date(chat.updatedAt), 'PPpp')}\n`;
    markdown += `**Messages:** ${chat.messages.length}\n`;
    markdown += `**Role Context:** ${chat.roleContext}\n`;
    markdown += `---\n\n`;
  }

  // Messages
  chat.messages.forEach((message, index) => {
    const role = message.role === 'user' ? 'You' : 'ChatNIL';
    const timestamp = includeTimestamps
      ? ` *(${formatDate(new Date(message.timestamp), 'PPpp')})*`
      : '';

    markdown += `## ${role}${timestamp}\n\n`;
    markdown += `${message.content}\n\n`;

    // Add separator between messages (except last)
    if (index < chat.messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
}

/**
 * Export a single chat to plain text format
 */
export function exportChatToText(chat: Chat, options: ExportOptions = {}): string {
  const {
    includeMetadata = true,
    includeTimestamps = true
  } = options;

  let text = '';

  // Header
  text += `${chat.title}\n`;
  text += `${'='.repeat(chat.title.length)}\n\n`;

  // Metadata
  if (includeMetadata) {
    text += `Created: ${formatDate(new Date(chat.createdAt), 'PPpp')}\n`;
    text += `Updated: ${formatDate(new Date(chat.updatedAt), 'PPpp')}\n`;
    text += `Messages: ${chat.messages.length}\n`;
    text += `Role Context: ${chat.roleContext}\n`;
    text += `\n${'='.repeat(50)}\n\n`;
  }

  // Messages
  chat.messages.forEach((message, index) => {
    const role = message.role === 'user' ? 'You' : 'ChatNIL';
    const timestamp = includeTimestamps
      ? ` (${formatDate(new Date(message.timestamp), 'PPpp')})`
      : '';

    text += `[${role}]${timestamp}\n`;
    text += `${message.content}\n\n`;

    // Add separator between messages (except last)
    if (index < chat.messages.length - 1) {
      text += `${'-'.repeat(50)}\n\n`;
    }
  });

  return text;
}

/**
 * Export multiple chats to JSON
 */
export function exportMultipleChatsToJSON(chats: Chat[], options: ExportOptions = {}): string {
  const { prettify = true } = options;

  const exportData = {
    exportedAt: new Date().toISOString(),
    chatCount: chats.length,
    chats: chats.map(chat => JSON.parse(exportChatToJSON(chat, options)))
  };

  return JSON.stringify(exportData, null, prettify ? 2 : 0);
}

/**
 * Export a chat and trigger download
 */
export function downloadChat(chat: Chat, format: ExportFormat, options: ExportOptions = {}) {
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'json':
      content = exportChatToJSON(chat, options);
      mimeType = 'application/json';
      extension = 'json';
      break;
    case 'markdown':
      content = exportChatToMarkdown(chat, options);
      mimeType = 'text/markdown';
      extension = 'md';
      break;
    case 'txt':
      content = exportChatToText(chat, options);
      mimeType = 'text/plain';
      extension = 'txt';
      break;
  }

  // Create sanitized filename
  const sanitizedTitle = chat.title
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
  const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HHmmss');
  const filename = `chatnil_${sanitizedTitle}_${timestamp}.${extension}`;

  // Create blob and download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple chats and trigger download
 */
export function downloadMultipleChats(chats: Chat[], format: ExportFormat, options: ExportOptions = {}) {
  let content: string;
  let mimeType: string;
  let extension: string;

  if (format === 'json') {
    content = exportMultipleChatsToJSON(chats, options);
    mimeType = 'application/json';
    extension = 'json';
  } else {
    // For markdown/txt, combine all chats into one file
    content = chats.map((chat, index) => {
      let chatContent = format === 'markdown'
        ? exportChatToMarkdown(chat, options)
        : exportChatToText(chat, options);

      // Add page break between chats
      if (index < chats.length - 1) {
        chatContent += format === 'markdown'
          ? '\n\n---\n\n\\pagebreak\n\n---\n\n'
          : '\n\n' + '='.repeat(80) + '\n\n';
      }

      return chatContent;
    }).join('');

    mimeType = format === 'markdown' ? 'text/markdown' : 'text/plain';
    extension = format === 'markdown' ? 'md' : 'txt';
  }

  // Create filename
  const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HHmmss');
  const filename = `chatnil_export_${chats.length}chats_${timestamp}.${extension}`;

  // Create blob and download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy chat to clipboard
 */
export async function copyChatToClipboard(chat: Chat, format: ExportFormat, options: ExportOptions = {}): Promise<boolean> {
  let content: string;

  switch (format) {
    case 'json':
      content = exportChatToJSON(chat, options);
      break;
    case 'markdown':
      content = exportChatToMarkdown(chat, options);
      break;
    case 'txt':
      content = exportChatToText(chat, options);
      break;
  }

  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share chat (uses Web Share API if available)
 */
export async function shareChat(chat: Chat, format: ExportFormat, options: ExportOptions = {}): Promise<boolean> {
  if (!navigator.share) {
    // Fallback to copy to clipboard
    return copyChatToClipboard(chat, format, options);
  }

  let content: string;
  let title = `${chat.title} - ChatNIL Export`;

  switch (format) {
    case 'json':
      content = exportChatToJSON(chat, options);
      break;
    case 'markdown':
      content = exportChatToMarkdown(chat, options);
      break;
    case 'txt':
      content = exportChatToText(chat, options);
      break;
  }

  try {
    await navigator.share({
      title,
      text: content
    });
    return true;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}
