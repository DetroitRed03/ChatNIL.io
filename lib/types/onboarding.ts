// User roles for the 4-role compliance platform
export type UserRole = 'hs_student' | 'college_athlete' | 'parent' | 'compliance_officer';

// Learning paths based on user readiness
export type LearningPath = 'foundation' | 'transition' | 'activation';

// Consent status for minors
export type ConsentStatus = 'not_required' | 'pending' | 'approved' | 'denied';

// Form data for HS Student onboarding
export interface HSStudentFormData {
  fullName: string;
  dateOfBirth: string;
  state: string;
  sport: string;
  schoolName: string;
  parentEmail?: string; // Required if under 18
}

// Form data for College Athlete onboarding
export interface CollegeAthleteFormData {
  fullName: string;
  dateOfBirth: string;
  state: string;
  sport: string;
  institutionId?: string;
  institutionName?: string;
}

// Form data for Parent onboarding
export interface ParentFormData {
  fullName: string;
  childEmail?: string; // For direct signup
  consentToken?: string; // For consent email flow
}

// Form data for Compliance Officer onboarding
export interface ComplianceOfficerFormData {
  fullName: string;
  institutionId?: string;
  institutionName?: string;
  title?: string;
  department?: string;
}

// US States for dropdown
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

// Common sports
export const SPORTS = [
  'Football',
  'Basketball',
  'Baseball',
  'Soccer',
  'Volleyball',
  'Track & Field',
  'Swimming',
  'Tennis',
  'Golf',
  'Softball',
  'Wrestling',
  'Lacrosse',
  'Hockey',
  'Gymnastics',
  'Cross Country',
  'Other',
];

// Helper function to calculate age from DOB
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Check if user is a minor (under 18)
export function isMinor(dateOfBirth: string): boolean {
  return calculateAge(dateOfBirth) < 18;
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  hs_student: 'High School Student Athlete',
  college_athlete: 'College Athlete',
  parent: 'Parent/Guardian',
  compliance_officer: 'Compliance Officer',
};

// Learning path display names
export const LEARNING_PATH_DISPLAY_NAMES: Record<LearningPath, string> = {
  foundation: 'Foundation',
  transition: 'Transition',
  activation: 'Activation',
};
