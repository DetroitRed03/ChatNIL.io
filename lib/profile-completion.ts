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
 * - Personal Info: 20 points (name, email, phone, DOB, bio)
 * - School Info: 15 points (school, year, major, GPA)
 * - Athletic Info: 20 points (sport, position, achievements)
 * - Social Media: 25 points (platform accounts)
 * - NIL Preferences: 10 points (interests, concerns)
 * - Content/Media: 10 points (portfolio items)
 */
export function calculateProfileCompletion(user: any): ProfileCompletionResult {
  let score = 0;
  const maxScore = 100;
  const incompleteSections: ProfileSection[] = [];

  // Personal Info (20 points)
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

  if (user.phone) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'phone',
      label: 'Add phone number',
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

  // School Info (15 points)
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

  if (user.major || user.gpa) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'academic',
      label: 'Add major or GPA',
      boost: 5,
      category: 'school',
    });
  }

  // Athletic Info (20 points)
  // Note: Database column is 'sport', not 'primary_sport'
  if (user.sport || user.primary_sport) {
    score += 7;
  } else {
    incompleteSections.push({
      id: 'sport',
      label: 'Add primary sport',
      boost: 7,
      category: 'athletic',
    });
  }

  if (user.position) {
    score += 7;
  } else {
    incompleteSections.push({
      id: 'position',
      label: 'Add position',
      boost: 7,
      category: 'athletic',
    });
  }

  if (user.achievements && Array.isArray(user.achievements) && user.achievements.length > 0) {
    score += 6;
  } else {
    incompleteSections.push({
      id: 'achievements',
      label: 'Add achievements',
      boost: 6,
      category: 'athletic',
    });
  }

  // Social Media (25 points - 8 points per platform, max 25)
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

  const socialMediaScore = Math.min(socialMediaCount * 8, 25);
  score += socialMediaScore;

  if (socialMediaScore < 25) {
    const remainingPlatforms = Math.ceil((25 - socialMediaScore) / 8);
    incompleteSections.push({
      id: 'social_media',
      label: `Connect ${remainingPlatforms} more social account${remainingPlatforms > 1 ? 's' : ''}`,
      boost: 25 - socialMediaScore,
      category: 'social',
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

  if (user.nil_concerns && Array.isArray(user.nil_concerns) && user.nil_concerns.length > 0) {
    score += 5;
  } else {
    incompleteSections.push({
      id: 'nil_concerns',
      label: 'Add NIL concerns',
      boost: 5,
      category: 'nil',
    });
  }

  // Content/Media (10 points)
  if (user.content_samples && Array.isArray(user.content_samples) && user.content_samples.length > 0) {
    score += 10;
  } else {
    incompleteSections.push({
      id: 'content',
      label: 'Upload content samples',
      boost: 10,
      category: 'content',
    });
  }

  const percentage = Math.min(Math.round(score), 100);

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
