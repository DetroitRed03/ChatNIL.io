/**
 * Campaign & NIL Deals Types
 * NIL deals, matchmaking, compliance, and school administration
 */

// ============================================================================
// NIL Deals & Matchmaking Interfaces (Migrations 018-021)
// ============================================================================

/**
 * NIL Deal - Represents a deal between an athlete and an agency/brand
 * Created in Migration 018
 */
export interface NILDeal {
  id: string;
  athlete_id: string;
  agency_id: string;

  // Deal basics
  deal_title: string;
  description?: string;
  deal_type: 'sponsorship' | 'endorsement' | 'appearance' | 'content_creation' | 'social_media' | 'merchandise' | 'licensing' | 'event' | 'other';
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'expired' | 'on_hold';

  // Financial
  compensation_amount?: number;
  currency?: string;
  payment_terms?: string;
  payment_status?: 'pending' | 'partial' | 'paid' | 'overdue' | 'disputed';

  // Timeline
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;

  // Deliverables
  deliverables?: Array<{
    type: string;
    description: string;
    deadline?: string;
    status?: string;
  }>;

  // Contract
  contract_file_url?: string;
  contract_signed_at?: string;
  contract_signed_by_athlete?: boolean;
  contract_signed_by_agency?: boolean;

  // Payment schedule
  payment_schedule?: Array<{
    amount: number;
    due_date: string;
    status: string;
    paid_at?: string;
  }>;

  // Compliance
  requires_school_approval?: boolean;
  school_approved?: boolean;
  school_approved_at?: string;
  school_approved_by?: string;

  requires_parent_approval?: boolean;
  parent_approved?: boolean;
  parent_approved_at?: string;
  parent_approved_by?: string;

  compliance_checked?: boolean;
  compliance_notes?: string;

  // Performance
  performance_metrics?: {
    impressions?: number;
    engagement_rate?: number;
    clicks?: number;
    [key: string]: any;
  };

  // Metadata
  tags?: string[];
  notes?: string;
  internal_notes?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Agency-Athlete Match - Represents a matchmaking result
 * Created in Migration 019
 */
export interface AgencyAthleteMatch {
  id: string;
  agency_id: string;
  athlete_id: string;

  // Scoring
  match_score: number;  // 0-100
  score_breakdown: {
    brand_values?: number;
    interests?: number;
    campaign_fit?: number;
    budget?: number;
    geography?: number;
    demographics?: number;
    engagement?: number;
  };

  // Match insights
  match_reason?: string;
  match_highlights?: string[];

  // Status and workflow
  status: 'suggested' | 'saved' | 'contacted' | 'interested' | 'in_discussion' | 'partnered' | 'rejected' | 'expired';

  // Communication
  contacted_at?: string;
  contacted_by?: string;
  contact_method?: string;

  // Response
  athlete_response_at?: string;
  athlete_response_status?: string;

  // Notes
  agency_notes?: string;
  athlete_notes?: string;

  // Deal conversion
  deal_id?: string;
  deal_created_at?: string;

  // Feedback
  agency_feedback_rating?: number;
  athlete_feedback_rating?: number;
  feedback_comments?: string;

  // Algorithm metadata
  algorithm_version?: string;
  match_factors_used?: any;
  athlete_profile_snapshot?: any;
  agency_criteria_snapshot?: any;

  // Timestamps
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

/**
 * School Administrator - Manages athletes and compliance for a school
 * Created in Migration 020
 */
export interface SchoolAdministrator {
  id: string;
  user_id: string;

  // School info
  school_id?: string;
  school_name: string;
  school_division?: string;

  // Admin details
  admin_role: 'compliance_officer' | 'athletic_director' | 'assistant_ad' | 'coach_coordinator' | 'nil_coordinator' | 'super_admin';
  title?: string;
  department?: string;

  // Permissions
  permissions: {
    can_view_athletes?: boolean;
    can_approve_deals?: boolean;
    can_manage_admins?: boolean;
    can_bulk_create?: boolean;
    can_view_analytics?: boolean;
    [key: string]: any;
  };

  // Contact
  office_phone?: string;
  office_email?: string;

  // Status
  is_active: boolean;
  verified: boolean;
  verified_at?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * School Account Batch - Bulk account creation for schools
 * Created in Migration 020
 */
export interface SchoolAccountBatch {
  id: string;

  // School and admin
  school_id?: string;
  school_name: string;
  admin_id: string;

  // Batch details
  batch_name: string;
  description?: string;

  // File upload
  csv_file_url?: string;
  csv_file_name?: string;

  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  // Counts
  total_athletes: number;
  processed_count: number;
  success_count: number;
  failed_count: number;

  // Results
  created_user_ids?: string[];
  error_log?: Array<{
    row: number;
    email: string;
    error: string;
    timestamp: string;
  }>;

  // Configuration
  column_mapping?: {
    [key: string]: string;
  };
  send_welcome_emails?: boolean;
  auto_assign_coach?: boolean;
  default_permissions?: any;

  // Timestamps
  created_at: string;
  processing_started_at?: string;
  completed_at?: string;
  cancelled_at?: string;

  // Audit
  created_by?: string;
}

/**
 * Compliance Consent - Tracks consent for NIL deals
 * Created in Migration 020
 */
export interface ComplianceConsent {
  id: string;

  // Relationships
  athlete_id: string;
  deal_id?: string;

  // Consent details
  consent_type: 'athlete_consent' | 'parent_consent' | 'school_approval' | 'state_compliance' | 'ncaa_compliance';

  // Consenting party
  consented_by_user_id?: string;
  consented_by_name?: string;
  consented_by_title?: string;

  // Documentation
  consent_document_url?: string;
  consent_method?: string;

  // Legal metadata
  ip_address?: string;
  user_agent?: string;
  consent_language?: string;

  // Verification
  verified: boolean;
  verified_by?: string;
  verified_at?: string;

  // Validity
  consented_at: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_by?: string;
  revocation_reason?: string;

  // Context
  notes?: string;
  school_name?: string;
  state?: string;

  // Requirements
  requirements_met?: {
    ncaa_cleared?: boolean;
    state_cleared?: boolean;
    school_cleared?: boolean;
    age_verified?: boolean;
    [key: string]: any;
  };

  // Audit
  created_at: string;
  updated_at: string;
}
