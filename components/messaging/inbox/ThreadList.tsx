'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { ThreadItem } from './ThreadItem';
import { EmptyInbox } from './EmptyInbox';
import type { ThreadListItem } from '@/types/messaging';

interface ThreadListProps {
  threads: ThreadListItem[];
  activeThreadId: string | null;
  onThreadSelect: (thread: ThreadListItem) => void;
  isLoading: boolean;
  viewerRole: 'agency' | 'athlete';
  className?: string;
}

/**
 * Scrollable list of conversation threads
 * - Search filter
 * - Thread items
 * - Loading state
 * - Empty state
 */
export function ThreadList({
  threads,
  activeThreadId,
  onThreadSelect,
  isLoading,
  viewerRole,
  className,
}: ThreadListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter threads by search query
  const filteredThreads = threads.filter(thread => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const participant = thread.participant;
    return (
      participant.display_name.toLowerCase().includes(query) ||
      participant.company_name?.toLowerCase().includes(query) ||
      participant.sport?.toLowerCase().includes(query) ||
      participant.school?.toLowerCase().includes(query)
    );
  });

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Search header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : filteredThreads.length === 0 ? (
          searchQuery ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-gray-500">No conversations found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-orange-500 hover:text-orange-600 text-sm mt-2"
              >
                Clear search
              </button>
            </div>
          ) : (
            <EmptyInbox role={viewerRole} />
          )
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredThreads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === activeThreadId}
                onClick={() => onThreadSelect(thread)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
