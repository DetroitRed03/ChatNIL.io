import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Server-side service role client (secure)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
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

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 === API ROUTE: COMPLETE ONBOARDING ===');

    const body = await request.json();
    const { userId, onboardingData } = body;

    console.log('📋 Onboarding completion request:', {
      userId,
      dataKeys: Object.keys(onboardingData || {})
    });

    // Validate required fields
    if (!userId || !onboardingData) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing userId or onboardingData' },
        { status: 400 }
      );
    }

    // Verify the user exists in Supabase Auth
    console.log('🔍 Verifying user exists in auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      console.error('❌ User not found in auth:', authError?.message);
      return NextResponse.json(
        { error: 'User not found in authentication system' },
        { status: 404 }
      );
    }

    console.log('✅ User verified in auth system');

    // Check if profile exists
    console.log('🔍 Checking if user profile exists...');
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, onboarding_completed')
      .eq('id', userId)
      .single();

    if (checkError) {
      console.error('❌ Error checking existing profile:', checkError);
      return NextResponse.json(
        { error: 'Database error while checking existing profile' },
        { status: 500 }
      );
    }

    if (!existingProfile) {
      console.error('❌ User profile not found');
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (existingProfile.onboarding_completed) {
      console.log('⚠️ Onboarding already completed');
      return NextResponse.json(
        { error: 'Onboarding already completed' },
        { status: 409 }
      );
    }

    // Map form data to database fields
    const mapFormDataToDatabase = (formData: any) => {
      const mapped: any = {};

      // Personal Info (common to all roles)
      if (formData.firstName) mapped.first_name = formData.firstName;
      if (formData.lastName) mapped.last_name = formData.lastName;
      if (formData.dateOfBirth) mapped.date_of_birth = formData.dateOfBirth;
      if (formData.email) mapped.email = formData.email;
      if (formData.phone) mapped.phone = formData.phone;
      if (formData.parentEmail) mapped.parent_email = formData.parentEmail;

      // Parent-specific fields
      if (formData.relationshipType) mapped.relationship_type = formData.relationshipType;
      if (formData.childEmail) mapped.connected_athletes = []; // Will be populated via relationship table
      if (formData.notificationPreferences) mapped.notification_preferences = formData.notificationPreferences;
      if (formData.dashboardAccess) mapped.dashboard_access_level = formData.dashboardAccess;
      if (formData.approvalSettings) {
        mapped.notification_preferences = {
          ...mapped.notification_preferences,
          approval_settings: formData.approvalSettings
        };
      }
      if (formData.communicationPrefs) {
        mapped.notification_preferences = {
          ...mapped.notification_preferences,
          communication_prefs: formData.communicationPrefs
        };
      }

      // Coach-specific fields
      if (formData.title) mapped.title = formData.title;
      if (formData.schoolName) mapped.school_name = formData.schoolName;
      if (formData.sport) mapped.primary_sport = formData.sport;
      if (formData.division) mapped.division = formData.division;
      if (formData.teamName) mapped.team_name = formData.teamName;
      if (formData.position) mapped.position = formData.position;
      if (formData.complianceLevel || formData.approvalWorkflow || formData.reportingPrefs) {
        mapped.compliance_settings = {
          compliance_level: formData.complianceLevel,
          approval_workflow: formData.approvalWorkflow,
          reporting_prefs: formData.reportingPrefs
        };
      }
      if (formData.bulkManagement) {
        mapped.compliance_settings = {
          ...mapped.compliance_settings,
          bulk_management: formData.bulkManagement
        };
      }

      // School Info (athlete fields)
      if (formData.schoolName) mapped.school_name = formData.schoolName;
      if (formData.schoolLevel) mapped.school_level = formData.schoolLevel;
      if (formData.graduationYear) mapped.graduation_year = formData.graduationYear;
      if (formData.major) mapped.major = formData.major;
      if (formData.gpa) mapped.gpa = formData.gpa;

      // Sports Info (athlete fields)
      if (formData.primarySport) mapped.primary_sport = formData.primarySport;
      if (formData.secondarySports) {
        // Ensure it's an array
        mapped.secondary_sports = Array.isArray(formData.secondarySports)
          ? formData.secondarySports
          : [];
      }
      if (formData.achievements) {
        // Ensure it's an array - handle both array and string input (from textarea)
        if (Array.isArray(formData.achievements)) {
          mapped.achievements = formData.achievements;
        } else if (typeof formData.achievements === 'string' && formData.achievements.trim()) {
          // Convert string to single-element array
          mapped.achievements = [formData.achievements.trim()];
        } else {
          mapped.achievements = [];
        }
      }
      if (formData.stats) mapped.stats = formData.stats;
      if (formData.coachName) mapped.coach_name = formData.coachName;
      if (formData.coachEmail) mapped.coach_email = formData.coachEmail;

      // NIL Info (athlete fields)
      if (formData.bio) mapped.bio = formData.bio;
      if (formData.socialMediaHandles) mapped.social_media_handles = formData.socialMediaHandles;
      if (formData.brandInterests) {
        // Ensure it's an array - Map to nil_interests column
        mapped.nil_interests = Array.isArray(formData.brandInterests)
          ? formData.brandInterests
          : [];
      }
      if (formData.nilGoals) {
        // Ensure it's an array
        mapped.nil_goals = Array.isArray(formData.nilGoals)
          ? formData.nilGoals
          : [];
      }
      // Note: has_agent and agent_info fields removed - not in database schema
      // if (formData.hasAgent !== undefined) mapped.has_agent = formData.hasAgent;
      // if (formData.agentInfo) mapped.agent_info = formData.agentInfo;

      return mapped;
    };

    // Prepare update data
    const mappedData = mapFormDataToDatabase(onboardingData);
    const updateData: any = {
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      ...mappedData
    };

    console.log('💾 Mapped form data keys:', Object.keys(mappedData));
    console.log('📤 Updating user profile with admin privileges...');

    // Update the user profile with service role (bypasses RLS)
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('💥 Failed to complete onboarding:', updateError);
      return NextResponse.json(
        { error: `Failed to complete onboarding: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ User profile updated successfully');

    // Handle relationship creation for parents and coaches
    let relationshipResults = null;

    try {
      // Get the user's role to determine relationship handling
      const userRole = updatedProfile.role;

      if (userRole === 'parent' && onboardingData.childEmail) {
        console.log('👨‍👩‍👧‍👦 Creating parent-athlete relationship...');

        // Find the athlete by email
        const { data: athleteUser, error: athleteError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', onboardingData.childEmail)
          .eq('role', 'athlete')
          .single();

        if (athleteError || !athleteUser) {
          console.warn('⚠️ Athlete not found for parent relationship:', onboardingData.childEmail);
          // Don't fail the whole onboarding, just log the issue
        } else {
          // Create parent-athlete relationship
          const { data: relationship, error: relationshipError } = await supabaseAdmin
            .from('parent_athlete_relationships')
            .insert({
              parent_id: userId,
              athlete_id: athleteUser.id,
              relationship_type: onboardingData.relationshipType || 'guardian',
              permissions: {
                view_nil_activities: onboardingData.notificationPreferences?.nilActivities ?? true,
                approve_contracts: onboardingData.approvalSettings?.contractApproval ?? true,
                receive_notifications: true,
                access_financial_info: onboardingData.approvalSettings?.financialDecisions ?? true,
              },
              verified: false // Requires athlete confirmation
            })
            .select();

          if (relationshipError) {
            console.warn('⚠️ Failed to create parent-athlete relationship:', relationshipError);
          } else {
            console.log('✅ Parent-athlete relationship created successfully');
            relationshipResults = { type: 'parent', relationship };
          }
        }
      }

      if (userRole === 'coach' && onboardingData.inviteAthletes && onboardingData.inviteAthletes.length > 0) {
        console.log('🏃‍♂️ Creating coach-athlete relationships...');

        const relationshipInserts = [];

        for (const athlete of onboardingData.inviteAthletes) {
          if (!athlete.email || !athlete.name) continue;

          // Find the athlete by email
          const { data: athleteUser, error: athleteError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', athlete.email)
            .eq('role', 'athlete')
            .single();

          if (athleteUser) {
            relationshipInserts.push({
              coach_id: userId,
              athlete_id: athleteUser.id,
              team_role: 'member', // Default role
              sport: athlete.sport || onboardingData.sport,
              season: new Date().getFullYear().toString(),
              permissions: {
                view_nil_activities: onboardingData.bulkManagement?.defaultPermissions?.viewNILActivities ?? true,
                provide_guidance: onboardingData.bulkManagement?.defaultPermissions?.provideGuidance ?? true,
                receive_reports: onboardingData.bulkManagement?.defaultPermissions?.receiveReports ?? true,
              },
              active: true
            });
          }
        }

        if (relationshipInserts.length > 0) {
          const { data: relationships, error: relationshipError } = await supabaseAdmin
            .from('coach_athlete_relationships')
            .insert(relationshipInserts)
            .select();

          if (relationshipError) {
            console.warn('⚠️ Failed to create some coach-athlete relationships:', relationshipError);
          } else {
            console.log(`✅ Created ${relationships.length} coach-athlete relationships`);
            relationshipResults = { type: 'coach', relationships };
          }
        }
      }
    } catch (relationshipError) {
      console.warn('⚠️ Non-critical relationship creation error:', relationshipError);
      // Don't fail the onboarding for relationship issues
    }

    console.log('✅ Onboarding completed successfully for user:', userId);

    // Award signup/onboarding completion badge
    try {
      console.log('🎖️ Checking for onboarding completion badge...');
      const badgeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/badges/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          action: 'onboarding_complete'
        })
      });

      const badgeData = await badgeResponse.json();
      if (badgeData.success && badgeData.awardedBadge) {
        console.log('🎉 Onboarding badge awarded:', badgeData.badge?.name);
      }
    } catch (badgeError) {
      console.warn('⚠️ Failed to award onboarding badge (non-critical):', badgeError);
      // Don't fail the onboarding for badge issues
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      relationships: relationshipResults
    });

  } catch (error: any) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}