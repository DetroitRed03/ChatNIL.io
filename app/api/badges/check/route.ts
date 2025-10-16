import { NextRequest, NextResponse } from 'next/server';
import { checkAndAwardBadgeForActionServer } from '@/lib/badges-server';

/**
 * POST /api/badges/check
 * Check and automatically award badges based on user actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const validActions = ['onboarding_complete', 'first_message', 'first_quiz', 'profile_complete'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking badge eligibility for user ${userId}, action: ${action}`);

    const userBadge = await checkAndAwardBadgeForActionServer(userId, action);

    if (!userBadge) {
      console.log(`ℹ️ No new badge awarded for action: ${action}`);
      return NextResponse.json({
        success: true,
        awardedBadge: null,
        message: 'No badge awarded (already earned or criteria not met)'
      });
    }

    console.log(`🎉 Badge awarded for action ${action}:`, userBadge.badge);

    return NextResponse.json({
      success: true,
      awardedBadge: userBadge,
      badge: userBadge.badge,
      message: 'Badge awarded successfully!'
    });
  } catch (error: any) {
    console.error('❌ Error checking/awarding badge:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check badge eligibility'
      },
      { status: 500 }
    );
  }
}
