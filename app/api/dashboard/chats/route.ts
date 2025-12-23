import { NextResponse } from 'next/server';
import { getRecentChats } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Parse userId from query params (consistent with other dashboard APIs)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - userId required' }, { status: 401 });
    }

    const recentChats = await getRecentChats(userId);
    return NextResponse.json({ chats: recentChats });
  } catch (error) {
    console.error('Error fetching recent chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
