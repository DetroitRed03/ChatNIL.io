/**
 * Server-Side Badge Service Layer
 * Handles badge operations that require admin privileges (bypassing RLS)
 * ONLY USE IN API ROUTES - DO NOT IMPORT IN CLIENT COMPONENTS
 */

import { supabaseAdmin } from './supabase';
import { Badge, UserBadge } from './types';

// Use admin client to bypass RLS
const supabase = supabaseAdmin;

if (!supabase) {
  console.warn('⚠️ supabaseAdmin not configured - server-side badge operations will fail');
}

/**
 * Fetch all available badges (server-side with admin privileges)
 */
export async function getAllBadgesServer(): Promise<Badge[]> {
  if (!supabase) {
    throw new Error('Supabase admin client not configured');
  }

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    throw new Error('Failed to fetch badges');
  }

  return data || [];
}

/**
 * Award a badge to a user (server-side with admin privileges)
 * Returns the user_badge record if awarded, or null if already earned
 */
export async function awardBadgeServer(
  userId: string,
  badgeId: string,
  awardedBy?: string,
  notes?: string
): Promise<UserBadge | null> {
  if (!supabase) {
    throw new Error('Supabase admin client not configured');
  }

  // First check if user already has this badge
  const { data: existing, error: checkError } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) {
    console.log(`User ${userId} already has badge ${badgeId}`);
    return null;
  }

  // Award the badge
  const { data, error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
      awarded_by: awardedBy || null,
      notes: notes || null,
      is_displayed: true // Auto-display newly earned badges
    })
    .select(`
      *,
      badge:badges (*)
    `)
    .single();

  if (error) {
    console.error('Error awarding badge:', error);
    throw new Error('Failed to award badge');
  }

  console.log(`✅ Badge awarded: ${badgeId} to user ${userId}`);
  return data;
}

/**
 * Award a badge by name (server-side helper for common operations)
 */
export async function awardBadgeByNameServer(
  userId: string,
  badgeName: string,
  awardedBy?: string,
  notes?: string
): Promise<UserBadge | null> {
  if (!supabase) {
    throw new Error('Supabase admin client not configured');
  }

  // Find badge by name
  const { data: badge, error: badgeError } = await supabase
    .from('badges')
    .select('id')
    .eq('name', badgeName)
    .eq('is_active', true)
    .single();

  if (badgeError || !badge) {
    console.error(`Badge not found: ${badgeName}`, badgeError);
    throw new Error(`Badge "${badgeName}" not found`);
  }

  return awardBadgeServer(userId, badge.id, awardedBy, notes);
}

/**
 * Check and award badge based on trigger action (server-side)
 */
export async function checkAndAwardBadgeForActionServer(
  userId: string,
  action: 'onboarding_complete' | 'first_message' | 'first_quiz' | 'profile_complete'
): Promise<UserBadge | null> {
  let badgeName: string;

  switch (action) {
    case 'onboarding_complete':
      badgeName = 'First Steps';
      break;
    case 'first_message':
      badgeName = 'First Steps'; // Based on migration, "First Steps" is for first message
      break;
    case 'first_quiz':
      badgeName = 'NIL Novice';
      break;
    case 'profile_complete':
      badgeName = 'Profile Complete';
      break;
    default:
      console.warn(`Unknown badge action: ${action}`);
      return null;
  }

  try {
    const userBadge = await awardBadgeByNameServer(
      userId,
      badgeName,
      undefined,
      `Awarded for: ${action}`
    );

    if (userBadge) {
      console.log(`🎉 Badge "${badgeName}" awarded to user ${userId} for action: ${action}`);
    }

    return userBadge;
  } catch (error) {
    console.error(`Error checking/awarding badge for action ${action}:`, error);
    return null;
  }
}
