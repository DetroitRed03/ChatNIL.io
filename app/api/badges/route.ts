import { NextRequest, NextResponse } from 'next/server';
import { getBadgesWithStatus, getBadgeStats } from '@/lib/badges';

export const dynamic = 'force-dynamic';

/**
 * GET /api/badges
 * Fetch all badges with earned status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`📛 Fetching badges for user: ${userId}`);

    const [badges, stats] = await Promise.all([
      getBadgesWithStatus(userId),
      getBadgeStats(userId)
    ]);

    console.log(`✅ Fetched ${badges.length} badges, ${stats.earnedCount} earned`);

    return NextResponse.json({
      success: true,
      badges,
      stats
    });
  } catch (error: any) {
    console.error('❌ Error fetching badges:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch badges'
      },
      { status: 500 }
    );
  }
}
