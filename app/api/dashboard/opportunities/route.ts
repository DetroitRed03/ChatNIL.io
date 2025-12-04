import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getMatchedOpportunities } from '@/lib/dashboard-data';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const opportunities = await getMatchedOpportunities(user.id);
    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
