/**
 * Email Summary API
 *
 * Sends conversation summaries via email.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';
import {
  generateConversationSummaryEmail,
  extractTopicsFromConversation,
  generateKeyTakeaways,
  type ConversationSummaryData
} from '@/lib/email/templates';

interface EmailSummaryRequest {
  to: string;
  userName: string;
  conversationTitle: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailSummaryRequest = await request.json();
    const { to, userName, conversationTitle, messages } = body;

    // Validate input
    if (!to || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: email and messages required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Extract topics and takeaways
    const topicsDiscussed = extractTopicsFromConversation(messages);
    const keyTakeaways = generateKeyTakeaways(messages);

    // Prepare email data
    const summaryData: ConversationSummaryData = {
      userName: userName || 'Athlete',
      conversationTitle: conversationTitle || 'ChatNIL Conversation',
      messageCount: messages.length,
      topicsDiscussed,
      keyTakeaways,
      messages,
      exportDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    // Generate email HTML
    const html = generateConversationSummaryEmail(summaryData);

    // Send email
    const result = await sendEmail({
      to,
      subject: `ChatNIL Summary: ${conversationTitle}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Email summary sent:', {
      to,
      messageCount: messages.length,
      topicsCount: topicsDiscussed.length,
      emailId: result.id,
    });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      topicsDiscussed,
      keyTakeaways,
    });
  } catch (error: any) {
    console.error('Email summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'Email Summary API Ready',
    configured: !!process.env.RESEND_API_KEY,
  });
}
