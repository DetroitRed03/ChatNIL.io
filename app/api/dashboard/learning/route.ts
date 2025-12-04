import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getLearningStats } from '@/lib/dashboard-data';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const learningStats = await getLearningStats(user.id);
    return NextResponse.json(learningStats);
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
