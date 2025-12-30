/**
 * Brand Values Service
 * Handles agency brand values linked to core traits
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AgencyBrandValue,
  AgencyBrandValueInsert,
  AgencyBrandValueUpdate,
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
 * Get all brand values for an agency
 */
export async function getBrandValues(
  agencyProfileId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyBrandValue[]>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_brand_values')
    .select(`
      *,
      trait:core_traits(id, name, display_name, category, description)
    `)
    .eq('agency_profile_id', agencyProfileId)
    .order('priority', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [] };
}

/**
 * Set brand values for an agency (replaces all existing values)
 */
export async function setBrandValues(
  agencyProfileId: string,
  values: Omit<AgencyBrandValueInsert, 'agency_profile_id'>[],
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyBrandValue[]>> {
  const supabase = client || getServiceClient();

  // Delete existing values
  const { error: deleteError } = await supabase
    .from('agency_brand_values')
    .delete()
    .eq('agency_profile_id', agencyProfileId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // Insert new values
  if (values.length === 0) {
    return { success: true, data: [], message: 'Brand values cleared' };
  }

  const insertData = values.map((v) => ({
    ...v,
    agency_profile_id: agencyProfileId,
  }));

  const { data, error } = await supabase
    .from('agency_brand_values')
    .insert(insertData)
    .select(`
      *,
      trait:core_traits(id, name, display_name, category, description)
    `);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [], message: 'Brand values updated' };
}

/**
 * Add a single brand value
 */
export async function addBrandValue(
  data: AgencyBrandValueInsert,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyBrandValue>> {
  const supabase = client || getServiceClient();

  const { data: value, error } = await supabase
    .from('agency_brand_values')
    .insert(data)
    .select(`
      *,
      trait:core_traits(id, name, display_name, category, description)
    `)
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'This value is already selected' };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data: value };
}

/**
 * Update a brand value
 */
export async function updateBrandValue(
  valueId: string,
  updates: AgencyBrandValueUpdate,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyBrandValue>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_brand_values')
    .update(updates)
    .eq('id', valueId)
    .select(`
      *,
      trait:core_traits(id, name, display_name, category, description)
    `)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Remove a brand value
 */
export async function removeBrandValue(
  valueId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<void>> {
  const supabase = client || getServiceClient();

  const { error } = await supabase
    .from('agency_brand_values')
    .delete()
    .eq('id', valueId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Value removed' };
}

/**
 * Get available traits for selection
 */
export async function getAvailableTraits(
  client?: SupabaseClient
): Promise<AgencyApiResponse<{ id: string; name: string; display_name: string; category: string; description?: string }[]>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('core_traits')
    .select('id, name, display_name, category, description')
    .order('category')
    .order('display_name');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [] };
}
