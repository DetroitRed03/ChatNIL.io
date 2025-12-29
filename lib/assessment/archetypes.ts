/**
 * Archetype Data and Utilities
 *
 * Predefined athlete archetypes with their defining traits,
 * descriptions, and AI personalization hints.
 */

import type { TraitArchetype, TraitCode, TraitScores } from './types';

// ============================================================
// Archetype Definitions
// ============================================================

export const ARCHETYPES: TraitArchetype[] = [
  {
    id: 'archetype-captain',
    code: 'captain',
    name: 'The Captain',
    description:
      'A natural leader who inspires through actions and words. You command respect and bring out the best in everyone around you.',
    definingTraits: {
      leadership: { min: 75 },
      teamwork: { min: 60 },
      resilience: { min: 60 },
    },
    exampleAthletes: ['Tom Brady', 'Megan Rapinoe', 'Derek Jeter'],
    aiPersonalityHint:
      'Respond with leadership-focused language. Emphasize team impact, legacy, and inspiring others.',
    iconName: 'Crown',
    colorHex: '#FFD700',
  },
  {
    id: 'archetype-trailblazer',
    code: 'trailblazer',
    name: 'The Trailblazer',
    description:
      "An innovator who breaks the mold. You see opportunities others miss and aren't afraid to be first.",
    definingTraits: {
      innovation: { min: 75 },
      creativity: { min: 70 },
      ambition: { min: 60 },
    },
    exampleAthletes: ['Naomi Osaka', 'Colin Kaepernick', "Sha'Carri Richardson"],
    aiPersonalityHint:
      'Emphasize unique opportunities, being first-to-market, and unconventional partnerships.',
    iconName: 'Zap',
    colorHex: '#FF6B6B',
  },
  {
    id: 'archetype-champion',
    code: 'champion',
    name: 'The Champion',
    description:
      "Driven by an unrelenting desire to win. You're focused, disciplined, and let your performance speak loudest.",
    definingTraits: {
      competition: { min: 80 },
      discipline: { min: 70 },
      resilience: { min: 65 },
    },
    exampleAthletes: ['Michael Jordan', 'Serena Williams', 'Kobe Bryant'],
    aiPersonalityHint:
      'Focus on performance-based deals, winning mindset, and results-driven partnerships.',
    iconName: 'Trophy',
    colorHex: '#4CAF50',
  },
  {
    id: 'archetype-ambassador',
    code: 'ambassador',
    name: 'The Ambassador',
    description:
      "Your platform is for something bigger. You're driven by causes and making a genuine impact in communities.",
    definingTraits: {
      community_focus: { min: 80 },
      authenticity: { min: 70 },
      loyalty: { min: 60 },
    },
    exampleAthletes: ['LeBron James', 'Marcus Rashford', 'Maya Moore'],
    aiPersonalityHint:
      'Prioritize cause-aligned partnerships, community impact, and authentic storytelling.',
    iconName: 'Heart',
    colorHex: '#E91E63',
  },
  {
    id: 'archetype-entertainer',
    code: 'entertainer',
    name: 'The Entertainer',
    description:
      'You light up any room and captivate audiences. Your charisma and creativity make brands come to you.',
    definingTraits: {
      charisma: { min: 75 },
      creativity: { min: 70 },
      authenticity: { min: 60 },
    },
    exampleAthletes: ["Shaquille O'Neal", 'Patrick Mahomes', 'Simone Biles'],
    aiPersonalityHint:
      'Focus on content opportunities, audience engagement, and personality-driven campaigns.',
    iconName: 'Sparkles',
    colorHex: '#673AB7',
  },
  {
    id: 'archetype-purist',
    code: 'purist',
    name: 'The Purist',
    description:
      'Your craft comes first. You prefer partnerships that honor the sport and your dedication to excellence.',
    definingTraits: {
      discipline: { min: 80 },
      authenticity: { min: 75 },
      competition: { min: 60 },
    },
    exampleAthletes: ['Tim Duncan', 'Russell Wilson', 'Kawhi Leonard'],
    aiPersonalityHint:
      'Emphasize sports equipment, training, and performance-focused brands. Minimal but quality partnerships.',
    iconName: 'Target',
    colorHex: '#607D8B',
  },
  {
    id: 'archetype-connector',
    code: 'connector',
    name: 'The Connector',
    description:
      'You build bridges between worlds. Your network is your superpower, and you elevate everyone in your circle.',
    definingTraits: {
      teamwork: { min: 75 },
      loyalty: { min: 70 },
      charisma: { min: 65 },
    },
    exampleAthletes: ['Chris Paul', 'Sue Bird', 'Draymond Green'],
    aiPersonalityHint:
      'Focus on collaborative opportunities, team-oriented brands, and relationship-building deals.',
    iconName: 'Users',
    colorHex: '#00BCD4',
  },
  {
    id: 'archetype-builder',
    code: 'builder',
    name: 'The Builder',
    description:
      "You're playing the long game. Every deal is a step toward your empire, and you think like a CEO.",
    definingTraits: {
      ambition: { min: 80 },
      innovation: { min: 65 },
      discipline: { min: 65 },
    },
    exampleAthletes: ['Magic Johnson', 'Venus Williams', 'David Beckham'],
    aiPersonalityHint:
      'Emphasize equity deals, long-term partnerships, business ownership, and brand building.',
    iconName: 'Rocket',
    colorHex: '#FF9800',
  },
];

// ============================================================
// Archetype Utilities
// ============================================================

/**
 * Get an archetype by its code
 */
export function getArchetypeByCode(code: string): TraitArchetype | undefined {
  return ARCHETYPES.find((a) => a.code === code);
}

/**
 * Get the AI personality hint for an archetype
 */
export function getArchetypeAIHint(code: string): string {
  const archetype = getArchetypeByCode(code);
  return archetype?.aiPersonalityHint || '';
}

/**
 * Get all archetype codes
 */
export function getArchetypeCodes(): string[] {
  return ARCHETYPES.map((a) => a.code);
}

/**
 * Get archetypes sorted by how well a user matches them
 */
export function getRankedArchetypes(scores: TraitScores): Array<{
  archetype: TraitArchetype;
  matchScore: number;
  meetsRequirements: boolean;
}> {
  return ARCHETYPES.map((archetype) => {
    let matchScore = 0;
    let meetsRequirements = true;

    for (const [trait, requirement] of Object.entries(archetype.definingTraits)) {
      const userScore = scores[trait as TraitCode] || 0;
      const minRequired = requirement?.min || 0;

      if (userScore >= minRequired) {
        // Bonus for exceeding requirements
        matchScore += 100 + (userScore - minRequired);
      } else {
        // Penalty for not meeting requirements
        meetsRequirements = false;
        matchScore += (userScore / minRequired) * 100;
      }
    }

    // Normalize by number of defining traits
    const numTraits = Object.keys(archetype.definingTraits).length;
    matchScore = numTraits > 0 ? matchScore / numTraits : 0;

    return { archetype, matchScore, meetsRequirements };
  }).sort((a, b) => {
    // Prioritize archetypes where user meets all requirements
    if (a.meetsRequirements && !b.meetsRequirements) return -1;
    if (!a.meetsRequirements && b.meetsRequirements) return 1;
    // Then sort by match score
    return b.matchScore - a.matchScore;
  });
}

/**
 * Get a detailed breakdown of how a user matches an archetype
 */
export function getArchetypeMatchBreakdown(
  scores: TraitScores,
  archetype: TraitArchetype
): Array<{
  trait: TraitCode;
  userScore: number;
  requiredScore: number;
  meetsRequirement: boolean;
  percentage: number;
}> {
  return Object.entries(archetype.definingTraits).map(([trait, requirement]) => {
    const traitCode = trait as TraitCode;
    const userScore = scores[traitCode] || 0;
    const requiredScore = requirement?.min || 0;
    const meetsRequirement = userScore >= requiredScore;
    const percentage = requiredScore > 0 ? Math.min(100, (userScore / requiredScore) * 100) : 100;

    return {
      trait: traitCode,
      userScore,
      requiredScore,
      meetsRequirement,
      percentage: Math.round(percentage),
    };
  });
}

/**
 * Generate personalized archetype description based on user's specific scores
 */
export function getPersonalizedArchetypeDescription(
  archetype: TraitArchetype,
  scores: TraitScores,
  topTraits: TraitCode[]
): string {
  const matchBreakdown = getArchetypeMatchBreakdown(scores, archetype);
  const strongestMatch = matchBreakdown.reduce((a, b) =>
    a.percentage > b.percentage ? a : b
  );

  // Base description
  let description = archetype.description;

  // Add personalization based on strongest trait
  if (strongestMatch.percentage >= 100) {
    const traitNames: Record<TraitCode, string> = {
      leadership: 'leadership',
      creativity: 'creativity',
      community_focus: 'community focus',
      competition: 'competitive drive',
      authenticity: 'authenticity',
      resilience: 'resilience',
      teamwork: 'teamwork',
      ambition: 'ambition',
      charisma: 'charisma',
      discipline: 'discipline',
      innovation: 'innovation',
      loyalty: 'loyalty',
    };

    description += ` Your exceptional ${traitNames[strongestMatch.trait]} makes you a standout in this archetype.`;
  }

  return description;
}

/**
 * Get brand partnership recommendations based on archetype
 */
export function getArchetypeBrandRecommendations(code: string): string[] {
  const recommendations: Record<string, string[]> = {
    captain: [
      'Team-focused brands (Nike Team, Under Armour)',
      'Leadership development programs',
      'Youth sports organizations',
      'Motivational speaking opportunities',
      'Sports media commentary',
    ],
    trailblazer: [
      'Emerging tech companies',
      'Sustainability-focused brands',
      'Fashion and lifestyle brands seeking disruption',
      'Startups and venture opportunities',
      'Social media platform partnerships',
    ],
    champion: [
      'Performance equipment brands',
      'Elite training programs',
      'Luxury watch and car brands',
      'Achievement-focused campaigns',
      'Championship merchandise',
    ],
    ambassador: [
      'Nonprofit organizations',
      'Cause-marketing campaigns',
      'Community-focused businesses',
      'Education and scholarship programs',
      'Social impact initiatives',
    ],
    entertainer: [
      'Entertainment and media companies',
      'Gaming and esports brands',
      'Food and beverage brands',
      'Consumer electronics',
      'Social media campaigns',
    ],
    purist: [
      'Premium sports equipment',
      'Training and recovery products',
      'Sports nutrition brands',
      'Athletic apparel (technical focus)',
      'Sports science and analytics',
    ],
    connector: [
      'Team and collaboration tools',
      'Professional networking platforms',
      'Event and hospitality brands',
      'Financial services',
      'Real estate and lifestyle',
    ],
    builder: [
      'Business and investment opportunities',
      'Equity partnerships',
      'Personal finance and wealth management',
      'Entrepreneurship platforms',
      'Long-term brand ambassador roles',
    ],
  };

  return recommendations[code] || [];
}

/**
 * Get content strategy recommendations based on archetype
 */
export function getArchetypeContentStrategy(code: string): {
  primaryFocus: string;
  contentTypes: string[];
  postingFrequency: string;
  tone: string;
} {
  const strategies: Record<
    string,
    {
      primaryFocus: string;
      contentTypes: string[];
      postingFrequency: string;
      tone: string;
    }
  > = {
    captain: {
      primaryFocus: 'Team moments and leadership insights',
      contentTypes: [
        'Team celebrations',
        'Leadership quotes',
        'Motivational messages',
        'Behind-the-scenes team content',
      ],
      postingFrequency: 'Moderate (3-4x per week)',
      tone: 'Inspirational and commanding',
    },
    trailblazer: {
      primaryFocus: 'Innovation and breaking boundaries',
      contentTypes: [
        'First-to-try experiences',
        'Hot takes and opinions',
        'Creative collaborations',
        'Trend-setting content',
      ],
      postingFrequency: 'High when inspired, quality over quantity',
      tone: 'Bold and authentic',
    },
    champion: {
      primaryFocus: 'Performance and results',
      contentTypes: ['Training clips', 'Victory celebrations', 'Stats and achievements', 'Workout routines'],
      postingFrequency: 'Moderate, focused on wins',
      tone: 'Confident and results-driven',
    },
    ambassador: {
      primaryFocus: 'Cause and community impact',
      contentTypes: [
        'Community service',
        'Cause advocacy',
        'Personal stories',
        'Fan interactions',
      ],
      postingFrequency: 'Consistent (4-5x per week)',
      tone: 'Warm and purpose-driven',
    },
    entertainer: {
      primaryFocus: 'Entertainment and engagement',
      contentTypes: ['Funny moments', 'Challenges and trends', 'Collaborations', 'Interactive content'],
      postingFrequency: 'High (daily or more)',
      tone: 'Fun and charismatic',
    },
    purist: {
      primaryFocus: 'Craft and dedication',
      contentTypes: ['Training content', 'Technique breakdowns', 'Equipment reviews', 'Sport-focused content'],
      postingFrequency: 'Lower but high-quality',
      tone: 'Professional and focused',
    },
    connector: {
      primaryFocus: 'Relationships and collaboration',
      contentTypes: [
        'Teammate features',
        'Industry connections',
        'Event coverage',
        'Networking moments',
      ],
      postingFrequency: 'Moderate with strong engagement',
      tone: 'Friendly and inclusive',
    },
    builder: {
      primaryFocus: 'Business and growth',
      contentTypes: [
        'Business ventures',
        'Investment insights',
        'Long-term goals',
        'Professional development',
      ],
      postingFrequency: 'Strategic and planned',
      tone: 'Professional and visionary',
    },
  };

  return (
    strategies[code] || {
      primaryFocus: 'Personal brand development',
      contentTypes: ['Mixed content'],
      postingFrequency: 'Regular',
      tone: 'Authentic',
    }
  );
}
