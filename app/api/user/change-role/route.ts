import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔄 === API ROUTE: CHANGE USER ROLE ===');

  try {
    const body = await request.json();
    const { userId, newRole } = body;

    console.log('📋 Role change request:', { userId, newRole });

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and newRole' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['athlete', 'parent', 'coach', 'agency'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be athlete, parent, coach, or agency' },
        { status: 400 }
      );
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('❌ Service role client not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Verify user exists in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      console.error('❌ User not found in auth:', authError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User verified in auth system');

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !currentUser) {
      console.error('❌ Failed to fetch current user:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    console.log('📊 Current user role:', currentUser.role);

    // Prepare updated data - keep basic info, clear role-specific fields
    const updatedData = {
      role: newRole,
      // Clear athlete/parent/coach fields
      school_name: null,
      graduation_year: null,
      major: null,
      gpa: null,
      primary_sport: null,
      position: null,
      achievements: null,
      nil_interests: null,
      nil_concerns: null,
      social_media_handles: null,
      date_of_birth: null,
      phone: null,
      parent_email: null,
      title: null,
      division: null,
      team_name: null,
      connected_athletes: null,
      relationship_type: null,
      managed_athletes: null,
      // Clear agency fields
      company_name: null,
      industry: null,
      company_size: null,
      website_url: null,
      target_demographics: null,
      campaign_interests: null,
      budget_range: null,
      geographic_focus: null,
      brand_values: null,
      verification_status: 'pending',
      verified_at: null,
      // Reset onboarding status
      onboarding_completed: false,
      onboarding_completed_at: null,
      // Update timestamp
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Updating user with new role...');
    console.log('📝 Update data:', JSON.stringify(updatedData, null, 2));

    // Update user in database
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update user role:', updateError);
      console.error('❌ Error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      return NextResponse.json(
        {
          error: 'Failed to update role',
          details: updateError.message,
          hint: updateError.hint
        },
        { status: 500 }
      );
    }

    console.log('✅ Role changed successfully:', {
      userId,
      oldRole: currentUser.role,
      newRole: updatedUser.role
    });

    // Log the role change for audit purposes
    console.log('📝 Audit log: User', userId, 'changed role from', currentUser.role, 'to', newRole);

    return NextResponse.json({
      success: true,
      message: 'Role changed successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('💥 === UNEXPECTED ERROR IN CHANGE ROLE ===');
    console.error('🚨 Error details:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}