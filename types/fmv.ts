/**
 * FMV (Fair Market Value) Types
 * Fair market value calculations, rankings, and state compliance
 */

// ============================================================================
// Phase 5: FMV (Fair Market Value) System Interfaces (Migration 022-027)
// ============================================================================

/**
 * FMV Tier - Ranking tier based on FMV score
 */
export type FMVTier = 'elite' | 'high' | 'medium' | 'developing' | 'emerging';

/**
 * FMV Score Breakdown - Category scores that make up total FMV
 */
export interface FMVScoreBreakdown {
  social_score: number;      // 0-30 points
  athletic_score: number;    // 0-30 points
  market_score: number;      // 0-20 points
  brand_score: number;       // 0-20 points
}

/**
 * Improvement Suggestion - Actionable recommendation to improve FMV score
 */
export interface ImprovementSuggestion {
  area: 'social' | 'athletic' | 'market' | 'brand';
  current: string;           // Current state (e.g., "5K followers")
  target: string;            // Target state (e.g., "10K followers")
  action: string;            // Specific steps to take
  impact: string;            // Expected impact (e.g., "+6 points")
  priority: 'high' | 'medium' | 'low';
}

/**
 * FMV Score History Entry - Historical tracking of score changes
 */
export interface FMVScoreHistory {
  date: string;              // ISO 8601 timestamp
  score: number;             // FMV score at that time
  tier: FMVTier;            // Tier at that time
}

/**
 * Athlete FMV Data - Complete FMV profile for an athlete
 * Created in Migration 022
 */
export interface AthleteFMVData {
  id: string;
  athlete_id: string;

  // Overall FMV
  fmv_score: number;         // 0-100
  fmv_tier: FMVTier;

  // Category breakdowns
  social_score: number;      // 0-30
  athletic_score: number;    // 0-30
  market_score: number;      // 0-20
  brand_score: number;       // 0-20

  // Deal value estimates
  estimated_deal_value_low: number;
  estimated_deal_value_mid: number;
  estimated_deal_value_high: number;

  // Analysis (JSONB)
  improvement_suggestions: ImprovementSuggestion[];
  strengths: string[];
  weaknesses: string[];
  score_history: FMVScoreHistory[];

  // Comparables
  comparable_athletes: string[];  // UUID array of similar athletes

  // Rankings
  percentile_rank?: number;       // 0-100
  rank_in_sport?: number;
  total_athletes_in_sport?: number;

  // Privacy controls
  is_public_score: boolean;       // Default false (private)

  // Rate limiting
  last_calculation_date?: string;
  next_calculation_date?: string;
  calculation_count_today: number;
  last_calculation_reset_date: string;

  // Notifications
  last_notified_score?: number;
  last_notification_date?: string;

  // Metadata
  calculation_version: string;
  created_at: string;
  updated_at: string;
}

/**
 * State NIL Rules - State-by-state NIL compliance regulations
 * Created in Migration 023
 */
export interface StateNILRules {
  state_code: string;              // 'KY', 'CA', etc.
  state_name: string;

  // General permissions
  allows_nil: boolean;
  high_school_allowed: boolean;
  college_allowed: boolean;
  school_approval_required: boolean;

  // Prohibited categories
  prohibited_categories: string[]; // ['alcohol', 'gambling', etc.]

  // Additional requirements
  disclosure_required: boolean;
  agent_registration_required: boolean;
  financial_literacy_required: boolean;

  // Documentation
  rules_summary?: string;
  rules_url?: string;
  effective_date?: string;

  // Metadata
  last_updated: string;
  created_at: string;
}
