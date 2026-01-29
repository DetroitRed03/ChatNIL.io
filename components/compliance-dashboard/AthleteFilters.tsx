'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

interface AthleteFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  selectedSport: string;
  onSportChange: (sport: string) => void;
  sports: string[];
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  focusSearch?: boolean;
}

export function AthleteFilters({
  search,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  selectedSport,
  onSportChange,
  sports,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  focusSearch
}: AthleteFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [focusSearch]);

  const statusOptions = [
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-amber-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'none', label: 'No Deals', color: 'bg-gray-400' }
  ];

  const sortOptions = [
    { value: 'severity', label: 'Severity' },
    { value: 'name', label: 'Name' },
    { value: 'deals', label: 'Deal Count' },
    { value: 'score', label: 'Lowest Score' }
  ];

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onStatusChange([]);
    onSportChange('');
    onSortChange('severity');
    onSortOrderChange('desc');
  };

  const hasActiveFilters = search || selectedStatuses.length > 0 || selectedSport || sortBy !== 'severity';

  return (
    <div data-testid="athlete-filters" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchRef}
            data-testid="athlete-search"
            type="text"
            placeholder="Search athletes by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-orange-300 bg-orange-50 text-orange-700'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status.value}
                    onClick={() => toggleStatus(status.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedStatuses.includes(status.value)
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sport Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sport
              </label>
              <div className="relative">
                <select
                  value={selectedSport}
                  onChange={(e) => onSportChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Sports</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
