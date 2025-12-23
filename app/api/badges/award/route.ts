import { NextRequest, NextResponse } from 'next/server';
import { awardBadge, awardBadgeByName } from '@/lib/badges';
import { trackEventServer } from '@/lib/analytics-server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/badges/award
 * Award a badge to a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, badgeId, badgeName, awardedBy, notes, userRole } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!badgeId && !badgeName) {
      return NextResponse.json(
        { error: 'Badge ID or badge name is required' },
        { status: 400 }
      );
    }

    console.log(`🎖️ Awarding badge to user ${userId}:`, { badgeId, badgeName });

    let userBadge;
    if (badgeName) {
      userBadge = await awardBadgeByName(userId, badgeName, awardedBy, notes);
    } else {
      userBadge = await awardBadge(userId, badgeId, awardedBy, notes);
    }

    if (!userBadge) {
      console.log(`ℹ️ Badge already earned by user ${userId}`);
      return NextResponse.json({
        success: true,
        isNewBadge: false,
        message: 'Badge already earned'
      });
    }

    console.log(`✅ Badge awarded successfully to user ${userId}`);

    // Track badge earned
    if (userRole && userBadge.badge) {
      trackEventServer('badge_earned', {
        user_id: userId,
        role: userRole as any,
        badge_id: userBadge.badge.id,
        badge_name: userBadge.badge.name,
        rarity: userBadge.badge.rarity || 'common',
        points: userBadge.badge.points || 0,
        trigger_action: 'api_award',
      });
    }

    return NextResponse.json({
      success: true,
      isNewBadge: true,
      userBadge,
      badge: userBadge.badge
    });
  } catch (error: any) {
    console.error('❌ Error awarding badge:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to award badge'
      },
      { status: 500 }
    );
  }
}
