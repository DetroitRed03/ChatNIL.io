/**
 * Reconsider Feature Utilities
 *
 * Helper functions for the athlete reconsider/undo feature.
 * Allows athletes to reconsider declined opportunities within 48 hours.
 */

// Time window in hours for reconsideration
export const RECONSIDER_WINDOW_HOURS = 48;

/**
 * Response history entry structure
 */
export interface ResponseHistoryEntry {
  status: 'accepted' | 'declined' | 'reconsidered' | 'invited';
  timestamp: string;
  reason?: string;
}

/**
 * Check if a declined opportunity can still be reconsidered
 * @param respondedAt - ISO timestamp of when the decline was made
 * @returns true if within the 48-hour reconsider window
 */
export function canReconsider(respondedAt: string | null | undefined): boolean {
  if (!respondedAt) return false;

  const responseTime = new Date(respondedAt).getTime();
  const now = Date.now();
  const hoursDiff = (now - responseTime) / (1000 * 60 * 60);

  return hoursDiff <= RECONSIDER_WINDOW_HOURS;
}

/**
 * Calculate remaining time to reconsider
 * @param respondedAt - ISO timestamp of when the decline was made
 * @returns Object with hours and minutes remaining, or null if expired
 */
export function getReconsiderTimeRemaining(respondedAt: string | null | undefined): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  expired: boolean;
  formatted: string;
} | null {
  if (!respondedAt) return null;

  const responseTime = new Date(respondedAt).getTime();
  const expiryTime = responseTime + (RECONSIDER_WINDOW_HOURS * 60 * 60 * 1000);
  const now = Date.now();

  if (now >= expiryTime) {
    return {
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      expired: true,
      formatted: 'Expired'
    };
  }

  const remainingMs = expiryTime - now;
  const totalMinutes = Math.floor(remainingMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Format as "X hours Y minutes" or "X minutes"
  let formatted: string;
  if (hours > 0) {
    formatted = `${hours}h ${minutes}m remaining`;
  } else {
    formatted = `${minutes}m remaining`;
  }

  return {
    hours,
    minutes,
    totalMinutes,
    expired: false,
    formatted
  };
}

/**
 * Create a response history entry
 */
export function createResponseHistoryEntry(
  status: ResponseHistoryEntry['status'],
  reason?: string
): ResponseHistoryEntry {
  return {
    status,
    timestamp: new Date().toISOString(),
    ...(reason && { reason })
  };
}

/**
 * Add entry to response history array
 */
export function addToResponseHistory(
  existingHistory: ResponseHistoryEntry[] | null,
  newEntry: ResponseHistoryEntry
): ResponseHistoryEntry[] {
  const history = existingHistory || [];
  return [...history, newEntry];
}

/**
 * Check if an item has been reconsidered before
 */
export function hasBeenReconsidered(history: ResponseHistoryEntry[] | null): boolean {
  if (!history || !Array.isArray(history)) return false;
  return history.some(entry => entry.status === 'reconsidered');
}

/**
 * Get count of times reconsidered
 */
export function getReconsiderCount(history: ResponseHistoryEntry[] | null): number {
  if (!history || !Array.isArray(history)) return 0;
  return history.filter(entry => entry.status === 'reconsidered').length;
}

/**
 * Format the reconsider deadline for display
 */
export function formatReconsiderDeadline(respondedAt: string | null | undefined): string {
  if (!respondedAt) return '';

  const deadline = new Date(new Date(respondedAt).getTime() + (RECONSIDER_WINDOW_HOURS * 60 * 60 * 1000));

  return deadline.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Validate if reconsider action is allowed
 * Returns an error message if not allowed, null if allowed
 */
export function validateReconsiderAction(
  currentStatus: string,
  respondedAt: string | null | undefined,
  responseHistory: ResponseHistoryEntry[] | null
): string | null {
  // Must be in declined status
  if (currentStatus !== 'declined') {
    return `Cannot reconsider - current status is "${currentStatus}", must be "declined"`;
  }

  // Must be within time window
  if (!canReconsider(respondedAt)) {
    return 'The 48-hour reconsider window has expired';
  }

  // Check if already reconsidered (only allow one reconsider)
  if (hasBeenReconsidered(responseHistory)) {
    return 'You can only reconsider a declined opportunity once';
  }

  return null; // Allowed
}
