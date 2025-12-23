import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingEvents } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📅 GET /api/dashboard/events - Request received');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('✅ User ID:', userId);
    const events = await getUpcomingEvents(userId);
    console.log('📅 Returning', events.length, 'events');
    return NextResponse.json({ events });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
