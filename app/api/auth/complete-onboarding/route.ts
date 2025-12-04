import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { splitProfileUpdates, ensureAthleteProfile } from '@/lib/profile-field-mapper';
import { triggerMatchmakingForAthlete } from '@/lib/matchmaking-trigger';
import { generateUniqueUsername } from '@/lib/username-generator';
import { calculateFMV } from '@/lib/fmv/fmv-calculator';
import { checkAnonRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';
import type { User, SocialMediaStat, NILDeal, ScrapedAthleteData } from '@/types';

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

    // ========================================
    // RATE LIMITING - Prevent spam onboarding
    // ========================================
    const rateLimitResult = await checkAnonRateLimit(RATE_LIMITS.ONBOARDING);
    if (!rateLimitResult.allowed) {
      console.warn('⚠️ Rate limit exceeded for complete-onboarding');
      return rateLimitResponse(rateLimitResult);
    }

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

    // Check if profile exists (include school fields for Phase 6B)
    console.log('🔍 Checking if user profile exists...');
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, onboarding_completed, school_created, profile_completion_tier, school_id')
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

      // Physical Stats (athlete fields - collected in personal info step)
      if (formData.heightInches !== undefined) mapped.height_inches = formData.heightInches;
      if (formData.weightLbs !== undefined) mapped.weight_lbs = formData.weightLbs;
      if (formData.jerseyNumber !== undefined) mapped.jersey_number = formData.jerseyNumber;

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

    // Prepare update data - split into proper tables
    const mappedData = mapFormDataToDatabase(onboardingData);

    console.log('💾 Mapped form data keys:', Object.keys(mappedData));

    // Split updates between users and athlete_profiles tables
    const { usersUpdates, athleteUpdates, unmapped } = splitProfileUpdates(mappedData);

    if (unmapped.length > 0) {
      console.warn('⚠️ Unmapped onboarding fields (skipping):', unmapped);
    }

    // Add onboarding completion fields to users table
    usersUpdates.onboarding_completed = true;
    usersUpdates.onboarding_completed_at = new Date().toISOString();

    // Auto-generate username if not already set
    // Check if user already has a username
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('username, first_name, last_name')
      .eq('id', userId)
      .single();

    if (!currentUser?.username) {
      // Generate unique username from name
      const firstName = mappedData.first_name || currentUser?.first_name || '';
      const lastName = mappedData.last_name || currentUser?.last_name || '';

      if (firstName && lastName) {
        try {
          const generatedUsername = await generateUniqueUsername(firstName, lastName);
          usersUpdates.username = generatedUsername;
          console.log('🏷️ Auto-generated username:', generatedUsername);
        } catch (usernameError) {
          console.warn('⚠️ Failed to generate username (non-critical):', usernameError);
          // Continue without username - it can be set later
        }
      }
    } else {
      console.log('🏷️ User already has username:', currentUser.username);
    }

    // Phase 6B: Handle school-created account completion
    if (existingProfile.school_created && existingProfile.profile_completion_tier === 'basic') {
      console.log('🏫 Upgrading school-created account to full profile');
      usersUpdates.profile_completion_tier = 'full';
      usersUpdates.home_completion_required = false;
      usersUpdates.home_completed_at = new Date().toISOString();
    }

    console.log('📤 Updating user profile with admin privileges...');
    console.log('👤 Users table updates:', Object.keys(usersUpdates));
    console.log('🏃 Athlete profile updates:', Object.keys(athleteUpdates));

    // Update the users table
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        ...usersUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('💥 Failed to update user profile:', updateError);
      return NextResponse.json(
        { error: `Failed to complete onboarding: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ User profile updated successfully');

    // If this is an athlete and there are athlete-specific fields, update athlete_profiles
    if (updatedProfile.role === 'athlete' && Object.keys(athleteUpdates).length > 0) {
      console.log('🏃 Creating/updating athlete profile...');

      // Ensure athlete profile exists
      const { success: profileExists, error: ensureError } = await ensureAthleteProfile(supabaseAdmin, userId);
      if (!profileExists) {
        console.error('⚠️ Failed to ensure athlete profile exists:', ensureError);
        // Continue anyway - user record is updated
      } else {
        // Update athlete profile
        const { error: athleteError } = await supabaseAdmin
          .from('athlete_profiles')
          .update({
            ...athleteUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (athleteError) {
          console.error('⚠️ Failed to update athlete profile (non-critical):', athleteError);
          // Don't fail the onboarding - user record is already updated
        } else {
          console.log('✅ Athlete profile updated successfully');
        }
      }
    }

    // Phase 6B: Update school completion statistics
    if (existingProfile.school_created && existingProfile.school_id && existingProfile.profile_completion_tier === 'basic') {
      try {
        console.log('📊 Updating school completion statistics...');
        const { data: school } = await supabaseAdmin
          .from('schools')
          .select('students_completed')
          .eq('id', existingProfile.school_id)
          .single();

        if (school) {
          await supabaseAdmin
            .from('schools')
            .update({
              students_completed: school.students_completed + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProfile.school_id);

          console.log('✅ School completion statistics updated');
        }
      } catch (schoolStatsError) {
        console.warn('⚠️ Failed to update school statistics (non-critical):', schoolStatsError);
      }
    }

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

    // Save social media stats to dedicated table (if provided)
    if (updatedProfile.role === 'athlete' && onboardingData.social_media_stats && Array.isArray(onboardingData.social_media_stats)) {
      try {
        console.log('📱 Saving social media stats to dedicated table...');
        const socialStats = onboardingData.social_media_stats;

        // Calculate aggregated stats
        let totalFollowers = 0;
        let totalEngagement = 0;

        for (const stat of socialStats) {
          if (!stat.platform || !stat.handle) continue;

          totalFollowers += stat.followers || 0;
          totalEngagement += stat.engagement_rate || 0;

          // Upsert each platform's stats
          const { error: statError } = await supabaseAdmin
            .from('social_media_stats')
            .upsert({
              user_id: userId,
              platform: stat.platform,
              handle: stat.handle.startsWith('@') ? stat.handle : `@${stat.handle}`,
              followers: stat.followers || 0,
              engagement_rate: stat.engagement_rate || 0,
              verified: stat.verified || false,
              last_updated: new Date().toISOString(),
            }, {
              onConflict: 'user_id,platform'
            });

          if (statError) {
            console.warn(`⚠️ Failed to save ${stat.platform} stats:`, statError.message);
          }
        }

        // Update aggregated stats on athlete_profiles
        const avgEngagement = socialStats.length > 0 ? totalEngagement / socialStats.length : 0;
        await supabaseAdmin
          .from('athlete_profiles')
          .update({
            total_followers: totalFollowers,
            avg_engagement_rate: avgEngagement,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        console.log(`✅ Saved ${socialStats.length} social media platforms, total followers: ${totalFollowers}`);
      } catch (socialError) {
        console.warn('⚠️ Failed to save social media stats (non-critical):', socialError);
      }
    }

    // Auto-trigger matchmaking for athletes (find matching campaigns)
    let matchmakingResults = null;
    if (updatedProfile.role === 'athlete') {
      try {
        console.log('🔄 Auto-triggering matchmaking for new athlete:', userId);
        matchmakingResults = await triggerMatchmakingForAthlete(userId);
        console.log(`✅ Matchmaking complete: ${matchmakingResults.matchesGenerated} campaign matches found`);
      } catch (matchError) {
        console.warn('⚠️ Matchmaking trigger failed (non-critical):', matchError);
        // Don't fail the onboarding if matchmaking fails
      }
    }

    // Auto-calculate FMV score for athletes
    let fmvResults = null;
    if (updatedProfile.role === 'athlete') {
      try {
        console.log('💰 Auto-calculating FMV score for new athlete:', userId);

        // Fetch data needed for FMV calculation
        const [
          { data: socialStats },
          { data: nilDeals },
          { data: externalRankings }
        ] = await Promise.all([
          supabaseAdmin.from('social_media_stats').select('*').eq('user_id', userId),
          supabaseAdmin.from('nil_deals').select('*').eq('athlete_id', userId),
          supabaseAdmin.from('scraped_athlete_data').select('*').eq('matched_user_id', userId).eq('verified', true)
        ]);

        // Calculate FMV
        const fmvResult = await calculateFMV({
          athlete: { ...updatedProfile, id: userId } as User,
          socialStats: (socialStats || []) as SocialMediaStat[],
          nilDeals: (nilDeals || []) as NILDeal[],
          externalRankings: (externalRankings || []) as ScrapedAthleteData[],
        });

        // Save to database (matching actual athlete_fmv_data schema)
        const fmvRecord = {
          athlete_id: userId,
          fmv_score: fmvResult.fmv_score,
          fmv_tier: fmvResult.fmv_tier,
          percentile_rank: fmvResult.percentile_rank,
          deal_value_min: fmvResult.estimated_deal_value_low,
          deal_value_max: fmvResult.estimated_deal_value_high,
          is_public_score: true, // Default to public for new athletes
        };

        const { data: savedFMV, error: fmvSaveError } = await supabaseAdmin
          .from('athlete_fmv_data')
          .insert(fmvRecord)
          .select()
          .single();

        if (fmvSaveError) {
          console.error('⚠️ FMV save error (non-critical):', fmvSaveError);
        } else {
          console.log(`✅ FMV calculated and saved: Score ${savedFMV.fmv_score}, Tier: ${savedFMV.fmv_tier}`);
          fmvResults = {
            fmv_score: savedFMV.fmv_score,
            fmv_tier: savedFMV.fmv_tier,
          };

          // Also update athlete_profiles with estimated_fmv based on deal value max
          await supabaseAdmin
            .from('athlete_profiles')
            .update({
              estimated_fmv: savedFMV.deal_value_max,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      } catch (fmvError) {
        console.warn('⚠️ FMV calculation failed (non-critical):', fmvError);
        // Don't fail onboarding if FMV fails - it can be calculated later
      }
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      relationships: relationshipResults,
      matchmaking: matchmakingResults ? {
        matchesGenerated: matchmakingResults.matchesGenerated,
        campaigns: matchmakingResults.campaigns?.map(c => ({
          campaignId: c.campaignId,
          campaignName: c.campaignName,
          matchScore: c.topMatches?.[0]?.matchPercentage || 0
        })) || []
      } : null,
      fmv: fmvResults
    });

  } catch (error: any) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}