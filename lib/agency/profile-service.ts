/**
 * Agency Profile Service
 * Handles agency profile CRUD operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AgencyProfile,
  AgencyProfileInsert,
  AgencyProfileUpdate,
  AgencyProfileWithRelations,
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
 * Generate a URL-friendly slug from company name
 */
export function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get an agency profile by user ID
 */
export async function getAgencyProfile(
  userId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfile>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { success: false, error: 'Agency profile not found' };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get an agency profile by ID
 */
export async function getAgencyProfileById(
  profileId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfile>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get an agency profile by slug (for public profile pages)
 */
export async function getAgencyProfileBySlug(
  slug: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfile>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get an agency profile with all related data (brand values, target criteria)
 */
export async function getAgencyProfileWithRelations(
  userId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfileWithRelations>> {
  const supabase = client || getServiceClient();

  // Get the profile
  const { data: profile, error: profileError } = await supabase
    .from('agency_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // Get brand values with trait details
  const { data: brandValues, error: valuesError } = await supabase
    .from('agency_brand_values')
    .select(`
      *,
      trait:core_traits(id, name, display_name, category, description)
    `)
    .eq('agency_profile_id', profile.id)
    .order('priority', { ascending: true });

  if (valuesError) {
    console.error('Error fetching brand values:', valuesError);
  }

  // Get target criteria
  const { data: targetCriteria, error: criteriaError } = await supabase
    .from('agency_target_criteria')
    .select('*')
    .eq('agency_profile_id', profile.id)
    .single();

  if (criteriaError && criteriaError.code !== 'PGRST116') {
    console.error('Error fetching target criteria:', criteriaError);
  }

  // Get interaction counts
  const { count: interactionCount } = await supabase
    .from('agency_athlete_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('agency_profile_id', profile.id);

  const { count: savedCount } = await supabase
    .from('agency_athlete_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('agency_profile_id', profile.id)
    .eq('status', 'saved');

  return {
    success: true,
    data: {
      ...profile,
      brand_values: brandValues || [],
      target_criteria: targetCriteria || undefined,
      interaction_count: interactionCount || 0,
      saved_athlete_count: savedCount || 0,
    },
  };
}

/**
 * Create a new agency profile
 */
export async function createAgencyProfile(
  data: AgencyProfileInsert,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfile>> {
  const supabase = client || getServiceClient();

  // Generate slug if not provided
  const slug = data.slug || generateSlug(data.company_name);

  // Check if slug is unique
  const { data: existingSlug } = await supabase
    .from('agency_profiles')
    .select('id')
    .eq('slug', slug)
    .single();

  let finalSlug = slug;
  if (existingSlug) {
    // Append a random suffix to make it unique
    finalSlug = `${slug}-${Date.now().toString(36)}`;
  }

  const { data: profile, error } = await supabase
    .from('agency_profiles')
    .insert({
      ...data,
      slug: finalSlug,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: profile, message: 'Agency profile created successfully' };
}

/**
 * Update an agency profile
 */
export async function updateAgencyProfile(
  userId: string,
  updates: AgencyProfileUpdate,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfile>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data, message: 'Profile updated successfully' };
}

/**
 * Complete agency onboarding
 */
export async function completeAgencyOnboarding(
  userId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfile>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_profiles')
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Also update the main users table
  await supabase
    .from('users')
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { success: true, data, message: 'Onboarding completed!' };
}

/**
 * Update onboarding step
 */
export async function updateOnboardingStep(
  userId: string,
  step: number,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyProfile>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_profiles')
    .update({ onboarding_step: step })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Check if user has an agency profile
 */
export async function hasAgencyProfile(
  userId: string,
  client?: SupabaseClient
): Promise<boolean> {
  const supabase = client || getServiceClient();

  const { count } = await supabase
    .from('agency_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return (count || 0) > 0;
}
