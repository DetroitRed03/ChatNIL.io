'use client';

import { ActionRequiredItem } from './ActionRequiredItem';

interface ActionItem {
  id: string;
  athleteId: string;
  athleteName: string;
  dealId: string;
  severity: 'critical' | 'warning';
  issue: string;
  amount: number;
  action: string;
  dueDate?: string;
}

interface ActionRequiredSectionProps {
  items: ActionItem[];
  totalCount: number;
  onViewAll: () => void;
  onItemClick: (item: ActionItem) => void;
}

export function ActionRequiredSection({
  items,
  totalCount,
  onViewAll,
  onItemClick
}: ActionRequiredSectionProps) {
  const hasCritical = items.some(item => item.severity === 'critical');
  const displayItems = items.slice(0, 5);
  const hasMore = totalCount > 5;

  return (
    <div
      data-testid="action-required-section"
      className={`bg-white rounded-lg shadow-sm border-l-4 ${
        hasCritical ? 'border-l-red-500' : 'border-l-yellow-500'
      }`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {hasCritical ? (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 animate-pulse">
                <span className="text-red-600 text-lg">!</span>
              </span>
            ) : (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                <span className="text-yellow-600 text-lg">!</span>
              </span>
            )}
          </span>
          <h2 className="text-lg font-semibold text-gray-900">
            ACTION REQUIRED
          </h2>
          <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
            hasCritical
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {totalCount}
          </span>
        </div>
        {hasMore && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All {totalCount}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-100">
        {displayItems.map((item) => (
          <ActionRequiredItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>

      {/* Footer if more items */}
      {hasMore && (
        <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={onViewAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            +{totalCount - 5} more items requiring attention
          </button>
        </div>
      )}
    </div>
  );
}
