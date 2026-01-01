'use client';

import { Search, X, Trophy, MapPin, Users, DollarSign, TrendingUp, Tag, CheckCircle2 } from 'lucide-react';
import { AthleteDiscoveryFilters } from '@/types';
import { FilterSection } from './FilterSection';

interface DiscoverSidebarProps {
  filters: AthleteDiscoveryFilters;
  onFiltersChange: (filters: AthleteDiscoveryFilters) => void;
  onSearch: () => void;
  className?: string;
}

const SPORTS = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Volleyball', 'Track', 'Swimming', 'Tennis'];
const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const CONTENT_CATEGORIES = ['fitness', 'lifestyle', 'fashion', 'gaming', 'food', 'travel', 'sports', 'education', 'music', 'comedy', 'beauty', 'tech'];
const SCHOOL_LEVELS = [
  { value: 'D1', label: 'Division I' },
  { value: 'D2', label: 'Division II' },
  { value: 'D3', label: 'Division III' },
  { value: 'NAIA', label: 'NAIA' },
  { value: 'high_school', label: 'High School' },
];

/**
 * DiscoverSidebar Component
 *
 * Persistent filter sidebar for the Discover page.
 * All filters affect the athlete results including who becomes the #1 match.
 */
export function DiscoverSidebar({
  filters,
  onFiltersChange,
  onSearch,
  className = ''
}: DiscoverSidebarProps) {

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleSportToggle = (sport: string) => {
    const sports = filters.sports || [];
    const updated = sports.includes(sport)
      ? sports.filter(s => s !== sport)
      : [...sports, sport];
    onFiltersChange({ ...filters, sports: updated.length > 0 ? updated : undefined });
  };

  const handleStateToggle = (state: string) => {
    const states = filters.states || [];
    const updated = states.includes(state)
      ? states.filter(s => s !== state)
      : [...states, state];
    onFiltersChange({ ...filters, states: updated.length > 0 ? updated : undefined });
  };

  const handleCategoryToggle = (category: string) => {
    const categories = filters.content_categories || [];
    const updated = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    onFiltersChange({ ...filters, content_categories: updated.length > 0 ? updated : undefined });
  };

  const handleSchoolLevelToggle = (level: string) => {
    const levels = (filters.school_levels || []) as string[];
    const updated = levels.includes(level)
      ? levels.filter(l => l !== level)
      : [...levels, level];
    onFiltersChange({
      ...filters,
      school_levels: updated.length > 0 ? updated as ('high_school' | 'college')[] : undefined
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
    onSearch();
  };

  const activeFilterCount = [
    filters.sports?.length,
    filters.states?.length,
    filters.school_levels?.length,
    filters.content_categories?.length,
    filters.min_followers ? 1 : 0,
    filters.max_followers ? 1 : 0,
    filters.min_fmv ? 1 : 0,
    filters.max_fmv ? 1 : 0,
    filters.min_engagement ? 1 : 0,
    filters.available_only ? 1 : 0,
  ].reduce((sum: number, count) => sum + (count || 0), 0);

  return (
    <aside className={`bg-white h-full overflow-y-auto ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-500">Refine your athlete search</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search athletes..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
          />
        </div>

        {/* Filter Sections */}
        <div className="space-y-1">
          {/* Sport Filter */}
          <FilterSection
            title="Sport"
            defaultOpen={true}
            badge={filters.sports?.length}
          >
            <div className="flex flex-wrap gap-1.5">
              {SPORTS.map(sport => (
                <button
                  key={sport}
                  onClick={() => {
                    handleSportToggle(sport);
                    onSearch();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.sports?.includes(sport)
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Followers Range */}
          <FilterSection
            title="Followers"
            defaultOpen={true}
            badge={(filters.min_followers || filters.max_followers) ? 1 : undefined}
          >
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_followers || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      min_followers: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    onBlur={onSearch}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.max_followers || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      max_followers: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    onBlur={onSearch}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '10K+', min: 10000 },
                  { label: '50K+', min: 50000 },
                  { label: '100K+', min: 100000 },
                  { label: '500K+', min: 500000 },
                ].map(({ label, min }) => (
                  <button
                    key={label}
                    onClick={() => {
                      onFiltersChange({ ...filters, min_followers: min, max_followers: undefined });
                      onSearch();
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      filters.min_followers === min && !filters.max_followers
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Engagement Rate */}
          <FilterSection
            title="Engagement Rate"
            defaultOpen={false}
            badge={filters.min_engagement ? 1 : undefined}
          >
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum %</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 3.5"
                  value={filters.min_engagement || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    min_engagement: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  onBlur={onSearch}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '3%+', value: 3 },
                  { label: '5%+', value: 5 },
                  { label: '8%+', value: 8 },
                  { label: '10%+', value: 10 },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => {
                      onFiltersChange({ ...filters, min_engagement: value });
                      onSearch();
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      filters.min_engagement === value
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Location */}
          <FilterSection
            title="Location"
            defaultOpen={false}
            badge={filters.states?.length}
          >
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {STATES.map(state => (
                <button
                  key={state}
                  onClick={() => {
                    handleStateToggle(state);
                    onSearch();
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    filters.states?.includes(state)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* School Level */}
          <FilterSection
            title="School Level"
            defaultOpen={false}
            badge={filters.school_levels?.length}
          >
            <div className="space-y-2">
              {SCHOOL_LEVELS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.school_levels as string[] || []).includes(value)}
                    onChange={() => {
                      handleSchoolLevelToggle(value);
                      onSearch();
                    }}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* FMV Range */}
          <FilterSection
            title="FMV Range"
            defaultOpen={false}
            badge={(filters.min_fmv || filters.max_fmv) ? 1 : undefined}
          >
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min $</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_fmv || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      min_fmv: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    onBlur={onSearch}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max $</label>
                  <input
                    type="number"
                    placeholder="Any"
                    value={filters.max_fmv || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      max_fmv: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    onBlur={onSearch}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '$1K+', min: 1000 },
                  { label: '$5K+', min: 5000 },
                  { label: '$10K+', min: 10000 },
                  { label: '$25K+', min: 25000 },
                ].map(({ label, min }) => (
                  <button
                    key={label}
                    onClick={() => {
                      onFiltersChange({ ...filters, min_fmv: min, max_fmv: undefined });
                      onSearch();
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      filters.min_fmv === min && !filters.max_fmv
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Content Categories */}
          <FilterSection
            title="Content Categories"
            defaultOpen={false}
            badge={filters.content_categories?.length}
          >
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    handleCategoryToggle(category);
                    onSearch();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    filters.content_categories?.includes(category)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Availability */}
          <FilterSection title="Availability" defaultOpen={false}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available_only || false}
                onChange={(e) => {
                  onFiltersChange({ ...filters, available_only: e.target.checked || undefined });
                  onSearch();
                }}
                className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
              />
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Available athletes only</span>
            </label>
          </FilterSection>
        </div>

        {/* Footer with active filters count */}
        {activeFilterCount > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
