'use client';

import { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Trophy,
  MapPin,
  GraduationCap,
  Users,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AthleteDiscoveryFilters } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscoverFiltersProps {
  filters: AthleteDiscoveryFilters;
  onFiltersChange: (filters: AthleteDiscoveryFilters) => void;
  onSearch: () => void;
}

const SPORTS = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Volleyball', 'Track', 'Swimming', 'Tennis'];
const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const CONTENT_CATEGORIES = ['fitness', 'lifestyle', 'fashion', 'gaming', 'food', 'travel', 'sports', 'education', 'music', 'comedy', 'beauty', 'tech'];

export function DiscoverFilters({ filters, onFiltersChange, onSearch }: DiscoverFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['sport', 'state']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

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

  const handleClearFilters = () => {
    onFiltersChange({});
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search athletes by name or school..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Quick filters */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4 border-t border-gray-200">
              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {filters.sports?.map(sport => (
                    <span key={sport} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-medium">
                      <Trophy className="w-3 h-3" />
                      {sport}
                      <button onClick={() => handleSportToggle(sport)} className="hover:text-primary-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.states?.slice(0, 3).map(state => (
                    <span key={state} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                      <MapPin className="w-3 h-3" />
                      {state}
                      <button onClick={() => handleStateToggle(state)} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.states && filters.states.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                      +{filters.states.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Sport filter */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('sport')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900">Sport</span>
                    {filters.sports && filters.sports.length > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-primary-700 bg-primary-100 rounded-full">
                        {filters.sports.length}
                      </span>
                    )}
                  </div>
                  {expandedSections.has('sport') ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.has('sport') && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 flex flex-wrap gap-2">
                        {SPORTS.map(sport => (
                          <button
                            key={sport}
                            onClick={() => handleSportToggle(sport)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              filters.sports?.includes(sport)
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {sport}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* State filter */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('state')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">State / Location</span>
                    {filters.states && filters.states.length > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
                        {filters.states.length}
                      </span>
                    )}
                  </div>
                  {expandedSections.has('state') ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.has('state') && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                        {STATES.map(state => (
                          <button
                            key={state}
                            onClick={() => handleStateToggle(state)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                              filters.states?.includes(state)
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* School Level & Metrics */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('demographics')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Demographics & Metrics</span>
                  </div>
                  {expandedSections.has('demographics') ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.has('demographics') && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4 bg-gray-50">
                        {/* School Level */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">School Level</label>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.school_levels?.includes('high_school') || false}
                                onChange={(e) => {
                                  const levels = filters.school_levels || [];
                                  const updated = e.target.checked
                                    ? [...levels, 'high_school' as const]
                                    : levels.filter(l => l !== 'high_school');
                                  onFiltersChange({ ...filters, school_levels: updated.length > 0 ? updated : undefined });
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700">High School</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.school_levels?.includes('college') || false}
                                onChange={(e) => {
                                  const levels = filters.school_levels || [];
                                  const updated = e.target.checked
                                    ? [...levels, 'college' as const]
                                    : levels.filter(l => l !== 'college');
                                  onFiltersChange({ ...filters, school_levels: updated.length > 0 ? updated : undefined });
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700">College</span>
                            </label>
                          </div>
                        </div>

                        {/* Followers */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                            <Users className="w-3.5 h-3.5" />
                            Followers Range
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="Min (e.g., 10K)"
                              value={filters.min_followers || ''}
                              onChange={(e) => onFiltersChange({ ...filters, min_followers: e.target.value ? parseInt(e.target.value) : undefined })}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <input
                              type="number"
                              placeholder="Max (e.g., 1M)"
                              value={filters.max_followers || ''}
                              onChange={(e) => onFiltersChange({ ...filters, max_followers: e.target.value ? parseInt(e.target.value) : undefined })}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>

                        {/* FMV */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                            <DollarSign className="w-3.5 h-3.5" />
                            Fair Market Value Range
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="Min ($)"
                              value={filters.min_fmv || ''}
                              onChange={(e) => onFiltersChange({ ...filters, min_fmv: e.target.value ? parseInt(e.target.value) : undefined })}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <input
                              type="number"
                              placeholder="Max ($)"
                              value={filters.max_fmv || ''}
                              onChange={(e) => onFiltersChange({ ...filters, max_fmv: e.target.value ? parseInt(e.target.value) : undefined })}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>

                        {/* Engagement */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Min Engagement Rate (%)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g., 5"
                            step="0.1"
                            value={filters.min_engagement || ''}
                            onChange={(e) => onFiltersChange({ ...filters, min_engagement: e.target.value ? parseFloat(e.target.value) : undefined })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content Categories */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('categories')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Content Categories</span>
                    {filters.content_categories && filters.content_categories.length > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                        {filters.content_categories.length}
                      </span>
                    )}
                  </div>
                  {expandedSections.has('categories') ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.has('categories') && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 flex flex-wrap gap-2">
                        {CONTENT_CATEGORIES.map(category => (
                          <button
                            key={category}
                            onClick={() => handleCategoryToggle(category)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                              filters.content_categories?.includes(category)
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Availability */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.available_only || false}
                    onChange={(e) => onFiltersChange({ ...filters, available_only: e.target.checked || undefined })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Show only available athletes</span>
                </label>
              </div>

              {/* Apply button */}
              <button
                onClick={onSearch}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-orange-600 hover:from-primary-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
