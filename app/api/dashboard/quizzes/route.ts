import { NextResponse } from 'next/server';
import { getQuizProgress } from '@/lib/dashboard-data';

export async function GET(request: Request) {
  try {
    // Parse userId from query params (consistent with other dashboard APIs)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - userId required' }, { status: 401 });
    }

    const quizProgress = await getQuizProgress(userId);
    return NextResponse.json(quizProgress);
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
