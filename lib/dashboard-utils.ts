/**
 * Dashboard Utilities
 * Shared helper functions for dashboard widgets and components
 */

/**
 * Format currency amounts for display
 * Converts large numbers to K/M notation
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

/**
 * Format relative time from timestamp
 * Returns human-readable time like "2h ago", "3d ago"
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Format percentage with + or - sign
 */
export function formatPercentageChange(value: number): string {
  if (value === 0) return '0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

/**
 * Get badge rarity color classes
 */
export function getBadgeRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'legendary':
      return 'text-yellow-600 bg-yellow-100';
    case 'epic':
      return 'text-purple-600 bg-purple-100';
    case 'rare':
      return 'text-blue-600 bg-blue-100';
    case 'uncommon':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get badge rarity icon
 */
export function getBadgeRarityIcon(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'legendary':
      return '👑';
    case 'epic':
      return '💎';
    case 'rare':
      return '⭐';
    case 'uncommon':
      return '✨';
    default:
      return '🏅';
  }
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format file size from bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
