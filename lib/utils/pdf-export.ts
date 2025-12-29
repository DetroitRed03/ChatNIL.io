/**
 * PDF Export Utility for Chat Conversations
 *
 * Exports chat conversations to PDF format for download.
 * Uses jsPDF for client-side generation.
 */

import { jsPDF } from 'jspdf';

export interface ExportMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ConversationExportOptions {
  title?: string;
  userName?: string;
  userRole?: string;
  sessionId?: string;
  includeTimestamps?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
}

const COLORS = {
  primary: '#F97316', // Orange-500
  text: '#1F2937', // Gray-800
  lightGray: '#9CA3AF', // Gray-400
  userBg: '#FFF7ED', // Orange-50
  assistantBg: '#F3F4F6', // Gray-100
};

const FONTS = {
  title: 24,
  subtitle: 12,
  body: 11,
  small: 9,
};

const MARGINS = {
  left: 20,
  right: 20,
  top: 25,
  bottom: 25,
};

/**
 * Export a chat conversation to PDF
 */
export async function exportConversationToPDF(
  messages: ExportMessage[],
  options: ConversationExportOptions = {}
): Promise<Blob> {
  const {
    title = 'ChatNIL Conversation',
    userName = 'User',
    userRole = 'Athlete',
    sessionId,
    includeTimestamps = true,
    includeHeader = true,
    includeFooter = true,
  } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGINS.left - MARGINS.right;

  let yPosition = MARGINS.top;

  // Helper function to add a new page if needed
  const checkNewPage = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - MARGINS.bottom) {
      doc.addPage();
      yPosition = MARGINS.top;
      return true;
    }
    return false;
  };

  // Helper function to add wrapped text
  const addWrappedText = (
    text: string,
    x: number,
    maxWidth: number,
    fontSize: number,
    color: string = COLORS.text
  ): number => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.4;

    for (const line of lines) {
      checkNewPage(lineHeight + 2);
      doc.text(line, x, yPosition);
      yPosition += lineHeight;
    }

    return lines.length * lineHeight;
  };

  // Add header
  if (includeHeader) {
    // ChatNIL Logo/Title
    doc.setFontSize(FONTS.title);
    doc.setTextColor(COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('ChatNIL', MARGINS.left, yPosition);

    // Subtitle
    yPosition += 8;
    doc.setFontSize(FONTS.subtitle);
    doc.setTextColor(COLORS.lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text('NIL Education & Guidance Platform', MARGINS.left, yPosition);

    // Horizontal line
    yPosition += 5;
    doc.setDrawColor(COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(MARGINS.left, yPosition, pageWidth - MARGINS.right, yPosition);

    yPosition += 10;

    // Conversation metadata
    doc.setFontSize(FONTS.small);
    doc.setTextColor(COLORS.lightGray);
    const now = new Date();
    doc.text(`Exported: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, MARGINS.left, yPosition);
    yPosition += 4;
    doc.text(`User: ${userName} (${userRole})`, MARGINS.left, yPosition);
    if (sessionId) {
      yPosition += 4;
      doc.text(`Session: ${sessionId.substring(0, 8)}...`, MARGINS.left, yPosition);
    }

    yPosition += 10;
  }

  // Add conversation title
  doc.setFontSize(FONTS.subtitle + 2);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGINS.left, yPosition);
  yPosition += 8;

  // Add messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isUser = msg.role === 'user';

    // Check if we need a new page (estimate message height)
    const estimatedHeight = Math.max(15, msg.content.length * 0.05);
    checkNewPage(estimatedHeight);

    // Message container
    const containerX = MARGINS.left;
    const containerWidth = contentWidth;

    // Role label
    doc.setFontSize(FONTS.small);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isUser ? COLORS.primary : COLORS.lightGray);
    doc.text(isUser ? 'You' : 'ChatNIL', containerX, yPosition);

    // Timestamp
    if (includeTimestamps && msg.timestamp) {
      const timestamp = new Date(msg.timestamp);
      const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.lightGray);
      doc.text(timeStr, pageWidth - MARGINS.right - 20, yPosition);
    }

    yPosition += 5;

    // Message content
    doc.setFont('helvetica', 'normal');
    addWrappedText(msg.content, containerX + 2, containerWidth - 4, FONTS.body, COLORS.text);

    // Spacing between messages
    yPosition += 6;
  }

  // Add footer
  if (includeFooter) {
    // Go to bottom of page
    const footerY = pageHeight - MARGINS.bottom + 5;

    doc.setFontSize(FONTS.small);
    doc.setTextColor(COLORS.lightGray);
    doc.setFont('helvetica', 'italic');

    // Footer line
    doc.setDrawColor(COLORS.lightGray);
    doc.setLineWidth(0.2);
    doc.line(MARGINS.left, footerY - 5, pageWidth - MARGINS.right, footerY - 5);

    // Footer text
    doc.text(
      'Generated by ChatNIL - Your NIL Education Partner',
      MARGINS.left,
      footerY
    );
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - MARGINS.right - 15,
      footerY
    );
  }

  // Generate blob
  return doc.output('blob');
}

/**
 * Trigger download of the PDF
 */
export function downloadPDF(blob: Blob, filename: string = 'chatnil-conversation.pdf'): void {
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
 * Export and download conversation in one call
 */
export async function exportAndDownloadConversation(
  messages: ExportMessage[],
  options: ConversationExportOptions = {}
): Promise<void> {
  const blob = await exportConversationToPDF(messages, options);

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const filename = `chatnil-conversation-${date}.pdf`;

  downloadPDF(blob, filename);
}
