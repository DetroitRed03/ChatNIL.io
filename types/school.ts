/**
 * School System Types
 * Schools, institutions, and business profiles
 */

// ============================================================================
// Phase 6B: School System Interfaces (Migration 027)
// ============================================================================

/**
 * School - Distribution channel for student athlete signups
 * NOT a user account - schools facilitate athlete registration
 */
export interface School {
  id: string;

  // Basic Info
  school_name: string;
  school_district?: string;
  state: string;
  school_type?: 'high_school' | 'college' | 'university' | 'community_college';

  // URL Configuration
  custom_slug: string;
  signup_url?: string;  // Generated: https://chatnil.io/school/{slug}/signup

  // QR Code & Branding
  qr_code_url?: string;
  logo_url?: string;
  primary_color?: string;

  // Statistics
  students_registered: number;
  students_completed: number;

  // Contact Information
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;

  // Status
  active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Institution Profile - Schools and universities
 * Created in Migration 025
 */
export interface InstitutionProfile {
  id: string;                    // References users.id

  // Basic info
  institution_name: string;
  institution_type: 'high_school' | 'community_college' | 'junior_college' | 'college' | 'university' | 'prep_school' | 'academy';

  // Official identifiers
  nces_id?: string;              // National Center for Education Statistics ID
  state_code?: string;
  county?: string;
  district?: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  // Contact
  phone?: string;
  website_url?: string;
  athletic_department_email?: string;
  athletic_director_name?: string;
  compliance_officer_email?: string;

  // Branding
  custom_url_slug?: string;      // e.g., 'kentucky-central-hs'
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_splash_page?: {
    logo_url?: string;
    primary_color?: string;
    welcome_message?: string;
    background_image?: string;
    [key: string]: any;
  };

  // QR code
  qr_code_url?: string;
  athlete_signup_url?: string;

  // Compliance
  ferpa_compliant: boolean;
  requires_approval_for_nil_deals: boolean;
  automatic_athlete_association: boolean;
  email_domains?: string[];

  // Statistics
  total_athletes: number;
  total_active_nil_deals: number;
  total_nil_value: number;

  // Permissions
  can_create_bulk_accounts: boolean;
  can_view_athlete_analytics: boolean;
  can_approve_nil_deals: boolean;

  // Verification
  verified: boolean;
  verified_at?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Business Profile - Local businesses and brands (simpler than agencies)
 * Created in Migration 026
 */
export interface BusinessProfile {
  id: string;                    // References users.id

  // Basic info
  business_name: string;
  business_type: 'local_business' | 'restaurant' | 'retail_store' | 'automotive' | 'fitness_gym' |
                 'healthcare' | 'real_estate' | 'law_firm' | 'financial_services' | 'technology' |
                 'entertainment' | 'hospitality' | 'nonprofit' | 'national_brand' | 'startup' | 'other';
  industry?: string;
  description?: string;

  // Contact
  contact_person_name?: string;
  contact_person_title?: string;
  email?: string;
  phone?: string;
  website_url?: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;

  // Social media
  instagram_handle?: string;
  facebook_page?: string;
  twitter_handle?: string;
  linkedin_url?: string;

  // NIL preferences
  looking_for?: string[];        // ['social_media_posts', 'event_appearances', etc.]
  preferred_sports?: string[];
  budget_range?: 'under_1k' | '1k_5k' | '5k_10k' | '10k_25k' | '25k_50k' | '50k_100k' | '100k_plus';
  estimated_monthly_budget?: number;

  // Geographic focus
  geographic_focus?: string[];   // State codes
  local_market_only: boolean;

  // Target criteria
  min_follower_count?: number;
  preferred_athlete_level?: string;
  preferred_content_types?: string[];

  // Deal templates
  default_deal_terms?: {
    duration_days?: number;
    payment_terms?: string;
    deliverables?: string[];
    [key: string]: any;
  };

  // Verification
  verified: boolean;
  verified_at?: string;
  verification_method?: string;

  // Statistics
  total_deals_created: number;
  total_deals_completed: number;
  total_spent: number;
  average_deal_value?: number;

  // Ratings
  rating_score?: number;         // 0.00-5.00
  total_ratings: number;

  // Settings
  auto_approve_deals: boolean;
  requires_contract: boolean;
  payment_method_on_file: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
}
