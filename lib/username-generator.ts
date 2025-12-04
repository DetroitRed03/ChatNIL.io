/**
 * Username Generator Utility
 *
 * Generates unique, URL-friendly usernames for athletes.
 * Format: firstname-lastname (hyphenated lowercase)
 * Collision handling: sarah-johnson, sarah-johnson-2, sarah-johnson-3, etc.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Generates a unique username based on first and last name.
 * Handles collisions by appending numeric suffix.
 *
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Unique username string
 *
 * @example
 * generateUniqueUsername('Sarah', 'Johnson') => 'sarah-johnson'
 * generateUniqueUsername('Sarah', 'Johnson') => 'sarah-johnson-2' (if first exists)
 */
export async function generateUniqueUsername(
  firstName: string,
  lastName: string
): Promise<string> {
  const supabase = createServiceRoleClient();

  // Normalize: lowercase, replace spaces with hyphens, remove special chars
  const base = normalizeUsername(`${firstName}-${lastName}`);

  // Handle edge case where name produces empty string
  if (!base) {
    return `athlete-${Date.now().toString(36)}`;
  }

  let username = base;
  let suffix = 1;

  // Check for existing username and increment suffix until unique
  while (true) {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    // If no match found, username is available
    if (!data) break;

    // Increment suffix and try again
    suffix++;
    username = `${base}-${suffix}`;

    // Safety limit to prevent infinite loop
    if (suffix > 1000) {
      // Fallback to timestamp-based suffix
      username = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }

  return username;
}

/**
 * Checks if a username already exists in the database.
 *
 * @param username - Username to check
 * @returns true if username exists, false otherwise
 */
export async function usernameExists(username: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  return !!data;
}

/**
 * Validates a username format.
 * Valid format: lowercase letters, numbers, and hyphens only.
 * Must start with a letter, 3-30 characters.
 *
 * @param username - Username to validate
 * @returns true if valid, false otherwise
 */
export function isValidUsername(username: string): boolean {
  // 3-30 chars, lowercase letters/numbers/hyphens, must start with letter
  const usernameRegex = /^[a-z][a-z0-9-]{2,29}$/;
  return usernameRegex.test(username);
}

/**
 * Normalizes a string into a valid username format.
 *
 * @param input - Raw input string
 * @returns Normalized username string
 */
export function normalizeUsername(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove special characters
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
}

/**
 * Generates a username suggestion based on email.
 * Fallback when name is not available.
 *
 * @param email - User's email address
 * @returns Username suggestion
 */
export async function generateUsernameFromEmail(email: string): Promise<string> {
  // Extract the part before @
  const localPart = email.split('@')[0] || 'user';
  const base = normalizeUsername(localPart);

  const supabase = createServiceRoleClient();
  let username = base;
  let suffix = 1;

  while (true) {
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (!data) break;

    suffix++;
    username = `${base}-${suffix}`;

    if (suffix > 1000) {
      username = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }

  return username;
}
