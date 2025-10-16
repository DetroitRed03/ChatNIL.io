import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

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
    { field: 'primary_sport', value: profile.primary_sport },
    { field: 'position', value: profile.position },
    { field: 'achievements', value: profile.achievements && profile.achievements.length > 0 },
    { field: 'nil_interests', value: profile.nil_interests && profile.nil_interests.length > 0 },
    { field: 'nil_concerns', value: profile.nil_concerns && profile.nil_concerns.length > 0 },
    { field: 'social_media_handles', value: profile.social_media_handles }
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

    // Prepare updated data with timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Updating user profile...');
    console.log('📝 Update fields:', Object.keys(updatedData));

    // Update user profile in database
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updatedData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update user profile:', updateError);
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

    console.log('✅ Profile updated successfully:', {
      userId,
      updatedFields: Object.keys(updatedData)
    });

    // Check if profile is now 100% complete and award badge
    try {
      const completionPercentage = calculateProfileCompletion(updatedUser);
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
      user: updatedUser
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