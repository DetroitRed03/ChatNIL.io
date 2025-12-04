import { z } from 'zod';
import { UserRole } from '@/types';

// Base onboarding step interface
export interface OnboardingStep {
  id: string;
  title: string;
  fullTitle?: string;
  description?: string;
  fullDescription?: string;
  component: React.ComponentType<OnboardingStepProps>;
  validation?: z.ZodSchema<any>;
  isOptional?: boolean;
  allowSkip?: boolean;
}

export interface OnboardingStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  onSkip?: () => void;
  onSaveAndExit?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
  allowSkip?: boolean;
}

// Onboarding context state
export interface OnboardingState {
  role: UserRole | null;
  currentStepIndex: number;
  formData: Record<string, any>;
  completedSteps: string[];
  isLoading: boolean;
  hasStarted: boolean;
  profileCompletionPercentage: number;
  // Phase 6B: Two-tier onboarding support
  mode: 'standard' | 'completion';  // standard = full onboarding, completion = home completion only
  skipSteps: string[];              // Step IDs to skip in the flow
  prefilledData: Record<string, any>; // Data already collected (e.g., at school)
}

// Athlete onboarding schemas - relaxed for partial completion
export const athletePersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date').optional(),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  parentEmail: z.string().email('Parent email is required').optional(),
  heightInches: z.number().min(48, 'Height must be at least 48 inches').max(96, 'Height must be under 96 inches').optional(),
  weightLbs: z.number().min(80, 'Weight must be at least 80 lbs').max(400, 'Weight must be under 400 lbs').optional(),
});

export const athleteSchoolInfoSchema = z.object({
  schoolName: z.string().optional(),
  schoolLevel: z.enum(['high-school', 'college', 'university']).optional(),
  graduationYear: z.number().min(2024).max(2030, 'Please enter a valid graduation year').optional(),
  major: z.string().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
});

export const athleteSportsInfoSchema = z.object({
  primarySport: z.string().optional(),
  position: z.string().optional(),
  jerseyNumber: z.number().min(0, 'Jersey number must be 0 or greater').max(99, 'Jersey number must be 99 or less').optional(),
  secondarySports: z.array(z.string()).optional(),
  achievements: z.string().optional(),
  stats: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  coachName: z.string().optional(),
  coachEmail: z.string().email().optional(),
});

export const athleteNILInfoSchema = z.object({
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  socialMediaHandles: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
  brandInterests: z.array(z.string()).optional(),
  nilGoals: z.array(z.string()).optional(),
  hasAgent: z.boolean().optional(),
  agentInfo: z.string().optional(),
});

// Parent onboarding schemas - relaxed for partial completion
export const parentPersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  relationToAthlete: z.enum(['mother', 'father', 'guardian', 'other']).optional(),
  otherRelation: z.string().optional(),
});

export const parentAthleteInfoSchema = z.object({
  athleteFirstName: z.string().optional(),
  athleteLastName: z.string().optional(),
  athleteDateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date').optional(),
  athleteEmail: z.string().email('Athlete email is required').optional(),
  primarySport: z.string().optional(),
  schoolName: z.string().optional(),
  graduationYear: z.number().min(2024).max(2030).optional(),
});

export const parentNILConcernsSchema = z.object({
  concerns: z.array(z.string()).optional(),
  supportLevel: z.enum(['very-supportive', 'supportive', 'neutral', 'concerned', 'very-concerned']).optional(),
  questions: z.string().optional(),
  wantsUpdates: z.boolean().default(true),
});

// NEW SIMPLIFIED SCHEMAS FOR PARENT FLOWS

// Simplified Parent Flow Schemas
export const parentInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  relationshipType: z.enum(['mother', 'father', 'guardian', 'step_parent', 'other']),
});

export const childConnectionSchema = z.object({
  // Support for multiple athletes
  athletes: z.array(z.object({
    name: z.string().min(1, 'Athlete name is required'),
    email: z.string().email('Valid email is required'),
    school: z.string().optional(),
    sport: z.string().optional(),
    gradeLevel: z.enum(['freshman', 'sophomore', 'junior', 'senior', 'graduate']).optional(),
    hasNILDeals: z.enum(['yes', 'no', 'exploring']).optional(),
  })).min(1, 'At least one athlete is required'),

  // Global notification preferences for all athletes
  notificationPreferences: z.object({
    nilActivities: z.boolean().default(true),
    contractReviews: z.boolean().default(true),
    weeklyReports: z.boolean().default(true),
    emergencyAlerts: z.boolean().default(true),
  }).optional(),

  // Legacy fields for backward compatibility
  childEmail: z.string().optional(),
  childName: z.string().optional(),
  childSchool: z.string().optional(),
});

export const parentPreferencesSchema = z.object({
  // Dashboard access level
  dashboardAccess: z.enum(['full', 'limited', 'view_only']).default('limited'),

  // Involvement level (new field from plan)
  involvementLevel: z.enum(['active_monitoring', 'occasional_updates', 'emergency_only']).default('occasional_updates'),

  // Approval requirements
  approvalSettings: z.object({
    contractApproval: z.boolean().default(true),
    brandPartnerships: z.boolean().default(true),
    socialMediaPosts: z.boolean().default(false),
    financialDecisions: z.boolean().default(true),
  }).optional(),

  // Communication preferences
  communicationPrefs: z.object({
    preferredContact: z.enum(['email', 'phone', 'text', 'app']).default('email'),
    frequency: z.enum(['immediate', 'daily', 'weekly']).default('daily'),
    quietHours: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }).optional(),

  // Support goals (new field from plan)
  supportGoals: z.object({
    primaryConcerns: z.array(z.enum(['compliance', 'safety', 'academic_balance', 'financial_literacy'])).optional(),
    supportNeeds: z.array(z.enum(['education_resources', 'legal_guidance', 'financial_planning'])).optional(),
  }).optional(),
});


// Agency onboarding schemas
export const agencyCompanyInfoSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  company_size: z.string().min(1, 'Please select company size'),
  website_url: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

export const agencyTargetingSchema = z.object({
  budget_range: z.string().min(1, 'Please select a budget range'),
  campaign_interests: z.array(z.string()).min(1, 'Select at least one campaign type'),
  geographic_focus: z.array(z.string()).min(1, 'Select at least one geographic area'),
  target_demographics: z.object({
    age_range: z.string().optional(),
    gender: z.array(z.string()).optional(),
  }),
});

export const agencyBrandValuesSchema = z.object({
  brand_values: z.array(z.string()).min(1, 'Select at least one brand value'),
});

export const agencyVerificationSchema = z.object({
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  ready_for_verification: z.boolean().default(false),
});

// School onboarding schemas

// Athlete Enhancement schemas (Migration 016)
export const athleteSocialMediaSchema = z.object({
  social_media_stats: z.array(z.object({
    platform: z.enum(['instagram', 'tiktok', 'twitter', 'youtube', 'facebook', 'linkedin', 'twitch', 'snapchat']),
    handle: z.string(),
    followers: z.number(),
    engagement_rate: z.number(),
    verified: z.boolean(),
  })).optional(),
  skip_for_now: z.boolean().default(false),
});

export const athleteInterestsSchema = z.object({
  hobbies: z.array(z.string()).min(1),
  lifestyle_interests: z.array(z.string()).min(1),
  content_creation_interests: z.array(z.string()).min(1),
  brand_affinity: z.array(z.string()).optional(),
  causes_care_about: z.array(z.string()).optional(),
});

export const athleteNILPreferencesSchema = z.object({
  nil_preferences: z.object({
    preferred_deal_types: z.array(z.string()).min(1),
    min_compensation: z.number().optional(),
    max_compensation: z.number().optional(),
    preferred_partnership_length: z.string().optional(),
    content_types_willing: z.array(z.string()).min(1),
    blacklist_categories: z.array(z.string()).optional(),
    preferred_brand_sizes: z.array(z.string()).optional(),
    negotiation_flexibility: z.enum(['firm', 'somewhat_flexible', 'very_flexible']).optional(),
    requires_agent_approval: z.boolean().default(false),
    requires_parent_approval: z.boolean().default(false),
    exclusivity_willing: z.boolean().default(false),
    usage_rights_consideration: z.enum(['limited', 'standard', 'extended', 'perpetual']).optional(),
    travel_willing: z.boolean().default(false),
    max_travel_distance_miles: z.number().optional(),
    typical_response_time_hours: z.number().optional(),
    additional_notes: z.string().optional(),
  }),
});

export const athleteContentSamplesSchema = z.object({
  content_samples: z.array(z.object({
    type: z.enum(['instagram_post', 'instagram_story', 'tiktok_video', 'youtube_video', 'twitter_post', 'blog_post', 'other']),
    url: z.string().url(),
    description: z.string().optional(),
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional(),
    views: z.number().optional(),
    date: z.string(),
    sponsored: z.boolean(),
    brand: z.string().optional(),
    featured: z.boolean(),
  })).optional(),
  bio: z.string().max(500),
  profile_video_url: z.string().url().optional().or(z.literal('')),
  skip_samples: z.boolean().default(false),
}).refine((data) => {
  // If skipping, bio can be empty or any length (just needs to be under 500)
  if (data.skip_samples) return true;
  // If not skipping, bio must be at least 50 characters
  return data.bio.length >= 50;
}, {
  message: "Bio must be at least 50 characters or check 'Skip for now'",
  path: ['bio'],
});

// Combined schemas for type inference
export type AthletePersonalInfo = z.infer<typeof athletePersonalInfoSchema>;
export type AthleteSchoolInfo = z.infer<typeof athleteSchoolInfoSchema>;
export type AthleteSportsInfo = z.infer<typeof athleteSportsInfoSchema>;
export type AthleteNILInfo = z.infer<typeof athleteNILInfoSchema>;

export type ParentPersonalInfo = z.infer<typeof parentPersonalInfoSchema>;
export type ParentAthleteInfo = z.infer<typeof parentAthleteInfoSchema>;
export type ParentNILConcerns = z.infer<typeof parentNILConcernsSchema>;

// New simplified schema types
export type ParentInfo = z.infer<typeof parentInfoSchema>;
export type ChildConnection = z.infer<typeof childConnectionSchema>;
export type ParentPreferences = z.infer<typeof parentPreferencesSchema>;
export type AgencyCompanyInfo = z.infer<typeof agencyCompanyInfoSchema>;
export type AgencyTargeting = z.infer<typeof agencyTargetingSchema>;
export type AgencyBrandValues = z.infer<typeof agencyBrandValuesSchema>;
export type AgencyVerification = z.infer<typeof agencyVerificationSchema>;
export type AthleteSocialMedia = z.infer<typeof athleteSocialMediaSchema>;
export type AthleteInterests = z.infer<typeof athleteInterestsSchema>;
export type AthleteNILPreferences = z.infer<typeof athleteNILPreferencesSchema>;
export type AthleteContentSamples = z.infer<typeof athleteContentSamplesSchema>;

// Complete onboarding data types
export type AthleteOnboardingData = AthletePersonalInfo & AthleteSchoolInfo & AthleteSportsInfo & AthleteNILInfo;
export type ParentOnboardingData = ParentPersonalInfo & ParentAthleteInfo & ParentNILConcerns;

// New simplified onboarding data types
export type ParentSimplifiedData = ParentInfo & ChildConnection & ParentPreferences;
export type AgencyOnboardingData = AgencyCompanyInfo & AgencyTargeting & AgencyBrandValues & AgencyVerification;

export type OnboardingData = AthleteOnboardingData | ParentOnboardingData | ParentSimplifiedData | AgencyOnboardingData;

// Field weighting for completion calculation
export interface FieldWeight {
  fieldName: string;
  weight: number; // 1-5, where 5 is most important
  isRequired: boolean;
}

// Field weights by role for completion percentage calculation
export const FIELD_WEIGHTS: Record<UserRole, FieldWeight[]> = {
  athlete: [
    // Personal Info (40% total weight)
    { fieldName: 'firstName', weight: 5, isRequired: true },
    { fieldName: 'lastName', weight: 5, isRequired: true },
    { fieldName: 'email', weight: 5, isRequired: true },
    { fieldName: 'dateOfBirth', weight: 3, isRequired: false },
    { fieldName: 'phone', weight: 2, isRequired: false },
    { fieldName: 'parentEmail', weight: 2, isRequired: false },
    { fieldName: 'heightInches', weight: 2, isRequired: false },
    { fieldName: 'weightLbs', weight: 2, isRequired: false },

    // School Info (20% total weight)
    { fieldName: 'schoolName', weight: 3, isRequired: false },
    { fieldName: 'schoolLevel', weight: 3, isRequired: false },
    { fieldName: 'graduationYear', weight: 3, isRequired: false },
    { fieldName: 'major', weight: 2, isRequired: false },
    { fieldName: 'gpa', weight: 2, isRequired: false },

    // Sports Info (25% total weight)
    { fieldName: 'primarySport', weight: 4, isRequired: false },
    { fieldName: 'position', weight: 3, isRequired: false },
    { fieldName: 'jerseyNumber', weight: 2, isRequired: false },
    { fieldName: 'achievements', weight: 2, isRequired: false },
    { fieldName: 'coachName', weight: 2, isRequired: false },
    { fieldName: 'coachEmail', weight: 2, isRequired: false },

    // NIL Info (15% total weight)
    { fieldName: 'bio', weight: 3, isRequired: false },
    { fieldName: 'socialMediaHandles', weight: 2, isRequired: false },
    { fieldName: 'brandInterests', weight: 2, isRequired: false },
    { fieldName: 'nilGoals', weight: 2, isRequired: false },
  ],

  parent: [
    // Parent Info (40% total weight)
    { fieldName: 'firstName', weight: 5, isRequired: true },
    { fieldName: 'lastName', weight: 5, isRequired: true },
    { fieldName: 'email', weight: 5, isRequired: true },
    { fieldName: 'phone', weight: 3, isRequired: false },
    { fieldName: 'relationshipType', weight: 4, isRequired: true },

    // Child Connection (35% total weight)
    { fieldName: 'childEmail', weight: 5, isRequired: true },
    { fieldName: 'childName', weight: 4, isRequired: true },
    { fieldName: 'childSchool', weight: 3, isRequired: false },
    { fieldName: 'notificationPreferences', weight: 3, isRequired: false },

    // Preferences (25% total weight)
    { fieldName: 'dashboardAccess', weight: 4, isRequired: false },
    { fieldName: 'approvalSettings', weight: 3, isRequired: false },
    { fieldName: 'communicationPrefs', weight: 3, isRequired: false },
  ],

  agency: [
    // Company Info
    { fieldName: 'companyName', weight: 5, isRequired: true },
    { fieldName: 'email', weight: 5, isRequired: true },
    { fieldName: 'website', weight: 3, isRequired: false },
    { fieldName: 'industry', weight: 3, isRequired: false },
    { fieldName: 'companySize', weight: 2, isRequired: false },
    // Targeting
    { fieldName: 'targetSports', weight: 3, isRequired: false },
    { fieldName: 'budgetRange', weight: 3, isRequired: false },
    { fieldName: 'campaignTypes', weight: 3, isRequired: false },
    // Brand Values
    { fieldName: 'brandValues', weight: 3, isRequired: false },
    { fieldName: 'mission', weight: 2, isRequired: false },
  ],

  school: [
    // School admin - minimal for now
    { fieldName: 'schoolName', weight: 5, isRequired: true },
    { fieldName: 'email', weight: 5, isRequired: true },
    { fieldName: 'role', weight: 3, isRequired: false },
  ],

  business: [
    // Business - similar to agency
    { fieldName: 'businessName', weight: 5, isRequired: true },
    { fieldName: 'email', weight: 5, isRequired: true },
    { fieldName: 'industry', weight: 3, isRequired: false },
  ],
};

// Helper function to calculate profile completion percentage based on filled fields
export function calculateProfileCompletionPercentage(
  role: UserRole,
  formData: Record<string, any>
): number {
  const weights = FIELD_WEIGHTS[role];
  let totalWeight = 0;
  let completedWeight = 0;

  weights.forEach(({ fieldName, weight }) => {
    totalWeight += weight;

    const value = formData[fieldName];
    const isCompleted = isFieldCompleted(value);

    if (isCompleted) {
      completedWeight += weight;
    }
  });

  if (totalWeight === 0) return 0;
  return Math.round((completedWeight / totalWeight) * 100);
}

// Helper function to check if a field is considered completed
function isFieldCompleted(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    // For objects like socialMediaHandles, check if any field is filled
    return Object.values(value).some(v =>
      v !== null && v !== undefined && v !== ''
    );
  }
  return false;
}

// Helper function to get required fields count for a role
export function getRequiredFieldsCount(role: UserRole): number {
  return FIELD_WEIGHTS[role].filter(field => field.isRequired).length;
}

// Helper function to get total fields count for a role
export function getTotalFieldsCount(role: UserRole): number {
  return FIELD_WEIGHTS[role].length;
}