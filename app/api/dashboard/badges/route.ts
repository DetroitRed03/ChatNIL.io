import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getBadgeProgress } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badgeProgress = await getBadgeProgress(user.id);
    return NextResponse.json(badgeProgress);
  } catch (error) {
    console.error('Error fetching badge progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
