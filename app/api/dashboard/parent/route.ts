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

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Check for Authorization header (Bearer token from localStorage)
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

    // Try to get user from cookies first
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    // If no user from cookies and Bearer token is provided, try using the token
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

    // Get parent profile using admin client to bypass RLS
    const { data: parentProfile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Check if user is a parent
    if (parentProfile?.role !== 'parent') {
      return NextResponse.json({ error: 'Access denied. This dashboard is for parents only.' }, { status: 403 });
    }

    // Get linked children from parent_child_relationships table
    const { data: relationships } = await supabaseAdmin
      .from('parent_child_relationships')
      .select('child_id, consent_status, created_at')
      .eq('parent_id', user.id);

    // If no relationships found, try the parent_athlete_relationships table
    let childRelationships = relationships || [];
    if (childRelationships.length === 0) {
      const { data: athleteRelationships } = await supabaseAdmin
        .from('parent_athlete_relationships')
        .select('athlete_id, verified, created_at')
        .eq('parent_id', user.id);

      if (athleteRelationships) {
        childRelationships = athleteRelationships.map(r => ({
          child_id: r.athlete_id,
          consent_status: r.verified ? 'approved' : 'pending',
          created_at: r.created_at,
        }));
      }
    }

    // Get children's profiles and progress
    const childrenData = await Promise.all(
      childRelationships.map(async (rel) => {
        const childId = rel.child_id;

        // Get child profile
        const { data: childProfile } = await supabaseAdmin
          .from('athlete_profiles')
          .select('*')
          .eq('id', childId)
          .single();

        if (!childProfile) return null;

        // Get discovery progress
        const { data: conversationFlow } = await supabaseAdmin
          .from('conversation_flows')
          .select('*')
          .eq('user_id', childId)
          .single();

        // Get unlocked chapters
        const { data: chapters } = await supabaseAdmin
          .from('chapter_unlocks')
          .select('chapter_name')
          .eq('user_id', childId);

        const unlockedChapters = chapters?.map(c => c.chapter_name) || [];

        // Calculate badges (simplified)
        const badgesEarned = unlockedChapters.length;

        // Get streak
        const streak = childProfile.streak_count || 0;

        // Calculate completion percentage
        const totalPillars = 4;
        const completionPercentage = Math.round((unlockedChapters.length / totalPillars) * 100);

        // Determine current chapter
        const currentChapter = conversationFlow?.current_pillar
          ? conversationFlow.current_pillar.charAt(0).toUpperCase() + conversationFlow.current_pillar.slice(1)
          : 'Identity';

        return {
          id: childId,
          fullName: childProfile.full_name || 'Student',
          school: childProfile.school_name || 'High School',
          sport: childProfile.sport || 'Not set',
          state: childProfile.primary_state || 'CA',
          avatar: childProfile.avatar_url,
          progress: {
            percentage: completionPercentage,
            currentChapter,
            badgesEarned,
            currentStreak: streak,
            lastActive: conversationFlow?.last_interaction_at || childProfile.updated_at || new Date().toISOString(),
          },
          consent: {
            status: (rel.consent_status || childProfile.consent_status || 'pending') as 'pending' | 'approved' | 'denied' | 'revoked',
            grantedAt: rel.created_at,
          },
        };
      })
    );

    // Filter out null entries
    const children = childrenData.filter(Boolean);

    // Generate activity feed based on children's progress
    const activities: Array<{
      id: string;
      type: 'quiz_completed' | 'badge_earned' | 'chapter_started' | 'consent_approved' | 'login';
      message: string;
      childName: string;
      timestamp: string;
    }> = [];

    // Add sample activities based on children's data
    children.forEach((child, index) => {
      if (child) {
        if (child.progress.badgesEarned > 0) {
          activities.push({
            id: `badge-${child.id}`,
            type: 'badge_earned',
            message: `${child.fullName} earned a new badge!`,
            childName: child.fullName,
            timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        if (child.progress.currentChapter) {
          activities.push({
            id: `chapter-${child.id}`,
            type: 'chapter_started',
            message: `${child.fullName} started the ${child.progress.currentChapter} chapter`,
            childName: child.fullName,
            timestamp: new Date(Date.now() - (index + 1) * 48 * 60 * 60 * 1000).toISOString(),
          });
        }

        if (child.consent.status === 'approved') {
          activities.push({
            id: `consent-${child.id}`,
            type: 'consent_approved',
            message: `You approved ${child.fullName}'s participation`,
            childName: child.fullName,
            timestamp: child.consent.grantedAt || new Date().toISOString(),
          });
        }
      }
    });

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get notification preferences (would come from database in production)
    const notifications = {
      weeklyProgress: true,
      chapterComplete: true,
      badgeEarned: true,
      dailyDigest: false,
    };

    const dashboardData = {
      parent: {
        id: user.id,
        fullName: parentProfile?.full_name || user.email?.split('@')[0] || 'Parent',
        email: user.email || '',
      },
      children,
      activities: activities.slice(0, 10), // Limit to 10 most recent
      notifications,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error loading parent dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
