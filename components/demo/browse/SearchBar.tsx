'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sportFilter?: string;
  onSportFilterChange?: (sport: string) => void;
  sports?: string[];
  resultCount?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  sportFilter,
  onSportFilterChange,
  sports = [],
  resultCount
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-text-tertiary" />
          </button>
        )}
      </div>

      {/* Filters and Results */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Sport Filter */}
        {sports.length > 0 && onSportFilterChange && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Filter className="h-4 w-4" />
              <span>Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSportFilterChange('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  sportFilter === 'all'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white border border-border text-text-secondary hover:border-primary-300'
                )}
              >
                All Sports
              </button>
              {sports.slice(0, 5).map((sport) => (
                <button
                  key={sport}
                  onClick={() => onSportFilterChange(sport)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    sportFilter === sport
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white border border-border text-text-secondary hover:border-primary-300'
                  )}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Count */}
        {resultCount !== undefined && (
          <Badge variant="gray" size="lg">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </Badge>
        )}
      </div>
    </div>
  );
}
