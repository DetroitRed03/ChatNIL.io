import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ todoId: string }> }
) {
  try {
    const { todoId } = await params;

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

    // Try to update in user_todos table
    const { data: todo, error: todoError } = await supabase
      .from('user_todos')
      .select('id, user_id')
      .eq('id', todoId)
      .single();

    if (todo) {
      // Verify ownership
      if (todo.user_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Update the todo
      const { error: updateError } = await supabase
        .from('user_todos')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', todoId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to dismiss todo' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Todo dismissed successfully',
      });
    }

    // If not found in user_todos, try athlete_todos
    const { data: athleteTodo, error: athleteTodoError } = await supabase
      .from('athlete_todos')
      .select('id, athlete_id, athlete:athlete_profiles(user_id)')
      .eq('id', todoId)
      .single();

    if (athleteTodo) {
      const athlete = athleteTodo.athlete as any;
      if (athlete?.user_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const { error: updateError } = await supabase
        .from('athlete_todos')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', todoId);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to dismiss todo' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Todo dismissed successfully',
      });
    }

    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  } catch (error) {
    console.error('Dismiss todo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
