/**
 * Profile Field Mapper
 *
 * Maps application field names to actual database columns and tables.
 * This ensures profile updates go to the correct table (users vs athlete_profiles).
 *
 * Created to fix schema mismatch issues after database migration.
 */

export interface FieldMapping {
  table: 'users' | 'athlete_profiles';
  column: string;
}

/**
 * Complete field mapping from application field names to database columns
 */
export const FIELD_MAPPING: Record<string, FieldMapping> = {
  // ===== USERS TABLE FIELDS =====

  // Core user fields
  'id': { table: 'users', column: 'id' },
  'email': { table: 'users', column: 'email' },
  'role': { table: 'users', column: 'role' },
  'user_type': { table: 'users', column: 'user_type' },
  'username': { table: 'users', column: 'username' },
  'profile_photo': { table: 'users', column: 'profile_photo' },

  // Personal info
  'first_name': { table: 'users', column: 'first_name' },
  'firstName': { table: 'users', column: 'first_name' },
  'last_name': { table: 'users', column: 'last_name' },
  'lastName': { table: 'users', column: 'last_name' },
  'full_name': { table: 'users', column: 'full_name' },
  'date_of_birth': { table: 'users', column: 'date_of_birth' },
  'dateOfBirth': { table: 'users', column: 'date_of_birth' },
  'phone': { table: 'users', column: 'phone' },
  'parent_email': { table: 'users', column: 'parent_email' },
  'parentEmail': { table: 'users', column: 'parent_email' },

  // School/Organization
  'school_id': { table: 'users', column: 'school_id' },
  'school_name': { table: 'users', column: 'school_name' },
  'schoolName': { table: 'users', column: 'school_name' },
  'company_name': { table: 'users', column: 'company_name' },
  'companyName': { table: 'users', column: 'company_name' },
  'industry': { table: 'users', column: 'industry' },

  // Metadata
  'onboarding_completed': { table: 'users', column: 'onboarding_completed' },
  'school_created': { table: 'users', column: 'school_created' },
  'profile_completion_tier': { table: 'users', column: 'profile_completion_tier' },
  'home_completion_required': { table: 'users', column: 'home_completion_required' },

  // ===== ATHLETE_PROFILES TABLE FIELDS =====

  // Athletic info
  'sport': { table: 'athlete_profiles', column: 'sport' },
  'primary_sport': { table: 'athlete_profiles', column: 'sport' }, // Map to actual column
  'primarySport': { table: 'athlete_profiles', column: 'sport' },
  'position': { table: 'athlete_profiles', column: 'position' },
  'school': { table: 'athlete_profiles', column: 'school' },
  'year': { table: 'athlete_profiles', column: 'year' },
  'graduation_year': { table: 'athlete_profiles', column: 'graduation_year' },
  'graduationYear': { table: 'athlete_profiles', column: 'graduation_year' },
  'secondary_sports': { table: 'athlete_profiles', column: 'secondary_sports' },
  'secondarySports': { table: 'athlete_profiles', column: 'secondary_sports' },

  // Physical stats
  'height': { table: 'athlete_profiles', column: 'height' },
  'weight': { table: 'athlete_profiles', column: 'weight' },
  'height_inches': { table: 'athlete_profiles', column: 'height_inches' },
  'weight_lbs': { table: 'athlete_profiles', column: 'weight_lbs' },
  'jersey_number': { table: 'athlete_profiles', column: 'jersey_number' },
  'jerseyNumber': { table: 'athlete_profiles', column: 'jersey_number' },

  // Academic
  'major': { table: 'athlete_profiles', column: 'major' },
  'gpa': { table: 'athlete_profiles', column: 'gpa' },
  'school_level': { table: 'athlete_profiles', column: 'school_level' },
  'schoolLevel': { table: 'athlete_profiles', column: 'school_level' },

  // Coach info
  'coach_name': { table: 'athlete_profiles', column: 'coach_name' },
  'coachName': { table: 'athlete_profiles', column: 'coach_name' },
  'coach_email': { table: 'athlete_profiles', column: 'coach_email' },
  'coachEmail': { table: 'athlete_profiles', column: 'coach_email' },

  // Profile content
  'bio': { table: 'athlete_profiles', column: 'bio' },
  'achievements': { table: 'athlete_profiles', column: 'achievements' },
  'stats': { table: 'athlete_profiles', column: 'stats' },

  // Agent info
  'has_agent': { table: 'athlete_profiles', column: 'has_agent' },
  'hasAgent': { table: 'athlete_profiles', column: 'has_agent' },
  'agent_info': { table: 'athlete_profiles', column: 'agent_info' },
  'agentInfo': { table: 'athlete_profiles', column: 'agent_info' },

  // NIL related
  'nil_interests': { table: 'athlete_profiles', column: 'nil_interests' },
  'brandInterests': { table: 'athlete_profiles', column: 'nil_interests' }, // Onboarding field
  'nil_concerns': { table: 'athlete_profiles', column: 'nil_concerns' },
  'nil_goals': { table: 'athlete_profiles', column: 'nil_goals' },
  'nilGoals': { table: 'athlete_profiles', column: 'nil_goals' },
  'nil_preferences': { table: 'athlete_profiles', column: 'nil_preferences' },
  'estimated_fmv': { table: 'athlete_profiles', column: 'estimated_fmv' },
  'brand_preferences': { table: 'athlete_profiles', column: 'brand_preferences' },
  'preferred_partnership_types': { table: 'athlete_profiles', column: 'preferred_partnership_types' },

  // Media
  'profile_photo_url': { table: 'athlete_profiles', column: 'profile_photo_url' },
  'profile_video_url': { table: 'athlete_profiles', column: 'profile_video_url' },
  'cover_photo_url': { table: 'athlete_profiles', column: 'cover_photo_url' },
  'content_samples': { table: 'athlete_profiles', column: 'content_samples' },
  'twitch_channel': { table: 'athlete_profiles', column: 'twitch_channel' },
  'linkedin_url': { table: 'athlete_profiles', column: 'linkedin_url' },

  // Metrics
  'profile_completion_score': { table: 'athlete_profiles', column: 'profile_completion_score' },
  'last_profile_update': { table: 'athlete_profiles', column: 'last_profile_update' },
  'profile_views': { table: 'athlete_profiles', column: 'profile_views' },

  // ===== FIELDS THAT DON'T EXIST - MAP TO JSONB COLUMNS =====

  // These are mapped to nil_interests as JSONB array items
  'hobbies': { table: 'athlete_profiles', column: 'nil_interests' },
  'content_creation_interests': { table: 'athlete_profiles', column: 'nil_interests' },
  'lifestyle_interests': { table: 'athlete_profiles', column: 'nil_interests' },
  'causes_care_about': { table: 'athlete_profiles', column: 'nil_interests' },

  // Brand affinity maps to brand_preferences
  'brand_affinity': { table: 'athlete_profiles', column: 'brand_preferences' },

  // Social media - Note: This should ideally use the social_media_stats table
  // but for now we'll store in nil_preferences as JSONB
  'social_media_stats': { table: 'athlete_profiles', column: 'nil_preferences' },
  'social_media_handles': { table: 'athlete_profiles', column: 'nil_preferences' },
  'socialMediaHandles': { table: 'athlete_profiles', column: 'nil_preferences' },
};

/**
 * Split updates between users and athlete_profiles tables
 */
export function splitProfileUpdates(updates: Record<string, any>): {
  usersUpdates: Record<string, any>;
  athleteUpdates: Record<string, any>;
  unmapped: string[];
} {
  const usersUpdates: Record<string, any> = {};
  const athleteUpdates: Record<string, any> = {};
  const unmapped: string[] = [];

  for (const [key, value] of Object.entries(updates)) {
    // Skip undefined values
    if (value === undefined) continue;

    const mapping = FIELD_MAPPING[key];
    if (mapping) {
      if (mapping.table === 'users') {
        usersUpdates[mapping.column] = value;
      } else if (mapping.table === 'athlete_profiles') {
        athleteUpdates[mapping.column] = value;
      }
    } else {
      unmapped.push(key);
    }
  }

  return { usersUpdates, athleteUpdates, unmapped };
}

/**
 * Merge user and athlete profile data into a single profile object
 * Maps database field names to what the application expects
 */
export function mergeProfileData(
  userData: Record<string, any>,
  athleteData: Record<string, any> | null
): Record<string, any> {
  if (!userData) return {};

  const merged: any = {
    ...userData,
    ...(athleteData || {}),
    // Ensure user id is preserved
    id: userData.id,
  };

  // Map database fields to application-expected fields
  // This ensures the profile completion calculator and UI work correctly

  // Map 'sport' to 'primary_sport' (app expects primary_sport)
  if (athleteData?.sport && !merged.primary_sport) {
    merged.primary_sport = athleteData.sport;
  }

  // Map social_media_stats - need to fetch from social_media_stats table
  // For now, check if it exists in nil_preferences
  if (!merged.social_media_stats && athleteData?.nil_preferences) {
    // Check if social stats were stored in nil_preferences JSONB
    if (typeof athleteData.nil_preferences === 'object' && athleteData.nil_preferences.social_media_stats) {
      merged.social_media_stats = athleteData.nil_preferences.social_media_stats;
    }
  }

  // Map JSONB fields to individual arrays
  // nil_interests contains: hobbies, content_creation_interests, lifestyle_interests, causes_care_about
  if (athleteData?.nil_interests && Array.isArray(athleteData.nil_interests)) {
    // For now, just expose the array as-is
    // TODO: In the future, could parse JSONB to separate these
    if (!merged.hobbies) merged.hobbies = athleteData.nil_interests;
    if (!merged.content_creation_interests) merged.content_creation_interests = athleteData.nil_interests;
    if (!merged.lifestyle_interests) merged.lifestyle_interests = athleteData.nil_interests;
    if (!merged.causes_care_about) merged.causes_care_about = athleteData.nil_interests;
  }

  // Map brand_preferences to brand_affinity
  if (athleteData?.brand_preferences && !merged.brand_affinity) {
    merged.brand_affinity = athleteData.brand_preferences;
  }

  return merged;
}

/**
 * Check if a user is an athlete (has or should have athlete_profiles record)
 */
export function isAthleteRole(role: string | undefined): boolean {
  return role === 'athlete' || role === 'student_athlete';
}

/**
 * Ensure athlete profile exists for a user
 */
export async function ensureAthleteProfile(
  supabaseClient: any,
  userId: string
): Promise<{ success: boolean; error?: any }> {
  // Check if profile exists
  const { data: existing, error: checkError } = await supabaseClient
    .from('athlete_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError) {
    return { success: false, error: checkError };
  }

  // If it exists, we're good
  if (existing) {
    return { success: true };
  }

  // Create empty profile
  const { error: insertError } = await supabaseClient
    .from('athlete_profiles')
    .insert({
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    return { success: false, error: insertError };
  }

  return { success: true };
}
