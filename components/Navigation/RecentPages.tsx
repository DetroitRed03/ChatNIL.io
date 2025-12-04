'use client';

import { useRouter } from 'next/navigation';
import { Clock, X } from 'lucide-react';
import { usePageHistory, type PageHistoryEntry } from '@/hooks/usePageHistory';

interface RecentPagesProps {
  limit?: number;
  className?: string;
}

/**
 * Formats a timestamp as relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * RecentPages Component
 *
 * Displays a list of recently visited pages with quick navigation
 */
export default function RecentPages({ limit = 5, className = '' }: RecentPagesProps) {
  const router = useRouter();
  const { recentPages, removeEntry } = usePageHistory();

  // Get limited list
  const pages = recentPages.slice(0, limit);

  if (pages.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <Clock className="w-3 h-3" />
        <span>Recent</span>
      </div>

      <div className="space-y-1 px-2">
        {pages.map((page) => (
          <div
            key={page.path}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <button
              onClick={() => router.push(page.path)}
              className="flex-1 flex items-center gap-2 text-left min-w-0"
            >
              <span className="text-lg flex-shrink-0">{page.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">{page.title}</div>
                <div className="text-xs text-gray-500">{formatRelativeTime(page.timestamp)}</div>
              </div>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeEntry(page.path);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-all flex-shrink-0"
              aria-label={`Remove ${page.title} from history`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
