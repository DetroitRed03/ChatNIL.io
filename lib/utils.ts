import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper handling of conflicts
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param amount - The number to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$1,234")
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers with K/M suffixes
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.2M", "12.5K", "234")
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Truncate a string to a specified length with ellipsis
 * @param str - The string to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated string with "..." if needed
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Sleep utility for async operations
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Resolves best available display name for an athlete
 * Uses a fallback chain to always return a meaningful name
 *
 * Fallback order:
 * 1. display_name (from athlete_public_profiles)
 * 2. first_name + last_name (from users table)
 * 3. username
 * 4. email prefix (part before @)
 * 5. "Athlete #[short-id]"
 *
 * @param options - Object containing possible name sources
 * @returns A non-empty display name string
 */
export function resolveAthleteName(options: {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  id?: string | null;
}): string {
  const { displayName, firstName, lastName, username, email, id } = options;

  // 1. Best: display_name from athlete_public_profiles
  if (displayName?.trim()) {
    return displayName.trim();
  }

  // 2. First + Last name if either exists
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (fullName) {
    return fullName;
  }

  // 3. Username if available
  if (username?.trim()) {
    return username.trim();
  }

  // 4. Email prefix (before @)
  if (email?.trim()) {
    const prefix = email.split('@')[0];
    // Capitalize first letter for readability
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  // 5. Last resort: Athlete #[short-id]
  if (id) {
    return `Athlete #${id.slice(0, 8)}`;
  }

  return 'Unknown Athlete';
}
