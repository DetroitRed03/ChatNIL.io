/**
 * Settings Types
 * TypeScript interfaces for all role-specific settings tables
 * Created: January 2026
 */

// ============================================
// UNIVERSAL USER SETTINGS
// ============================================

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone?: string;
  profile_visible: boolean;
  show_email: boolean;
  show_phone: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export const defaultUserSettings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'system',
  language: 'en',
  timezone: undefined,
  profile_visible: true,
  show_email: false,
  show_phone: false,
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false
};

// ============================================
// COMPLIANCE OFFICER SETTINGS
// ============================================

export interface ComplianceSettings {
  id: string;
  user_id: string;
  institution_id?: string;

  // Workflow
  default_review_deadline_days: number;
  auto_flag_deal_threshold: number;
  require_second_approval_threshold: number;
  enable_ai_deal_analysis: boolean;

  // Notifications
  notify_new_deal_submitted: boolean;
  notify_deal_deadline_approaching: boolean;
  notify_athlete_flagged: boolean;
  notify_weekly_summary: boolean;
  notify_state_rule_changes: boolean;
  notify_team_activity: boolean;

  // Delivery
  email_enabled: boolean;
  push_enabled: boolean;

  // Reporting
  weekly_report_day: string;
  include_pending_in_report: boolean;
  include_approved_in_report: boolean;
  include_flagged_in_report: boolean;
  auto_send_to_ad: boolean;
  ad_email?: string;

  created_at: string;
  updated_at: string;
}

export const defaultComplianceSettings: Omit<ComplianceSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  institution_id: undefined,
  default_review_deadline_days: 3,
  auto_flag_deal_threshold: 5000,
  require_second_approval_threshold: 10000,
  enable_ai_deal_analysis: true,
  notify_new_deal_submitted: true,
  notify_deal_deadline_approaching: true,
  notify_athlete_flagged: true,
  notify_weekly_summary: true,
  notify_state_rule_changes: true,
  notify_team_activity: false,
  email_enabled: true,
  push_enabled: true,
  weekly_report_day: 'monday',
  include_pending_in_report: true,
  include_approved_in_report: true,
  include_flagged_in_report: true,
  auto_send_to_ad: false,
  ad_email: undefined
};

// ============================================
// COMPLIANCE TEAM
// ============================================

export type ComplianceTeamRole = 'admin' | 'officer' | 'assistant' | 'viewer';

export interface ComplianceTeamMember {
  id: string;
  institution_id: string;
  user_id: string;
  invited_by?: string;
  role: ComplianceTeamRole;

  // User info (joined)
  user?: {
    id: string;
    full_name: string;
    email: string;
    profile_photo?: string;
  };

  // Permissions
  can_view_athletes: boolean;
  can_view_deals: boolean;
  can_flag_deals: boolean;
  can_approve_deals: boolean;
  can_reject_deals: boolean;
  can_invite_members: boolean;
  can_manage_members: boolean;
  can_access_reports: boolean;
  can_export_data: boolean;

  // Sports Access
  all_sports_access: boolean;
  sports_access?: string[];

  status: 'active' | 'suspended' | 'removed';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceTeamInvite {
  id: string;
  institution_id: string;
  invited_by: string;
  invitee_email: string;
  invitee_name?: string;
  role: ComplianceTeamRole;
  permissions: Partial<ComplianceTeamMember>;
  sports_access?: string[];
  invite_token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  sent_at: string;
  accepted_at?: string;
}

export const rolePermissionDefaults: Record<ComplianceTeamRole, Partial<ComplianceTeamMember>> = {
  admin: {
    can_view_athletes: true,
    can_view_deals: true,
    can_flag_deals: true,
    can_approve_deals: true,
    can_reject_deals: true,
    can_invite_members: true,
    can_manage_members: true,
    can_access_reports: true,
    can_export_data: true,
    all_sports_access: true
  },
  officer: {
    can_view_athletes: true,
    can_view_deals: true,
    can_flag_deals: true,
    can_approve_deals: true,
    can_reject_deals: true,
    can_invite_members: false,
    can_manage_members: false,
    can_access_reports: true,
    can_export_data: false,
    all_sports_access: true
  },
  assistant: {
    can_view_athletes: true,
    can_view_deals: true,
    can_flag_deals: true,
    can_approve_deals: false,
    can_reject_deals: false,
    can_invite_members: false,
    can_manage_members: false,
    can_access_reports: false,
    can_export_data: false,
    all_sports_access: true
  },
  viewer: {
    can_view_athletes: true,
    can_view_deals: true,
    can_flag_deals: false,
    can_approve_deals: false,
    can_reject_deals: false,
    can_invite_members: false,
    can_manage_members: false,
    can_access_reports: false,
    can_export_data: false,
    all_sports_access: true
  }
};

// ============================================
// ATHLETE SETTINGS
// ============================================

export type ProfileVisibility = 'private' | 'school_only' | 'public';
export type AppearanceAvailability = 'weekends' | 'flexible' | 'limited';
export type ResponseTimeGoal = '24_hours' | '48_hours' | 'week';
export type DifficultyLevel = 'easy' | 'standard' | 'advanced';

export interface AthleteSettings {
  id: string;
  user_id: string;

  // Profile Visibility
  profile_visibility: ProfileVisibility;
  show_contact_info: boolean;
  allow_brand_contact: boolean;
  show_follower_counts: boolean;

  // NIL Preferences (College)
  nil_interests?: string[];
  excluded_categories?: string[];
  min_deal_value?: number;
  willing_to_travel: boolean;
  travel_radius_miles?: number;
  appearance_availability?: AppearanceAvailability;
  response_time_goal?: ResponseTimeGoal;

  // Notifications
  notify_new_opportunity: boolean;
  notify_brand_viewed_profile: boolean;
  notify_deal_status_changed: boolean;
  notify_payment_received: boolean;
  notify_compliance_update: boolean;
  notify_learning_content: boolean;

  // Delivery
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;

  // Learning (HS)
  daily_reminder_time?: string;
  difficulty_level: DifficultyLevel;
  show_explanations: boolean;

  created_at: string;
  updated_at: string;
}

export const defaultAthleteSettings: Omit<AthleteSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  profile_visibility: 'private',
  show_contact_info: false,
  allow_brand_contact: false,
  show_follower_counts: true,
  nil_interests: [],
  excluded_categories: [],
  min_deal_value: undefined,
  willing_to_travel: false,
  travel_radius_miles: undefined,
  appearance_availability: undefined,
  response_time_goal: undefined,
  notify_new_opportunity: true,
  notify_brand_viewed_profile: true,
  notify_deal_status_changed: true,
  notify_payment_received: true,
  notify_compliance_update: true,
  notify_learning_content: true,
  email_enabled: true,
  push_enabled: true,
  sms_enabled: false,
  daily_reminder_time: undefined,
  difficulty_level: 'standard',
  show_explanations: true
};

// NIL Categories for interests
export const nilInterestCategories = [
  { id: 'apparel', label: 'Apparel & Footwear', icon: 'Shirt' },
  { id: 'sports_equipment', label: 'Sports Equipment', icon: 'Dumbbell' },
  { id: 'local_business', label: 'Local Businesses', icon: 'Store' },
  { id: 'food_beverage', label: 'Food & Beverage', icon: 'Coffee' },
  { id: 'fitness', label: 'Fitness & Health', icon: 'Heart' },
  { id: 'technology', label: 'Technology', icon: 'Smartphone' },
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2' },
  { id: 'finance', label: 'Finance', icon: 'CreditCard' },
  { id: 'automotive', label: 'Automotive', icon: 'Car' },
  { id: 'travel', label: 'Travel', icon: 'Plane' },
  { id: 'media', label: 'Media & Entertainment', icon: 'Film' },
  { id: 'education', label: 'Education', icon: 'GraduationCap' }
] as const;

// Categories to exclude (usually for compliance reasons)
export const excludedCategories = [
  { id: 'alcohol', label: 'Alcohol', icon: 'Wine' },
  { id: 'gambling', label: 'Gambling', icon: 'Dice5' },
  { id: 'tobacco', label: 'Tobacco', icon: 'Cigarette' },
  { id: 'adult', label: 'Adult Content', icon: 'Ban' },
  { id: 'political', label: 'Political', icon: 'Landmark' },
  { id: 'cryptocurrency', label: 'Cryptocurrency', icon: 'Bitcoin' },
  { id: 'weapons', label: 'Weapons', icon: 'Shield' }
] as const;

// ============================================
// BRAND SETTINGS
// ============================================

export interface BrandSettings {
  id: string;
  user_id: string;

  // Discovery
  interested_sports?: string[];
  interested_divisions?: string[];
  min_follower_count?: number;
  max_budget_per_deal?: number;
  preferred_deal_types?: string[];
  geographic_focus?: string[];

  // Notifications
  notify_new_athlete_matches: boolean;
  notify_athlete_response: boolean;
  notify_deal_status: boolean;
  notify_weekly_digest: boolean;

  // Delivery
  email_enabled: boolean;
  push_enabled: boolean;

  created_at: string;
  updated_at: string;
}

export const defaultBrandSettings: Omit<BrandSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  interested_sports: [],
  interested_divisions: [],
  min_follower_count: undefined,
  max_budget_per_deal: undefined,
  preferred_deal_types: [],
  geographic_focus: [],
  notify_new_athlete_matches: true,
  notify_athlete_response: true,
  notify_deal_status: true,
  notify_weekly_digest: true,
  email_enabled: true,
  push_enabled: false
};

// Deal types for brand preferences
export const dealTypes = [
  { id: 'social_post', label: 'Social Media Posts' },
  { id: 'appearance', label: 'In-Person Appearances' },
  { id: 'endorsement', label: 'Product Endorsement' },
  { id: 'ambassador', label: 'Brand Ambassador' },
  { id: 'content_creation', label: 'Content Creation' },
  { id: 'autograph', label: 'Autograph Sessions' },
  { id: 'camp', label: 'Camp/Clinic Participation' },
  { id: 'merchandise', label: 'Merchandise/Licensing' }
] as const;

// Sports list for filtering
export const sportsList = [
  'Football',
  'Basketball',
  'Baseball',
  'Soccer',
  'Volleyball',
  'Track & Field',
  'Swimming',
  'Tennis',
  'Golf',
  'Wrestling',
  'Lacrosse',
  'Hockey',
  'Softball',
  'Gymnastics',
  'Rowing',
  'Cross Country',
  'Other'
] as const;

// Division list
export const divisionsList = [
  { id: 'ncaa_d1', label: 'NCAA Division I' },
  { id: 'ncaa_d2', label: 'NCAA Division II' },
  { id: 'ncaa_d3', label: 'NCAA Division III' },
  { id: 'naia', label: 'NAIA' },
  { id: 'njcaa', label: 'NJCAA' },
  { id: 'high_school', label: 'High School' }
] as const;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface SettingsApiResponse<T> {
  settings: T;
  error?: string;
}

export interface TeamApiResponse {
  members: ComplianceTeamMember[];
  invites: ComplianceTeamInvite[];
  error?: string;
}

export interface InviteApiResponse {
  invite?: ComplianceTeamInvite;
  success?: boolean;
  message?: string;
  error?: string;
  requiresAuth?: boolean;
  inviteEmail?: string;
}
