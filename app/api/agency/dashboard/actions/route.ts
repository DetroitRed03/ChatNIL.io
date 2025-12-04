import { createClient } from '@/lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch pending actions
    const { data: actions, error } = await supabase
      .from('agency_pending_actions')
      .select('*')
      .eq('agency_id', user.id)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching pending actions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pending_actions: actions || [] });
  } catch (error: any) {
    console.error('Unexpected error in actions endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
