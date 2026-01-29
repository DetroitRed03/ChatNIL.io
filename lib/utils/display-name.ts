/**
 * Utility for cleaning up and displaying user names
 * Handles cases where usernames contain random suffixes like "_xdv0", "_xc0n" etc.
 */

interface UserLike {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  name?: string | null;
}

/**
 * Get a clean display name for a user
 * Priority:
 * 1. full_name (if it doesn't look like a username)
 * 2. first_name + last_name
 * 3. name field
 * 4. Cleaned email prefix
 * 5. Fallback
 */
export function getDisplayName(user: UserLike | null | undefined, fallback: string = 'User'): string {
  if (!user) return fallback;

  // Priority 1: full_name if it doesn't look like a username with random suffix
  if (user.full_name && !looksLikeUsername(user.full_name)) {
    return user.full_name;
  }

  // Priority 2: first_name + last_name
  if (user.first_name) {
    return `${user.first_name} ${user.last_name || ''}`.trim();
  }

  // Priority 3: name field (common in some auth providers)
  if (user.name && !looksLikeUsername(user.name)) {
    return user.name;
  }

  // Priority 4: Clean up email prefix
  if (user.email) {
    return cleanEmailToName(user.email);
  }

  // Priority 5: Try to clean full_name or name even if it looks like username
  if (user.full_name) {
    return cleanUsername(user.full_name);
  }
  if (user.name) {
    return cleanUsername(user.name);
  }

  return fallback;
}

/**
 * Check if a string looks like a username with random suffix
 * Examples: "robert_smith_xdv0", "john_doe_xc0n", "user_123abc"
 */
function looksLikeUsername(str: string): boolean {
  // Check for common patterns that indicate auto-generated usernames
  const patterns = [
    /_[a-z0-9]{3,}$/i,  // Ends with underscore + 3+ alphanumeric chars (e.g., _xdv0)
    /_[a-z]{1,2}\d+$/i, // Ends with underscore + 1-2 letters + numbers (e.g., _xc01)
    /\d{5,}$/,          // Ends with 5+ consecutive digits
    /@.*$/,             // Contains @ (email-like)
  ];

  return patterns.some(pattern => pattern.test(str));
}

/**
 * Clean a username by removing random suffixes and converting to proper name format
 */
function cleanUsername(username: string): string {
  // Remove random suffixes like _xdv0, _xc0n, _123abc
  let cleaned = username.replace(/_[a-z0-9]{3,}$/i, '');

  // Remove trailing numbers
  cleaned = cleaned.replace(/_?\d+$/, '');

  // Convert separators to spaces
  cleaned = cleaned.replace(/[._-]/g, ' ');

  // Capitalize each word
  cleaned = cleaned
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return cleaned || username;
}

/**
 * Convert email to a displayable name
 */
function cleanEmailToName(email: string): string {
  // Get the part before @
  const prefix = email.split('@')[0];

  // Clean it like a username
  return cleanUsername(prefix);
}

/**
 * Get the first name from a full name or user object
 */
export function getFirstName(user: UserLike | null | undefined, fallback: string = 'User'): string {
  const fullName = getDisplayName(user, fallback);
  return fullName.split(' ')[0] || fallback;
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string): string {
  const words = name.split(' ').filter(Boolean);
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}
