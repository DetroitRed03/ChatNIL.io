export interface ProfileVisibilityStatus {
  isPublic: boolean;
  canBePublic: boolean;
  missingRequirements: string[];
  completionPercent: number;
}

/**
 * Check whether a profile meets the requirements to go public.
 */
export function checkProfileVisibility(
  profile: {
    avatar_url?: string | null;
    profile_photo_url?: string | null;
    bio?: string | null;
    sport?: string | null;
    primary_sport?: string | null;
    school?: string | null;
    school_name?: string | null;
    social_media_stats?: any;
    is_public?: boolean;
    role?: string;
    athlete_type?: string;
    parent_consent_given?: boolean;
  }
): ProfileVisibilityStatus {
  const missing: string[] = [];

  // Check required fields
  const hasPhoto = !!(profile.avatar_url || profile.profile_photo_url);
  if (!hasPhoto) missing.push('Profile photo');

  const bio = profile.bio;
  if (!bio || bio.length < 20) missing.push('Bio (at least 20 characters)');

  const sport = profile.sport || profile.primary_sport;
  if (!sport) missing.push('Sport');

  const school = profile.school || profile.school_name;
  if (!school) missing.push('School');

  // Check social media — at least one platform with a handle
  const stats = profile.social_media_stats;
  const hasSocial = stats && (
    stats.instagram?.handle ||
    stats.tiktok?.handle ||
    stats.twitter?.handle ||
    stats.youtube?.handle
  );
  if (!hasSocial) missing.push('At least one social media account');

  // Check parent consent for HS athletes
  const isHS = profile.role === 'hs_student' || profile.athlete_type === 'hs_athlete';
  if (isHS && !profile.parent_consent_given) {
    missing.push('Parent/guardian consent');
  }

  // Calculate completion
  const totalFields = isHS ? 6 : 5; // photo, bio, sport, school, social, (+consent for HS)
  const completedFields = totalFields - missing.length;
  const completionPercent = Math.round((completedFields / totalFields) * 100);

  return {
    isPublic: profile.is_public || false,
    canBePublic: missing.length === 0,
    missingRequirements: missing,
    completionPercent,
  };
}

/**
 * List which social platforms are connected.
 */
export function getConnectedPlatforms(socialMediaStats?: any): string[] {
  if (!socialMediaStats) return [];

  const connected: string[] = [];
  if (socialMediaStats.instagram?.handle) connected.push('Instagram');
  if (socialMediaStats.tiktok?.handle) connected.push('TikTok');
  if (socialMediaStats.twitter?.handle) connected.push('Twitter/X');
  if (socialMediaStats.youtube?.handle) connected.push('YouTube');

  return connected;
}
