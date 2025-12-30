/**
 * Interactions Service
 * Handles agency-athlete interactions tracking
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AgencyAthleteInteraction,
  AgencyAthleteInteractionInsert,
  AgencyAthleteInteractionUpdate,
  InteractionStatus,
  AgencyApiResponse,
  AthletePreview,
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
 * Get all interactions for an agency
 */
export async function getAgencyInteractions(
  agencyProfileId: string,
  options?: {
    status?: InteractionStatus | InteractionStatus[];
    limit?: number;
    offset?: number;
  },
  client?: SupabaseClient
): Promise<AgencyApiResponse<{ interactions: AgencyAthleteInteraction[]; total: number }>> {
  const supabase = client || getServiceClient();

  let query = supabase
    .from('agency_athlete_interactions')
    .select(`
      *,
      athlete:users!athlete_user_id(
        id,
        first_name,
        last_name,
        primary_sport,
        school_name,
        graduation_year,
        total_followers,
        avg_engagement_rate,
        profile_completion_score
      )
    `, { count: 'exact' })
    .eq('agency_profile_id', agencyProfileId);

  // Filter by status
  if (options?.status) {
    if (Array.isArray(options.status)) {
      query = query.in('status', options.status);
    } else {
      query = query.eq('status', options.status);
    }
  }

  // Order by match score
  query = query.order('match_score', { ascending: false, nullsFirst: false });

  // Pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options?.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { interactions: data || [], total: count || 0 } };
}

/**
 * Get saved athletes for an agency
 */
export async function getSavedAthletes(
  agencyProfileId: string,
  limit = 50,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyAthleteInteraction[]>> {
  const result = await getAgencyInteractions(
    agencyProfileId,
    { status: 'saved', limit },
    client
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data?.interactions || [] };
}

/**
 * Get or create an interaction
 */
export async function getOrCreateInteraction(
  agencyProfileId: string,
  athleteUserId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyAthleteInteraction>> {
  const supabase = client || getServiceClient();

  // Try to get existing
  const { data: existing } = await supabase
    .from('agency_athlete_interactions')
    .select('*')
    .eq('agency_profile_id', agencyProfileId)
    .eq('athlete_user_id', athleteUserId)
    .single();

  if (existing) {
    return { success: true, data: existing };
  }

  // Create new
  const { data, error } = await supabase
    .from('agency_athlete_interactions')
    .insert({
      agency_profile_id: agencyProfileId,
      athlete_user_id: athleteUserId,
      status: 'suggested',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Record that an agency viewed an athlete
 */
export async function recordAthleteView(
  agencyProfileId: string,
  athleteUserId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyAthleteInteraction>> {
  const supabase = client || getServiceClient();

  // Get or create interaction
  const interactionResult = await getOrCreateInteraction(agencyProfileId, athleteUserId, client);
  if (!interactionResult.success) {
    return interactionResult;
  }

  const interaction = interactionResult.data!;

  // Update view tracking
  const updates: AgencyAthleteInteractionUpdate = {
    view_count: (interaction.view_count || 0) + 1,
    last_interaction_at: new Date().toISOString(),
  };

  // Set first viewed if not set
  if (!interaction.first_viewed_at) {
    updates.first_viewed_at = new Date().toISOString();
  }

  // Update status if still suggested
  if (interaction.status === 'suggested') {
    updates.status = 'viewed';
  }

  const { data, error } = await supabase
    .from('agency_athlete_interactions')
    .update(updates)
    .eq('id', interaction.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Save an athlete (add to shortlist)
 */
export async function saveAthlete(
  agencyProfileId: string,
  athleteUserId: string,
  notes?: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyAthleteInteraction>> {
  const supabase = client || getServiceClient();

  // Get or create interaction
  const interactionResult = await getOrCreateInteraction(agencyProfileId, athleteUserId, client);
  if (!interactionResult.success) {
    return interactionResult;
  }

  const interaction = interactionResult.data!;

  const { data, error } = await supabase
    .from('agency_athlete_interactions')
    .update({
      status: 'saved',
      agency_notes: notes || interaction.agency_notes,
      last_interaction_at: new Date().toISOString(),
    })
    .eq('id', interaction.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data, message: 'Athlete saved to your list' };
}

/**
 * Unsave an athlete
 */
export async function unsaveAthlete(
  agencyProfileId: string,
  athleteUserId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyAthleteInteraction>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_athlete_interactions')
    .update({
      status: 'viewed',
      last_interaction_at: new Date().toISOString(),
    })
    .eq('agency_profile_id', agencyProfileId)
    .eq('athlete_user_id', athleteUserId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data, message: 'Athlete removed from saved list' };
}

/**
 * Update interaction status
 */
export async function updateInteractionStatus(
  interactionId: string,
  status: InteractionStatus,
  notes?: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyAthleteInteraction>> {
  const supabase = client || getServiceClient();

  const updates: AgencyAthleteInteractionUpdate = {
    status,
    last_interaction_at: new Date().toISOString(),
  };

  if (notes !== undefined) {
    updates.agency_notes = notes;
  }

  // Track first contact
  if (status === 'contacted') {
    const { data: existing } = await supabase
      .from('agency_athlete_interactions')
      .select('first_contacted_at')
      .eq('id', interactionId)
      .single();

    if (!existing?.first_contacted_at) {
      updates.first_contacted_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('agency_athlete_interactions')
    .update(updates)
    .eq('id', interactionId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Update interaction notes
 */
export async function updateInteractionNotes(
  interactionId: string,
  notes: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<AgencyAthleteInteraction>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_athlete_interactions')
    .update({
      agency_notes: notes,
      last_interaction_at: new Date().toISOString(),
    })
    .eq('id', interactionId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get interaction counts by status
 */
export async function getInteractionCounts(
  agencyProfileId: string,
  client?: SupabaseClient
): Promise<AgencyApiResponse<Record<InteractionStatus, number>>> {
  const supabase = client || getServiceClient();

  const { data, error } = await supabase
    .from('agency_athlete_interactions')
    .select('status')
    .eq('agency_profile_id', agencyProfileId);

  if (error) {
    return { success: false, error: error.message };
  }

  const counts = (data || []).reduce((acc, { status }) => {
    acc[status as InteractionStatus] = (acc[status as InteractionStatus] || 0) + 1;
    return acc;
  }, {} as Record<InteractionStatus, number>);

  return { success: true, data: counts };
}

/**
 * Check if an athlete is saved
 */
export async function isAthleteSaved(
  agencyProfileId: string,
  athleteUserId: string,
  client?: SupabaseClient
): Promise<boolean> {
  const supabase = client || getServiceClient();

  const { data } = await supabase
    .from('agency_athlete_interactions')
    .select('status')
    .eq('agency_profile_id', agencyProfileId)
    .eq('athlete_user_id', athleteUserId)
    .single();

  return data?.status === 'saved';
}
