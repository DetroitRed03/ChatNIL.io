/**
 * Target Criteria Service
 * Handles agency athlete targeting preferences
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AgencyTargetCriteria,
  AgencyTargetCriteriaInsert,
  AgencyTargetCriteriaUpdate,
  AgencyApiResponse,
} from '@/types/agency';

/**
 * Get a Supabase client with the service role key
 */
function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * US States for targeting
 */
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

/**
 * School levels for targeting
 */
export const SCHOOL_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'd1', label: 'NCAA Division I' },
  { value: 'd2', label: 'NCAA Division II' },
  { value: 'd3', label: 'NCAA Division III' },
  { value: 'naia', label: 'NAIA' },
  { value: 'juco', label: 'Junior College' },
];

/**
 * Common sports for targeting
 */
export const SPORTS = [
  'Football',
  'Basketball',
  'Baseball',
  'Soccer',
  'Volleyball',
  'Softball',
  'Track & Field',
  'Swimming',
  'Tennis',
  'Golf',
  'Lacrosse',
  'Hockey',
  'Wrestling',
  'Gymnastics',
  'Cross Country',
  'Rowing',
  'Water Polo',
  'Field Hockey',
  'Cheerleading',
  'Esports',
];

/**
 * Get target criteria for an agency
 */
export async function getTargetCriteria(
  agencyProfileId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyTargetCriteria | null>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_target_criteria')
    .select('*')
    .eq('agency_profile_id', agencyProfileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { success: true, data: null };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Create or update target criteria
 */
export async function upsertTargetCriteria(
  data: AgencyTargetCriteriaInsert,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyTargetCriteria>> {
  const supabase = client || getServiceClient();

  // Check if criteria already exists
  const { data: existing } = await supabase
    .from('agency_target_criteria')
    .select('id')
    .eq('agency_profile_id', data.agency_profile_id)
    .single();

  if (existing) {
    // Update existing
    const { data: updated, error } = await supabase
      .from('agency_target_criteria')
      .update(data)
      .eq('agency_profile_id', data.agency_profile_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: updated, message: 'Target criteria updated' };
  } else {
    // Insert new
    const { data: created, error } = await supabase
      .from('agency_target_criteria')
      .insert(data)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: created, message: 'Target criteria created' };
  }
}

/**
 * Update target criteria
 */
export async function updateTargetCriteria(
  agencyProfileId: string,
  updates: AgencyTargetCriteriaUpdate,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyTargetCriteria>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_target_criteria')
    .update(updates)
    .eq('agency_profile_id', agencyProfileId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Delete target criteria
 */
export async function deleteTargetCriteria(
  agencyProfileId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<void>> {
  const supabase = client || getServiceClient();

  const { error } = await supabase
    .from('agency_target_criteria')
    .delete()
    .eq('agency_profile_id', agencyProfileId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Target criteria deleted' };
}

/**
 * Get follower range options for UI
 */
export function getFollowerRangeOptions() {
  return [
    { value: 0, label: 'Any', min: 0, max: undefined },
    { value: 1000, label: '1K+', min: 1000, max: undefined },
    { value: 5000, label: '5K+', min: 5000, max: undefined },
    { value: 10000, label: '10K+', min: 10000, max: undefined },
    { value: 25000, label: '25K+', min: 25000, max: undefined },
    { value: 50000, label: '50K+', min: 50000, max: undefined },
    { value: 100000, label: '100K+', min: 100000, max: undefined },
    { value: 500000, label: '500K+', min: 500000, max: undefined },
  ];
}

/**
 * Get FMV range options for UI
 */
export function getFMVRangeOptions() {
  return [
    { value: 0, label: 'Any', min: 0, max: undefined },
    { value: 1000, label: '$1K+', min: 1000, max: undefined },
    { value: 5000, label: '$5K+', min: 5000, max: undefined },
    { value: 10000, label: '$10K+', min: 10000, max: undefined },
    { value: 25000, label: '$25K+', min: 25000, max: undefined },
    { value: 50000, label: '$50K+', min: 50000, max: undefined },
    { value: 100000, label: '$100K+', min: 100000, max: undefined },
  ];
}
