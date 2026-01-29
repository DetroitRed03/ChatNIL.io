import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PillarType, PILLARS, PILLAR_ORDER } from '@/lib/discovery/questions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pillar } = body as { pillar: PillarType };

    if (!pillar || !PILLAR_ORDER.includes(pillar)) {
      return NextResponse.json({ error: 'Invalid pillar' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already unlocked (using chapter_name instead of chapter_id)
    const { data: existing } = await supabase
      .from('chapter_unlocks')
      .select('id')
      .eq('user_id', user.id)
      .eq('chapter_name', pillar)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Chapter already unlocked',
        alreadyUnlocked: true,
      });
    }

    // Unlock the chapter (using actual schema column names)
    const { error: insertError } = await supabase
      .from('chapter_unlocks')
      .insert({
        user_id: user.id,
        chapter_name: pillar,
        unlocked_via: 'progression',
        unlocked_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error unlocking chapter:', insertError);
      return NextResponse.json({ error: 'Failed to unlock chapter' }, { status: 500 });
    }

    // Get all unlocked chapters
    const { data: chapters } = await supabase
      .from('chapter_unlocks')
      .select('chapter_name')
      .eq('user_id', user.id);

    const unlockedChapters = chapters?.map(c => c.chapter_name as PillarType) || [];

    // Check if all chapters are unlocked
    const isComplete = unlockedChapters.length === 4;

    // Update athlete profile if complete
    if (isComplete) {
      await supabase
        .from('athlete_profiles')
        .update({
          discovery_completed: true,
          discovery_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      chapter: pillar,
      chapterName: PILLARS[pillar].chapterTitle,
      unlockedChapters,
      isComplete,
    });
  } catch (error) {
    console.error('Error unlocking chapter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
