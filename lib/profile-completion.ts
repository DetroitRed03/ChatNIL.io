/**
 * Profile Completion Calculator
 *
 * Calculates how complete a user's profile is and identifies
 * missing sections to help boost their profile strength.
 */

export interface ProfileSection {
  id: string;
  label: string;
  boost: number;
  category: 'personal' | 'school' | 'athletic' | 'social' | 'nil' | 'content';
}

export interface ProfileCompletionResult {
  percentage: number;
  score: number;
  maxScore: number;
  incompleteSections: ProfileSection[];
}

/**
 * Calculate profile completion percentage (0-100)
 *
 * Scoring breakdown:
 * - Personal Info: 15 points (name, email, phone, bio)
 * - School Info: 10 points (school, year, major/GPA)
 * - Athletic Info: 15 points (sport, position, achievements)
 * - Social Media: 20 points (platform accounts)
 * - Interests & Hobbies: 15 points (content interests, causes, hobbies)
 * - NIL Preferences: 10 points (interests, concerns)
 * - Content/Media: 15 points (portfolio items, NIL preferences)
 */
export function calculateProfileCompletion(
  user: any,
  options?: { nilAllowedInState?: boolean }
): ProfileCompletionResult {
  let score = 0;
  const includeContent = options?.nilAllowedInState !== false; // Default true
  const maxScore = includeContent ? 100 : 85;
  const incompleteSections: ProfileSection[] = [];

  // Personal Info (15 points)
  if (user.first_name && user.last_name) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'name',
      label: 'Complete your name',
      boost: 5,
      category: 'personal',
    });
  }

  if (user.email) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'email',
      label: 'Add email address',
      boost: 5,
      category: 'personal',
    });
  }

  if (user.bio && user.bio.length > 50) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'bio',
      label: user.bio ? 'Write a longer bio (50+ chars)' : 'Add a bio',
      boost: 5,
      category: 'personal',
    });
  }

  // School Info (10 points)
  if (user.school_name) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'school',
      label: 'Add school name',
      boost: 5,
      category: 'school',
    });
  }

  if (user.graduation_year) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'graduation_year',
      label: 'Add graduation year',
      boost: 5,
      category: 'school',
    });
  }

  // Athletic Info (15 points)
  // Note: Database column is 'sport', not 'primary_sport'
  if (user.sport || user.primary_sport) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'sport',
      label: 'Add primary sport',
      boost: 5,
      category: 'athletic',
    });
  }

  if (user.position) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'position',
      label: 'Add position',
      boost: 5,
      category: 'athletic',
    });
  }

  if (user.achievements && Array.isArray(user.achievements) && user.achievements.length > 0) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'achievements',
      label: 'Add achievements',
      boost: 5,
      category: 'athletic',
    });
  }

  // Social Media (20 points - 7 points per platform, max 20)
  // Check both array format (legacy) and object format (current)
  let socialMediaCount = 0;

  if (user.social_media_stats) {
    if (Array.isArray(user.social_media_stats)) {
      // Legacy array format
      socialMediaCount = user.social_media_stats.length;
    } else if (typeof user.social_media_stats === 'object') {
      // Current object format - count platforms that have data
      const platforms = ['instagram', 'tiktok', 'twitter', 'youtube'];
      socialMediaCount = platforms.filter(platform => {
        const platformData = user.social_media_stats[platform];
        return platformData && (platformData.followers > 0 || platformData.subscribers > 0);
      }).length;
    }
  }

  const socialMediaScore = Math.min(socialMediaCount * 7, 20);
  score += socialMediaScore;

  if (socialMediaScore < 20) {
    const remainingPlatforms = Math.ceil((20 - socialMediaScore) / 7);
    incompleteSections.push({
      id: 'social_media',
      label: `Connect ${remainingPlatforms} more social account${remainingPlatforms > 1 ? 's' : ''}`,
      boost: 20 - socialMediaScore,
      category: 'social',
    });
  }

  // Interests & Hobbies (15 points - 5 each for content interests, causes, hobbies)
  if (user.content_creation_interests && Array.isArray(user.content_creation_interests) && user.content_creation_interests.length > 0) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'content_interests',
      label: 'Add content creation interests',
      boost: 5,
      category: 'nil',
    });
  }

  if (user.causes_care_about && Array.isArray(user.causes_care_about) && user.causes_care_about.length > 0) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'causes',
      label: 'Add causes you care about',
      boost: 5,
      category: 'nil',
    });
  }

  if (user.hobbies && Array.isArray(user.hobbies) && user.hobbies.length > 0) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'hobbies',
      label: 'Add hobbies & lifestyle interests',
      boost: 5,
      category: 'nil',
    });
  }

  // NIL Preferences (10 points)
  if (user.nil_interests && Array.isArray(user.nil_interests) && user.nil_interests.length > 0) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'nil_interests',
      label: 'Add NIL interests',
      boost: 5,
      category: 'nil',
    });
  }

  if (user.nil_preferences && typeof user.nil_preferences === 'object' && Object.keys(user.nil_preferences).length > 0) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'nil_preferences',
      label: 'Set NIL deal preferences',
      boost: 5,
      category: 'nil',
    });
  }

  // Content/Media (15 points) — only scored when NIL is allowed in athlete's state
  if (includeContent) {
    if (user.content_samples && Array.isArray(user.content_samples) && user.content_samples.length > 0) {
      score += 15;
    } else {
      incompleteSections.push({
        id: 'content',
        label: 'Upload content samples',
        boost: 15,
        category: 'content',
      });
    }
  }

  const percentage = Math.min(Math.round((score / maxScore) * 100), 100);

  return {
    percentage,
    score,
    maxScore,
    incompleteSections: incompleteSections.sort((a, b) => b.boost - a.boost), // Sort by boost value
  };
}

/**
 * Get profile completion tier based on percentage
 */
export function getCompletionTier(percentage: number): {
  tier: 'incomplete' | 'basic' | 'good' | 'excellent';
  color: string;
  label: string;
} {
  if (percentage < 40) {
    return {
      tier: 'incomplete',
      color: 'from-red-400 to-red-500',
      label: 'Incomplete',
    };
  } else if (percentage < 70) {
    return {
      tier: 'basic',
      color: 'from-orange-400 to-orange-500',
      label: 'Basic',
    };
  } else if (percentage < 90) {
    return {
      tier: 'good',
      color: 'from-blue-400 to-blue-500',
      label: 'Good',
    };
  } else {
    return {
      tier: 'excellent',
      color: 'from-green-400 to-green-500',
      label: 'Excellent',
    };
  }
}

/**
 * Get missing fields by category
 */
export function getMissingSectionsByCategory(
  incompleteSections: ProfileSection[]
): Record<string, ProfileSection[]> {
  return incompleteSections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, ProfileSection[]>);
}
