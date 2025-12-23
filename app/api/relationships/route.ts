import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Server-side service role client (secure)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'chatnil-admin-api'
    }
  }
});
}

// Create a new relationship
export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    console.log('🔗 === API ROUTE: CREATE RELATIONSHIP ===');

    const body = await request.json();
    const { type, parentId, coachId, athleteId, relationshipType, permissions, teamRole, sport, season } = body;

    console.log('📋 Relationship creation request:', {
      type,
      parentId,
      coachId,
      athleteId,
      relationshipType
    });

    // Validate required fields
    if (!type || !athleteId || (type === 'parent' && !parentId) || (type === 'coach' && !coachId)) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields for relationship creation' },
        { status: 400 }
      );
    }

    let relationshipData;
    let result;

    if (type === 'parent') {
      // Verify parent and athlete exist and have correct roles
      const { data: parentUser, error: parentError } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('id', parentId)
        .eq('role', 'parent')
        .single();

      const { data: athleteUser, error: athleteError } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('id', athleteId)
        .eq('role', 'athlete')
        .single();

      if (parentError || !parentUser || athleteError || !athleteUser) {
        return NextResponse.json(
          { error: 'Parent or athlete not found or invalid roles' },
          { status: 404 }
        );
      }

      // Check if relationship already exists
      const { data: existing } = await supabaseAdmin
        .from('parent_athlete_relationships')
        .select('*')
        .eq('parent_id', parentId)
        .eq('athlete_id', athleteId)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Relationship already exists' },
          { status: 409 }
        );
      }

      // Create parent-athlete relationship
      relationshipData = {
        parent_id: parentId,
        athlete_id: athleteId,
        relationship_type: relationshipType || 'guardian',
        permissions: permissions || {
          view_nil_activities: true,
          approve_contracts: true,
          receive_notifications: true,
          access_financial_info: true,
        },
        verified: false
      };

      const { data, error } = await supabaseAdmin
        .from('parent_athlete_relationships')
        .insert(relationshipData)
        .select()
        .single();

      if (error) {
        console.error('💥 Failed to create parent-athlete relationship:', error);
        return NextResponse.json(
          { error: `Failed to create relationship: ${error.message}` },
          { status: 500 }
        );
      }

      result = data;

    } else if (type === 'coach') {
      // Verify coach and athlete exist and have correct roles
      const { data: coachUser, error: coachError } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('id', coachId)
        .eq('role', 'coach')
        .single();

      const { data: athleteUser, error: athleteError } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('id', athleteId)
        .eq('role', 'athlete')
        .single();

      if (coachError || !coachUser || athleteError || !athleteUser) {
        return NextResponse.json(
          { error: 'Coach or athlete not found or invalid roles' },
          { status: 404 }
        );
      }

      // Check if relationship already exists
      const { data: existing } = await supabaseAdmin
        .from('coach_athlete_relationships')
        .select('*')
        .eq('coach_id', coachId)
        .eq('athlete_id', athleteId)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Relationship already exists' },
          { status: 409 }
        );
      }

      // Create coach-athlete relationship
      relationshipData = {
        coach_id: coachId,
        athlete_id: athleteId,
        team_role: teamRole || 'member',
        sport: sport,
        season: season || new Date().getFullYear().toString(),
        permissions: permissions || {
          view_nil_activities: true,
          provide_guidance: true,
          receive_reports: true,
        },
        active: true
      };

      const { data, error } = await supabaseAdmin
        .from('coach_athlete_relationships')
        .insert(relationshipData)
        .select()
        .single();

      if (error) {
        console.error('💥 Failed to create coach-athlete relationship:', error);
        return NextResponse.json(
          { error: `Failed to create relationship: ${error.message}` },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log(`✅ ${type} relationship created successfully`);

    return NextResponse.json({
      success: true,
      relationship: result
    });

  } catch (error: any) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get relationships for a user
export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    console.log('🔍 === API ROUTE: GET RELATIONSHIPS ===');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Missing userId or userRole parameter' },
        { status: 400 }
      );
    }

    let relationships = [];

    if (userRole === 'parent') {
      // Get parent-athlete relationships
      const { data, error } = await supabaseAdmin
        .from('parent_athlete_relationships')
        .select(`
          *,
          athlete:users!parent_athlete_relationships_athlete_id_fkey(
            id,
            first_name,
            last_name,
            email,
            primary_sport,
            school_name
          )
        `)
        .eq('parent_id', userId);

      if (error) {
        console.error('💥 Failed to fetch parent relationships:', error);
        return NextResponse.json(
          { error: 'Failed to fetch relationships' },
          { status: 500 }
        );
      }

      relationships = data || [];

    } else if (userRole === 'coach') {
      // Get coach-athlete relationships
      const { data, error } = await supabaseAdmin
        .from('coach_athlete_relationships')
        .select(`
          *,
          athlete:users!coach_athlete_relationships_athlete_id_fkey(
            id,
            first_name,
            last_name,
            email,
            primary_sport,
            school_name
          )
        `)
        .eq('coach_id', userId);

      if (error) {
        console.error('💥 Failed to fetch coach relationships:', error);
        return NextResponse.json(
          { error: 'Failed to fetch relationships' },
          { status: 500 }
        );
      }

      relationships = data || [];

    } else if (userRole === 'athlete') {
      // Get both parent and coach relationships for athlete
      const { data: parentRels, error: parentError } = await supabaseAdmin
        .from('parent_athlete_relationships')
        .select(`
          *,
          parent:users!parent_athlete_relationships_parent_id_fkey(
            id,
            first_name,
            last_name,
            email,
            relationship_type
          )
        `)
        .eq('athlete_id', userId);

      const { data: coachRels, error: coachError } = await supabaseAdmin
        .from('coach_athlete_relationships')
        .select(`
          *,
          coach:users!coach_athlete_relationships_coach_id_fkey(
            id,
            first_name,
            last_name,
            email,
            title,
            school_name
          )
        `)
        .eq('athlete_id', userId);

      if (parentError || coachError) {
        console.error('💥 Failed to fetch athlete relationships:', parentError || coachError);
        return NextResponse.json(
          { error: 'Failed to fetch relationships' },
          { status: 500 }
        );
      }

      relationships = {
        parents: parentRels || [],
        coaches: coachRels || []
      } as any;
    }

    console.log(`✅ Retrieved relationships for ${userRole}:`, relationships.length || 'multiple');

    return NextResponse.json({
      success: true,
      relationships
    });

  } catch (error: any) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a relationship
export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    console.log('🗑️ === API ROUTE: DELETE RELATIONSHIP ===');

    const body = await request.json();
    const { type, parentId, coachId, athleteId } = body;

    if (!type || !athleteId || (type === 'parent' && !parentId) || (type === 'coach' && !coachId)) {
      return NextResponse.json(
        { error: 'Missing required fields for relationship deletion' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'parent') {
      const { data, error } = await supabaseAdmin
        .from('parent_athlete_relationships')
        .delete()
        .eq('parent_id', parentId)
        .eq('athlete_id', athleteId)
        .select();

      if (error) {
        console.error('💥 Failed to delete parent-athlete relationship:', error);
        return NextResponse.json(
          { error: `Failed to delete relationship: ${error.message}` },
          { status: 500 }
        );
      }

      result = data;

    } else if (type === 'coach') {
      const { data, error } = await supabaseAdmin
        .from('coach_athlete_relationships')
        .delete()
        .eq('coach_id', coachId)
        .eq('athlete_id', athleteId)
        .select();

      if (error) {
        console.error('💥 Failed to delete coach-athlete relationship:', error);
        return NextResponse.json(
          { error: `Failed to delete relationship: ${error.message}` },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log(`✅ ${type} relationship deleted successfully`);

    return NextResponse.json({
      success: true,
      deleted: result
    });

  } catch (error: any) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}