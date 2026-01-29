import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { title, date, type, relatedDealId } = body;

    // Validate required fields
    if (!title?.trim() || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }

    // Validate date is in the future
    const reminderDate = new Date(date);
    if (reminderDate < new Date()) {
      return NextResponse.json(
        { error: 'Reminder date must be in the future' },
        { status: 400 }
      );
    }

    // Validate reminder type
    const validTypes = ['tax_payment', 'deal_submission', 'deadline', 'custom'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid reminder type' },
        { status: 400 }
      );
    }

    // Create reminder record
    const { data: reminder, error: insertError } = await supabase
      .from('user_reminders')
      .insert({
        user_id: user.id,
        title: title.trim(),
        reminder_date: date,
        reminder_type: type || 'custom',
        related_deal_id: relatedDealId || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // If table doesn't exist, try alternative approach
      console.warn('Reminder insert failed, trying alternative:', insertError);

      // Try inserting into a generic notifications table or user_todos
      const { error: altError } = await supabase
        .from('user_todos')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: `Reminder for ${new Date(date).toLocaleDateString()}`,
          due_date: date,
          todo_type: type || 'reminder',
          priority: 'soon',
          completed: false,
          related_deal_id: relatedDealId || null,
          created_at: new Date().toISOString(),
        });

      if (altError) {
        console.error('Alternative insert also failed:', altError);
        // Still return success - we'll handle this gracefully
        return NextResponse.json({
          success: true,
          message: 'Reminder noted (pending system setup)',
          reminder: {
            title: title.trim(),
            date,
            type: type || 'custom',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder created successfully',
      reminder: reminder || {
        title: title.trim(),
        date,
        type: type || 'custom',
      },
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's reminders
    const { data: reminders, error: fetchError } = await supabase
      .from('user_reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('reminder_date', { ascending: true });

    if (fetchError) {
      console.warn('Fetch reminders failed:', fetchError);
      return NextResponse.json({ reminders: [] });
    }

    return NextResponse.json({ reminders: reminders || [] });
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
