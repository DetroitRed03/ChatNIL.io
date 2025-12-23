import { createClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch athletes from the agency_athlete_roster view
    const { data: athletes, error } = await supabase
      .from('agency_athlete_roster')
      .select('*')
      .eq('agency_id', user.id)
      .order('total_impressions', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching athletes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ athletes: athletes || [] });
  } catch (error: any) {
    console.error('Unexpected error in athletes endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
