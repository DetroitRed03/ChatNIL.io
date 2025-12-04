import { UserRole } from '@/types';
import { OnboardingStep, calculateProfileCompletionPercentage } from '@/lib/onboarding-types';
import {
  athletePersonalInfoSchema,
  athleteSchoolInfoSchema,
  athleteSportsInfoSchema,
  athleteNILInfoSchema,
  athleteSocialMediaSchema,
  athleteInterestsSchema,
  athleteNILPreferencesSchema,
  athleteContentSamplesSchema,
  parentInfoSchema,
  childConnectionSchema,
  parentPreferencesSchema,
  agencyCompanyInfoSchema,
  agencyTargetingSchema,
  agencyBrandValuesSchema,
  agencyVerificationSchema,
} from '@/lib/onboarding-types';

// Import step components
import AthletePersonalInfoStep from '@/components/onboarding/steps/AthletePersonalInfoStep';
import AthleteSchoolInfoStep from '@/components/onboarding/steps/AthleteSchoolInfoStep';
import AthleteSportsInfoStep from '@/components/onboarding/steps/AthleteSportsInfoStep';
import AthleteNILInfoStep from '@/components/onboarding/steps/AthleteNILInfoStep';
import ParentInfoStep from '@/components/onboarding/steps/ParentInfoStep';
import ChildConnectionStep from '@/components/onboarding/steps/ChildConnectionStep';
import ParentPreferencesStep from '@/components/onboarding/steps/ParentPreferencesStep';
import AgencyCompanyInfoStep from '@/components/onboarding/steps/AgencyCompanyInfoStep';
import AgencyTargetingStep from '@/components/onboarding/steps/AgencyTargetingStep';
import AgencyBrandValuesStep from '@/components/onboarding/steps/AgencyBrandValuesStep';
import AgencyVerificationStep from '@/components/onboarding/steps/AgencyVerificationStep';
import AthleteSocialMediaStep from '@/components/onboarding/steps/AthleteSocialMediaStep';
import AthleteInterestsStep from '@/components/onboarding/steps/AthleteInterestsStep';
import AthleteNILPreferencesStep from '@/components/onboarding/steps/AthleteNILPreferencesStep';
import AthleteContentSamplesStep from '@/components/onboarding/steps/AthleteContentSamplesStep';
// Phase 6B
import WelcomeBackStep from '@/components/onboarding/athlete-enhanced/WelcomeBackStep';

// Athlete onboarding flow
const athleteSteps: OnboardingStep[] = [
  {
    id: 'athlete-personal',
    title: 'Personal Info',
    fullTitle: 'Personal Information',
    description: 'Basic details about you',
    fullDescription: 'Tell us about yourself',
    component: AthletePersonalInfoStep,
    validation: athletePersonalInfoSchema,
  },
  {
    id: 'athlete-school',
    title: 'School Info',
    fullTitle: 'School Information',
    description: 'Academic details',
    fullDescription: 'Your academic details',
    component: AthleteSchoolInfoStep,
    validation: athleteSchoolInfoSchema,
  },
  {
    id: 'athlete-sports',
    title: 'Athletic Info',
    fullTitle: 'Athletic Information',
    description: 'Sports and achievements',
    fullDescription: 'Your sports and achievements',
    component: AthleteSportsInfoStep,
    validation: athleteSportsInfoSchema,
  },
  {
    id: 'athlete-nil',
    title: 'NIL Interests',
    description: 'Goals and brand interests',
    fullDescription: 'Your goals and brand interests',
    component: AthleteNILInfoStep,
    validation: athleteNILInfoSchema,
    isOptional: true,
  },
  {
    id: 'athlete-social-media',
    title: 'Social Media',
    fullTitle: 'Social Media Presence',
    description: 'Your social media stats',
    fullDescription: 'Share your social media presence and engagement',
    component: AthleteSocialMediaStep,
    validation: athleteSocialMediaSchema,
    isOptional: true,
  },
  {
    id: 'athlete-interests',
    title: 'Interests',
    fullTitle: 'Interests & Passions',
    description: 'Your hobbies and interests',
    fullDescription: 'Tell us about your interests and what you care about',
    component: AthleteInterestsStep,
    validation: athleteInterestsSchema,
    isOptional: true,
  },
  {
    id: 'athlete-nil-preferences',
    title: 'NIL Preferences',
    fullTitle: 'Partnership Preferences',
    description: 'Your deal preferences',
    fullDescription: 'Set your NIL partnership preferences and requirements',
    component: AthleteNILPreferencesStep,
    validation: athleteNILPreferencesSchema,
    isOptional: true,
  },
  {
    id: 'athlete-content-samples',
    title: 'Portfolio',
    fullTitle: 'Portfolio & Bio',
    description: 'Your content and bio',
    fullDescription: 'Showcase your best content and tell your story',
    component: AthleteContentSamplesStep,
    validation: athleteContentSamplesSchema,
    isOptional: true,
  },
];

// Parent onboarding flow - simplified to 3 focused steps
const parentSteps: OnboardingStep[] = [
  {
    id: 'parent-info',
    title: 'Parent Info',
    fullTitle: 'Parent Information',
    description: 'Your profile and relationship',
    fullDescription: 'Tell us about yourself and your relationship to your athlete',
    component: ParentInfoStep,
    validation: parentInfoSchema,
  },
  {
    id: 'child-connection',
    title: 'Connect Athlete',
    fullTitle: 'Connect with Your Athlete',
    description: 'Link athlete account',
    fullDescription: 'Link your athlete\'s account and set notification preferences',
    component: ChildConnectionStep,
    validation: childConnectionSchema,
  },
  {
    id: 'parent-preferences',
    title: 'Oversight',
    fullTitle: 'Oversight Preferences',
    description: 'Dashboard and approval settings',
    fullDescription: 'Configure your dashboard access and approval settings',
    component: ParentPreferencesStep,
    validation: parentPreferencesSchema,
  },
];

// Agency onboarding flow
const agencySteps: OnboardingStep[] = [
  {
    id: 'agency-company',
    title: 'Company Info',
    fullTitle: 'Company Information',
    description: 'Brand and company details',
    fullDescription: 'Tell us about your brand or agency',
    component: AgencyCompanyInfoStep,
    validation: agencyCompanyInfoSchema,
  },
  {
    id: 'agency-targeting',
    title: 'Campaign Targeting',
    fullTitle: 'Campaign Targeting',
    description: 'Target audience and budget',
    fullDescription: 'Define your ideal partnerships and audience',
    component: AgencyTargetingStep,
    validation: agencyTargetingSchema,
  },
  {
    id: 'agency-values',
    title: 'Brand Values',
    fullTitle: 'Brand Values',
    description: 'What your brand stands for',
    fullDescription: 'Share your brand values and mission',
    component: AgencyBrandValuesStep,
    validation: agencyBrandValuesSchema,
  },
  {
    id: 'agency-verification',
    title: 'Verification',
    fullTitle: 'Account Verification',
    description: 'Terms and verification',
    fullDescription: 'Accept terms and submit for verification',
    component: AgencyVerificationStep,
    validation: agencyVerificationSchema,
  },
];


// ===== PHASE 6B: ATHLETE HOME COMPLETION FLOW =====
// This flow is for students who signed up at school with minimal info
// and now need to complete their profile at home
const athleteHomeCompletionSteps: OnboardingStep[] = [
  {
    id: 'welcome-back',
    title: 'Welcome',
    fullTitle: 'Welcome Back',
    description: 'Complete your profile',
    fullDescription: 'Complete your profile to unlock NIL opportunities',
    component: WelcomeBackStep,
  },
  {
    id: 'athlete-personal',
    title: 'Personal Info',
    fullTitle: 'Complete Your Personal Information',
    description: 'Email, phone, and contact details',
    fullDescription: 'Add your personal contact information',
    component: AthletePersonalInfoStep,
    validation: athletePersonalInfoSchema,
  },
  {
    id: 'athlete-sports',
    title: 'Athletic Details',
    fullTitle: 'Athletic Information',
    description: 'Position and achievements',
    fullDescription: 'Tell us more about your athletic career',
    component: AthleteSportsInfoStep,
    validation: athleteSportsInfoSchema,
  },
  {
    id: 'athlete-interests',
    title: 'Interests',
    fullTitle: 'Interests & Passions',
    description: 'Your hobbies and interests',
    fullDescription: 'Tell us what you care about',
    component: AthleteInterestsStep,
    validation: athleteInterestsSchema,
    isOptional: true,
  },
  {
    id: 'athlete-social-media',
    title: 'Social Media',
    fullTitle: 'Social Media Presence',
    description: 'Connect your accounts',
    fullDescription: 'Link your social media for better opportunities',
    component: AthleteSocialMediaStep,
    validation: athleteSocialMediaSchema,
    isOptional: true,
  },
  {
    id: 'athlete-nil-preferences',
    title: 'NIL Preferences',
    fullTitle: 'Partnership Preferences',
    description: 'Your deal preferences',
    fullDescription: 'Tell us about your ideal NIL partnerships',
    component: AthleteNILPreferencesStep,
    validation: athleteNILPreferencesSchema,
    isOptional: true,
  },
  {
    id: 'athlete-content-samples',
    title: 'Content Samples',
    fullTitle: 'Content Portfolio',
    description: 'Show your best work',
    fullDescription: 'Upload samples of your content creation',
    component: AthleteContentSamplesStep,
    validation: athleteContentSamplesSchema,
    isOptional: true,
  },
];

// Registry mapping roles to their steps
export const onboardingRegistry: Record<UserRole, OnboardingStep[]> = {
  athlete: athleteSteps,
  parent: parentSteps,
  agency: agencySteps,
  school: [], // School admin flow - not yet implemented
  business: [], // Business flow - uses agency steps or custom
};

// Utility functions
export function getStepsForRole(role: UserRole): OnboardingStep[] {
  return onboardingRegistry[role] || [];
}

// Phase 6B: Get onboarding flow based on role and mode
export function getOnboardingFlow(
  role: UserRole,
  mode: 'standard' | 'completion' = 'standard'
): OnboardingStep[] {
  if (role === 'athlete' && mode === 'completion') {
    return athleteHomeCompletionSteps;
  }

  // Default to standard flow for all other cases
  return getStepsForRole(role);
}

export function getStepById(role: UserRole, stepId: string): OnboardingStep | undefined {
  const steps = getStepsForRole(role);
  return steps.find(step => step.id === stepId);
}

export function getStepByIndex(role: UserRole, index: number): OnboardingStep | undefined {
  const steps = getStepsForRole(role);
  return steps[index];
}

export function getTotalSteps(role: UserRole): number {
  return getStepsForRole(role).length;
}

export function getNextStepIndex(role: UserRole, currentIndex: number): number | null {
  const totalSteps = getTotalSteps(role);
  const nextIndex = currentIndex + 1;
  return nextIndex < totalSteps ? nextIndex : null;
}

export function getPreviousStepIndex(currentIndex: number): number | null {
  return currentIndex > 0 ? currentIndex - 1 : null;
}

// Step-based progress calculation (legacy)
export function calculateProgress(role: UserRole, currentStepIndex: number): number {
  const totalSteps = getTotalSteps(role);
  if (totalSteps === 0) return 0;
  return Math.round(((currentStepIndex + 1) / totalSteps) * 100);
}

// Field-based progress calculation (preferred)
export function calculateProgressFromData(role: UserRole, formData: Record<string, any>): number {
  return calculateProfileCompletionPercentage(role, formData);
}

// Step validation utilities
export function validateStepData(role: UserRole, stepId: string, data: any): { success: boolean; errors?: any } {
  const step = getStepById(role, stepId);
  if (!step || !step.validation) {
    return { success: true };
  }

  try {
    step.validation.parse(data);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      errors: error.errors || error.message,
    };
  }
}

// Persistence keys for localStorage
export const ONBOARDING_STORAGE_KEYS = {
  STATE: 'chatnil-onboarding-state',
  FORM_DATA: 'chatnil-onboarding-data',
} as const;