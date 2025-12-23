import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('💾 === API ROUTE: UPDATE SOCIAL MEDIA STATS ===');

  try {
    const body = await request.json();
    const { userId, stats } = body;

    console.log('📋 Social stats update request:', { userId, statsCount: stats?.length });

    if (!userId || !stats) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and stats' },
        { status: 400 }
      );
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('❌ Service role client not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Verify user exists in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      console.error('❌ User not found in auth:', authError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User verified in auth system');

    // Delete existing stats for this user
    const { error: deleteError } = await supabaseAdmin
      .from('social_media_stats')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('⚠️ Error deleting existing stats (non-critical):', deleteError);
    }

    // Insert new stats
    const statsToInsert = stats.map((stat: any) => ({
      user_id: userId,
      platform: stat.platform,
      handle: stat.handle,
      followers: stat.followers || 0,
      engagement_rate: stat.engagement_rate || 0,
      verified: stat.verified || false,
      last_updated: new Date().toISOString(),
    }));

    if (statsToInsert.length > 0) {
      const { data: insertedStats, error: insertError } = await supabaseAdmin
        .from('social_media_stats')
        .insert(statsToInsert)
        .select();

      if (insertError) {
        console.error('❌ Failed to insert social stats:', insertError);
        return NextResponse.json(
          {
            error: 'Failed to save social media stats',
            details: insertError.message,
          },
          { status: 500 }
        );
      }

      console.log('✅ Social media stats saved successfully:', {
        userId,
        statsCount: insertedStats?.length,
      });
    } else {
      console.log('ℹ️ No stats to insert (empty array)');
    }

    return NextResponse.json({
      success: true,
      message: 'Social media stats updated successfully',
      stats: statsToInsert,
    });

  } catch (error) {
    console.error('💥 === UNEXPECTED ERROR IN UPDATE SOCIAL STATS ===');
    console.error('🚨 Error details:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
