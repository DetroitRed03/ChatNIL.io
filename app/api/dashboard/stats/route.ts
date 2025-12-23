import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getQuickStats } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getQuickStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
