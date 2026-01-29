'use client';

import { useState, useCallback } from 'react';

export interface FilterConfig {
  severity: ('critical' | 'warning')[];
  sport: string[];
  status: string[];
  assignee: string | null;
  dateRange: { from: string; to: string } | null;
  sortBy: 'severity' | 'date' | 'amount' | 'athlete';
  sortOrder: 'asc' | 'desc';
}

interface ActionRequiredFiltersProps {
  sports: string[];
  teamMembers: { id: string; name: string }[];
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
  onClearFilters: () => void;
}

export function ActionRequiredFilters({
  sports,
  teamMembers,
  filters,
  onFilterChange,
  onClearFilters
}: ActionRequiredFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSeverityToggle = useCallback((severity: 'critical' | 'warning') => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    onFilterChange({ ...filters, severity: newSeverity });
  }, [filters, onFilterChange]);

  const handleSportChange = useCallback((sport: string) => {
    const newSports = filters.sport.includes(sport)
      ? filters.sport.filter(s => s !== sport)
      : [...filters.sport, sport];
    onFilterChange({ ...filters, sport: newSports });
  }, [filters, onFilterChange]);

  const handleAssigneeChange = useCallback((assignee: string | null) => {
    onFilterChange({ ...filters, assignee });
  }, [filters, onFilterChange]);

  const handleSortChange = useCallback((sortBy: FilterConfig['sortBy']) => {
    const newOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFilterChange({ ...filters, sortBy, sortOrder: newOrder });
  }, [filters, onFilterChange]);

  const activeFilterCount = [
    filters.severity.length < 2 ? 1 : 0,
    filters.sport.length > 0 ? 1 : 0,
    filters.assignee ? 1 : 0,
    filters.dateRange ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4" data-testid="action-filters">
      <div className="flex flex-wrap items-center gap-3">
        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Severity:</span>
          <button
            onClick={() => handleSeverityToggle('critical')}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filters.severity.includes('critical')
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => handleSeverityToggle('warning')}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filters.severity.includes('warning')
                ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            Warning
          </button>
        </div>

        {/* Sport Dropdown */}
        <div className="relative">
          <select
            value=""
            onChange={(e) => e.target.value && handleSportChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
          >
            <option value="">Sport {filters.sport.length > 0 && `(${filters.sport.length})`}</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>
                {filters.sport.includes(sport) ? '✓ ' : ''}{sport}
              </option>
            ))}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Assignee Dropdown */}
        <div className="relative">
          <select
            value={filters.assignee || ''}
            onChange={(e) => handleAssigneeChange(e.target.value || null)}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Date Range */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
              filters.dateRange
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {filters.dateRange ? 'Date Range Set' : 'Date Range'}
            </span>
          </button>
          {showDatePicker && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    dateRange: { from: e.target.value, to: filters.dateRange?.to || '' }
                  })}
                  className="px-2 py-1 text-sm border rounded"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    dateRange: { from: filters.dateRange?.from || '', to: e.target.value }
                  })}
                  className="px-2 py-1 text-sm border rounded"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    onFilterChange({ ...filters, dateRange: null });
                    setShowDatePicker(false);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort:</span>
          {(['severity', 'date', 'amount', 'athlete'] as const).map(option => (
            <button
              key={option}
              onClick={() => handleSortChange(option)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filters.sortBy === option
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
              {filters.sortBy === option && (
                <span className="ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
              )}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Active Sport Tags */}
      {filters.sport.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {filters.sport.map(sport => (
            <span
              key={sport}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
            >
              {sport}
              <button
                onClick={() => handleSportChange(sport)}
                className="hover:text-gray-900"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
