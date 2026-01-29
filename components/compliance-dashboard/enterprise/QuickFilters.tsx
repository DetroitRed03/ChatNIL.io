'use client';

import { useState } from 'react';
import type { FilterConfig } from './ActionRequiredFilters';

interface SavedFilter {
  id: string;
  name: string;
  filterConfig: FilterConfig;
  isDefault?: boolean;
  isShared?: boolean;
}

interface QuickFiltersProps {
  savedFilters: SavedFilter[];
  activeFilterId: string | null;
  onFilterSelect: (filter: SavedFilter) => void;
  onSaveCurrentFilter: (name: string, isShared: boolean) => void;
  onDeleteFilter: (filterId: string) => void;
  currentFilters: FilterConfig;
}

export function QuickFilters({
  savedFilters,
  activeFilterId,
  onFilterSelect,
  onSaveCurrentFilter,
  onDeleteFilter,
  currentFilters
}: QuickFiltersProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [isShared, setIsShared] = useState(false);

  const handleSave = () => {
    if (newFilterName.trim()) {
      onSaveCurrentFilter(newFilterName.trim(), isShared);
      setNewFilterName('');
      setIsShared(false);
      setShowSaveModal(false);
    }
  };

  // Built-in presets
  const presets = [
    { id: 'all', name: 'All Items', count: null },
    { id: 'critical-only', name: 'Critical Only', count: null },
    { id: 'unassigned', name: 'Unassigned', count: null },
    { id: 'overdue', name: 'Overdue', count: null }
  ];

  return (
    <div className="flex items-center gap-2 mb-4" data-testid="quick-filters">
      {/* Built-in Presets */}
      <div className="flex items-center gap-1">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => {
              // Apply preset filters
              const presetFilters: Partial<FilterConfig> = {};
              switch (preset.id) {
                case 'all':
                  presetFilters.severity = ['critical', 'warning'];
                  presetFilters.assignee = null;
                  break;
                case 'critical-only':
                  presetFilters.severity = ['critical'];
                  break;
                case 'unassigned':
                  presetFilters.assignee = 'unassigned';
                  break;
                case 'overdue':
                  // This would be handled by dateRange
                  break;
              }
              onFilterSelect({
                id: preset.id,
                name: preset.name,
                filterConfig: { ...currentFilters, ...presetFilters }
              });
            }}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              activeFilterId === preset.id
                ? 'bg-gray-900 border-gray-900 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Divider */}
      {savedFilters.length > 0 && (
        <div className="w-px h-6 bg-gray-200 mx-2" />
      )}

      {/* Saved Filters */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {savedFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterSelect(filter)}
            className={`group flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
              activeFilterId === filter.id
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            {filter.isShared && (
              <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
            {filter.name}
            {filter.isDefault && (
              <span className="text-xs opacity-50">(default)</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFilter(filter.id);
              }}
              className={`opacity-0 group-hover:opacity-100 -mr-1 p-0.5 rounded hover:bg-black/10 ${
                activeFilterId === filter.id ? 'hover:bg-white/20' : ''
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>
        ))}
      </div>

      {/* Save Current Filter Button */}
      <button
        onClick={() => setShowSaveModal(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-full hover:border-gray-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Save filter
      </button>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Current Filter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Name
                </label>
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="e.g., Football Critical Deals"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-600">Share with team</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setNewFilterName('');
                  setIsShared(false);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newFilterName.trim()}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
