/**
 * Agency Data Helpers
 *
 * Provides structured data options for agency/brand onboarding and profile management.
 * Used in forms, dropdowns, and multi-selects throughout the agency experience.
 */

export interface IndustryOption {
  value: string;
  label: string;
  description?: string;
}

export interface CompanySizeOption {
  value: string;
  label: string;
  employees: string;
}

export interface BudgetRangeOption {
  value: string;
  label: string;
  description: string;
}

// ============================================
// INDUSTRIES
// ============================================

export const INDUSTRIES: IndustryOption[] = [
  {
    value: 'sports_apparel',
    label: 'Sports Apparel & Equipment',
    description: 'Athletic wear, footwear, sports gear'
  },
  {
    value: 'food_beverage',
    label: 'Food & Beverage',
    description: 'Nutrition, supplements, beverages, restaurants'
  },
  {
    value: 'technology',
    label: 'Technology',
    description: 'Apps, software, electronics, gaming'
  },
  {
    value: 'automotive',
    label: 'Automotive',
    description: 'Cars, motorcycles, automotive accessories'
  },
  {
    value: 'financial_services',
    label: 'Financial Services',
    description: 'Banking, insurance, investment, fintech'
  },
  {
    value: 'health_wellness',
    label: 'Health & Wellness',
    description: 'Fitness, healthcare, mental health, wellness'
  },
  {
    value: 'entertainment_media',
    label: 'Entertainment & Media',
    description: 'Streaming, music, film, podcasts'
  },
  {
    value: 'retail',
    label: 'Retail & E-commerce',
    description: 'Online stores, marketplaces, consumer goods'
  },
  {
    value: 'education',
    label: 'Education',
    description: 'EdTech, tutoring, courses, training'
  },
  {
    value: 'travel_hospitality',
    label: 'Travel & Hospitality',
    description: 'Hotels, airlines, tourism, experiences'
  },
  {
    value: 'beauty_personal_care',
    label: 'Beauty & Personal Care',
    description: 'Skincare, haircare, cosmetics, grooming'
  },
  {
    value: 'gaming_esports',
    label: 'Gaming & Esports',
    description: 'Video games, esports teams, gaming platforms'
  },
  {
    value: 'nonprofit_social_impact',
    label: 'Nonprofit & Social Impact',
    description: 'Charities, advocacy, community organizations'
  },
  {
    value: 'professional_services',
    label: 'Professional Services',
    description: 'Consulting, legal, accounting, HR'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Industry not listed'
  }
];

// ============================================
// COMPANY SIZES
// ============================================

export const COMPANY_SIZES: CompanySizeOption[] = [
  { value: '1-10', label: '1-10 employees', employees: 'Startup / Small Business' },
  { value: '11-50', label: '11-50 employees', employees: 'Small Business' },
  { value: '51-200', label: '51-200 employees', employees: 'Mid-Size Company' },
  { value: '201-500', label: '201-500 employees', employees: 'Large Company' },
  { value: '500+', label: '500+ employees', employees: 'Enterprise' }
];

// ============================================
// BUDGET RANGES
// ============================================

export const BUDGET_RANGES: BudgetRangeOption[] = [
  {
    value: 'under_5k',
    label: 'Under $5,000',
    description: 'Micro-influencer campaigns, social media posts'
  },
  {
    value: '5k_25k',
    label: '$5,000 - $25,000',
    description: 'Local campaigns, smaller partnerships'
  },
  {
    value: '25k_100k',
    label: '$25,000 - $100,000',
    description: 'Multi-platform campaigns, mid-tier athletes'
  },
  {
    value: '100k_500k',
    label: '$100,000 - $500,000',
    description: 'Major campaigns, high-profile athletes'
  },
  {
    value: '500k_plus',
    label: '$500,000+',
    description: 'Premium partnerships, national campaigns'
  }
];

// ============================================
// CAMPAIGN INTERESTS
// ============================================

export const CAMPAIGN_TYPES = [
  { value: 'social_media', label: 'Social Media Posts', description: 'Instagram, TikTok, Twitter posts' },
  { value: 'endorsement', label: 'Product Endorsement', description: 'Long-term brand ambassadorship' },
  { value: 'appearance', label: 'Event Appearances', description: 'In-person events, signings, meet & greets' },
  { value: 'content_creation', label: 'Content Creation', description: 'Videos, blogs, podcasts' },
  { value: 'influencer_marketing', label: 'Influencer Marketing', description: 'Paid social campaigns' },
  { value: 'autograph_sessions', label: 'Autograph Sessions', description: 'Signing events and memorabilia' },
  { value: 'speaking_engagements', label: 'Speaking Engagements', description: 'Conferences, panels, workshops' },
  { value: 'charity_partnerships', label: 'Charity Partnerships', description: 'Cause marketing, fundraising' },
  { value: 'product_collaboration', label: 'Product Collaboration', description: 'Co-branded products, design input' },
  { value: 'streaming', label: 'Live Streaming', description: 'Twitch, YouTube Live, gaming content' }
];

// ============================================
// GEOGRAPHIC FOCUS
// ============================================

export const US_REGIONS = [
  { value: 'national', label: 'National (All US)' },
  { value: 'northeast', label: 'Northeast' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'midwest', label: 'Midwest' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'west', label: 'West Coast' },
  { value: 'international', label: 'International' }
];

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' }
];

// ============================================
// BRAND VALUES
// ============================================

export const BRAND_VALUES = [
  { value: 'sustainability', label: 'Sustainability', emoji: '🌱' },
  { value: 'diversity', label: 'Diversity & Inclusion', emoji: '🤝' },
  { value: 'innovation', label: 'Innovation', emoji: '💡' },
  { value: 'performance', label: 'Performance Excellence', emoji: '🏆' },
  { value: 'authenticity', label: 'Authenticity', emoji: '✨' },
  { value: 'community', label: 'Community Focus', emoji: '🏘️' },
  { value: 'health', label: 'Health & Wellness', emoji: '💪' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'social_responsibility', label: 'Social Responsibility', emoji: '🌍' },
  { value: 'youth_empowerment', label: 'Youth Empowerment', emoji: '🌟' },
  { value: 'equality', label: 'Equality & Justice', emoji: '⚖️' },
  { value: 'transparency', label: 'Transparency', emoji: '🔍' },
  { value: 'family_friendly', label: 'Family-Friendly', emoji: '👨‍👩‍👧‍👦' },
  { value: 'local_first', label: 'Local First', emoji: '📍' },
  { value: 'quality', label: 'Quality', emoji: '💎' }
];

// ============================================
// TARGET DEMOGRAPHICS
// ============================================

export const AGE_RANGES = [
  { value: '13-17', label: '13-17 (High School)', min: 13, max: 17 },
  { value: '18-24', label: '18-24 (College)', min: 18, max: 24 },
  { value: '25-34', label: '25-34 (Young Adults)', min: 25, max: 34 },
  { value: '35-44', label: '35-44 (Adults)', min: 35, max: 44 },
  { value: '45-54', label: '45-54 (Mid-Age)', min: 45, max: 54 },
  { value: '55+', label: '55+ (Seniors)', min: 55, max: 120 }
];

export const GENDER_OPTIONS = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-Binary' }
];

export const INTEREST_CATEGORIES = [
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'soccer', label: 'Soccer', icon: '⚽' },
  { value: 'track_field', label: 'Track & Field', icon: '🏃' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'golf', label: 'Golf', icon: '⛳' },
  { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { value: 'wrestling', label: 'Wrestling', icon: '🤼' },
  { value: 'gymnastics', label: 'Gymnastics', icon: '🤸' },
  { value: 'esports', label: 'Esports', icon: '🎮' },
  { value: 'fitness', label: 'Fitness & Training', icon: '💪' },
  { value: 'lifestyle', label: 'Lifestyle', icon: '✨' },
  { value: 'fashion', label: 'Fashion', icon: '👗' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'entrepreneurship', label: 'Entrepreneurship', icon: '💼' },
  { value: 'social_justice', label: 'Social Justice', icon: '✊' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get industry label by value
 */
export function getIndustryLabel(value: string): string {
  return INDUSTRIES.find(i => i.value === value)?.label || value;
}

/**
 * Get company size label by value
 */
export function getCompanySizeLabel(value: string): string {
  return COMPANY_SIZES.find(s => s.value === value)?.label || value;
}

/**
 * Get budget range label by value
 */
export function getBudgetRangeLabel(value: string): string {
  return BUDGET_RANGES.find(b => b.value === value)?.label || value;
}

/**
 * Get campaign type label by value
 */
export function getCampaignTypeLabel(value: string): string {
  return CAMPAIGN_TYPES.find(c => c.value === value)?.label || value;
}

/**
 * Get brand value label by value
 */
export function getBrandValueLabel(value: string): string {
  return BRAND_VALUES.find(v => v.value === value)?.label || value;
}

/**
 * Format geographic focus array for display
 */
export function formatGeographicFocus(values: string[]): string {
  if (!values || values.length === 0) return 'Not specified';
  if (values.includes('national')) return 'National (All US)';

  const regions = values.filter(v => US_REGIONS.some(r => r.value === v));
  const states = values.filter(v => US_STATES.some(s => s.value === v));

  const parts = [];
  if (regions.length > 0) {
    parts.push(regions.map(r => US_REGIONS.find(reg => reg.value === r)?.label).join(', '));
  }
  if (states.length > 0) {
    parts.push(`${states.length} state${states.length > 1 ? 's' : ''}`);
  }

  return parts.join(' + ') || values.join(', ');
}

/**
 * Validate website URL
 */
export function isValidWebsiteUrl(url: string): boolean {
  if (!url) return true; // Optional field

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Format website URL (ensure it has protocol)
 */
export function formatWebsiteUrl(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}
