import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { splitProfileUpdates, ensureAthleteProfile, isAthleteRole } from '@/lib/profile-field-mapper';

export const dynamic = 'force-dynamic';

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  const fieldChecks = [
    { field: 'first_name', value: profile.first_name },
    { field: 'last_name', value: profile.last_name },
    { field: 'email', value: profile.email },
    { field: 'date_of_birth', value: profile.date_of_birth },
    { field: 'phone', value: profile.phone },
    { field: 'school_name', value: profile.school_name },
    { field: 'graduation_year', value: profile.graduation_year },
    { field: 'major', value: profile.major },
    { field: 'gpa', value: profile.gpa },
    { field: 'sport', value: profile.sport }, // Fixed: use 'sport' not 'primary_sport'
    { field: 'position', value: profile.position },
    { field: 'achievements', value: profile.achievements && profile.achievements.length > 0 },
    { field: 'nil_interests', value: profile.nil_interests && profile.nil_interests.length > 0 },
    { field: 'nil_concerns', value: profile.nil_concerns && profile.nil_concerns.length > 0 },
    { field: 'nil_preferences', value: profile.nil_preferences }
  ];

  const totalFields = fieldChecks.length;
  const completedFields = fieldChecks.filter(check => check.value).length;
  return Math.round((completedFields / totalFields) * 100);
}

export async function POST(request: NextRequest) {
  console.log('💾 === API ROUTE: UPDATE USER PROFILE ===');

  try {
    const body = await request.json();
    const { userId, updates } = body;

    console.log('📋 Profile update request:', { userId, updateFields: Object.keys(updates) });

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and updates' },
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

    // Get current user data to verify it exists
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

    console.log('📊 Current user profile exists');

    // Split updates between users and athlete_profiles tables
    const { usersUpdates, athleteUpdates, unmapped } = splitProfileUpdates(updates);

    if (unmapped.length > 0) {
      console.warn('⚠️ Unmapped fields (skipping):', unmapped);
    }

    console.log('💾 Updating user profile...');
    console.log('👤 Users table updates:', Object.keys(usersUpdates));
    console.log('🏃 Athlete profile updates:', Object.keys(athleteUpdates));

    // Update users table if there are changes
    let updatedUser = currentUser;
    if (Object.keys(usersUpdates).length > 0) {
      const { data, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          ...usersUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Failed to update users table:', updateError);
        console.error('❌ Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        return NextResponse.json(
          {
            error: 'Failed to update profile',
            details: updateError.message,
            hint: updateError.hint
          },
          { status: 500 }
        );
      }

      updatedUser = data;
      console.log('✅ Users table updated successfully');
    }

    // Update athlete_profiles table if there are changes and user is an athlete
    if (isAthleteRole(currentUser.role) && Object.keys(athleteUpdates).length > 0) {
      // Ensure athlete profile exists
      const { success: profileExists, error: ensureError } = await ensureAthleteProfile(supabaseAdmin, userId);
      if (!profileExists) {
        console.error('⚠️ Failed to ensure athlete profile exists:', ensureError);
        // Continue anyway - user record might be updated
      } else {
        const { error: athleteError } = await supabaseAdmin
          .from('athlete_profiles')
          .update({
            ...athleteUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (athleteError) {
          console.error('❌ Failed to update athlete_profiles table:', athleteError);
          return NextResponse.json(
            {
              error: 'Failed to update athlete profile',
              details: athleteError.message
            },
            { status: 500 }
          );
        }

        console.log('✅ Athlete profile updated successfully');
      }
    }

    // Fetch complete updated profile
    const { data: athleteProfile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const completeProfile = {
      ...updatedUser,
      ...athleteProfile,
      id: updatedUser.id,
    };

    console.log('✅ Profile updated successfully:', {
      userId,
      updatedFields: [...Object.keys(usersUpdates), ...Object.keys(athleteUpdates)]
    });

    // Check if profile is now 100% complete and award badge
    try {
      const completionPercentage = calculateProfileCompletion(completeProfile);
      console.log(`📊 Profile completion: ${completionPercentage}%`);

      if (completionPercentage === 100) {
        console.log('🎖️ Profile is 100% complete, checking for badge...');
        const badgeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/badges/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            action: 'profile_complete'
          })
        });

        const badgeData = await badgeResponse.json();
        if (badgeData.success && badgeData.awardedBadge) {
          console.log('🎉 Profile completion badge awarded:', badgeData.badge?.name);
        }
      }
    } catch (badgeError) {
      console.warn('⚠️ Failed to check profile completion badge (non-critical):', badgeError);
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: completeProfile
    });

  } catch (error) {
    console.error('💥 === UNEXPECTED ERROR IN UPDATE PROFILE ===');
    console.error('🚨 Error details:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}