import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/feedback
 * Store user feedback for AI messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, messageId, feedback, sessionId, timestamp } = body;

    if (!userId || !messageId || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📊 Feedback received:', {
      userId,
      messageId,
      feedback,
      sessionId,
      timestamp
    });

    // In a production app, you would store this in a database
    // For now, we're just logging it and relying on PostHog analytics
    // If you want to store it, create a feedback table and insert here

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded'
    });
  } catch (error: any) {
    console.error('❌ Error recording feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to record feedback'
      },
      { status: 500 }
    );
  }
}
