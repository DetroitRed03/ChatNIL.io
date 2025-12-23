import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getActiveDeals } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deals = await getActiveDeals(user.id);
    return NextResponse.json({ deals });
  } catch (error) {
    console.error('Error fetching active deals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
