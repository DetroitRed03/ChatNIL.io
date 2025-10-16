import { NextRequest, NextResponse } from 'next/server';
import { getQuizCategories } from '@/lib/quiz';

/**
 * GET /api/quizzes
 * Fetch all quiz categories with statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log(`📚 Fetching quiz categories${userId ? ` for user ${userId}` : ''}`);

    const categories = await getQuizCategories(userId || undefined);

    console.log(`✅ Fetched ${categories.length} quiz categories`);

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error: any) {
    console.error('❌ Error fetching quiz categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch quiz categories'
      },
      { status: 500 }
    );
  }
}
