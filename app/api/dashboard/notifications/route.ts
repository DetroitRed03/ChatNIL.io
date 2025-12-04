import { NextRequest, NextResponse } from 'next/server';
import { getNotifications } from '@/lib/dashboard-data';

export async function GET(request: NextRequest) {
  try {
    console.log('📬 GET /api/dashboard/notifications - Request received');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('✅ User ID:', userId);
    const notifications = await getNotifications(userId);
    console.log('📬 Returning', notifications.length, 'notifications');
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
