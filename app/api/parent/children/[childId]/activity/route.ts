import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET - Fetch activity feed for a specific child
 * Parents can only view activity for their linked children
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);

    // Pagination params
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Optional filter by activity type

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

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

    // Get authenticated user
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) {
        user = tokenUser;
        authError = null;
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parent profile
    const { data: parentProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!parentProfile || parentProfile.role !== 'parent') {
      return NextResponse.json({ error: 'Not a parent account' }, { status: 403 });
    }

    // Verify parent-child relationship
    const { data: consentInvite } = await supabaseAdmin
      .from('parent_consent_invites')
      .select('*')
      .eq('parent_email', parentProfile.email)
      .eq('student_id', childId)
      .eq('status', 'approved')
      .single();

    const { data: relationship } = await supabaseAdmin
      .from('parent_child_relationships')
      .select('*')
      .eq('parent_id', user.id)
      .eq('child_id', childId)
      .single();

    if (!consentInvite && !relationship) {
      return NextResponse.json({ error: 'Not authorized to view this child' }, { status: 403 });
    }

    // Get child user data
    const { data: childUser } = await supabaseAdmin
      .from('users')
      .select('id, full_name, first_name, email')
      .eq('id', childId)
      .single();

    if (!childUser) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Build activity query
    let query = supabaseAdmin
      .from('activity_log')
      .select('*', { count: 'exact' })
      .eq('user_id', childId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by type if specified
    if (type) {
      query = query.eq('type', type);
    }

    const { data: activities, count, error: activityError } = await query;

    if (activityError) {
      console.error('Error fetching activities:', activityError);
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    // Get child's name for display
    const childName = childUser.full_name || childUser.first_name || 'Student';

    // Format activities
    const formattedActivities = (activities || []).map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description || '',
      metadata: a.metadata || {},
      timestamp: a.created_at,
      // Add human-readable time
      timeAgo: formatTimeAgo(new Date(a.created_at))
    }));

    // If no activities, generate some based on recent progress
    if (formattedActivities.length === 0) {
      const { data: recentProgress } = await supabaseAdmin
        .from('chapter_progress')
        .select('*')
        .eq('user_id', childId)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (recentProgress && recentProgress.length > 0) {
        for (const progress of recentProgress) {
          formattedActivities.push({
            id: `progress-${progress.pillar}`,
            type: 'chapter_progress',
            title: `Made progress in ${progress.pillar.charAt(0).toUpperCase() + progress.pillar.slice(1)}`,
            description: `${progress.questions_completed || 0} of 5 questions completed`,
            metadata: { pillar: progress.pillar, questionsCompleted: progress.questions_completed },
            timestamp: progress.updated_at,
            timeAgo: formatTimeAgo(new Date(progress.updated_at))
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      childId,
      childName,
      activities: formattedActivities,
      pagination: {
        total: count || formattedActivities.length,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Error fetching child activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Format a date as a human-readable time ago string
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
