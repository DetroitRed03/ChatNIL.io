'use client';

import { OpportunityCard } from './OpportunityCard';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';

interface Opportunity {
  id: string;
  agency_id: string;
  athlete_id: string;
  match_score: number;
  match_tier?: string;
  match_reasons?: string[];
  score_breakdown?: Record<string, number>;
  status: string;
  contacted_at?: string;
  created_at: string;
  deal_id?: string;
  athlete_response_status?: string;
  agency_name?: string;
  agency_email?: string;
  agency_first_name?: string;
  agency_last_name?: string;
}

interface OpportunityListProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onViewDetails: (opportunity: Opportunity) => void;
  onRespond?: (opportunityId: string, response: 'interested' | 'declined') => void;
  viewMode?: 'grid' | 'list';
}

export function OpportunityList({
  opportunities,
  isLoading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  onViewDetails,
  onRespond,
  viewMode = 'grid'
}: OpportunityListProps) {
  // Loading State
  if (isLoading && opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading opportunities...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load opportunities</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // Empty State
  if (opportunities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No opportunities yet
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          Complete your profile and connect your social media accounts to get matched with agencies looking for athletes like you!
        </p>
        <button
          onClick={() => window.location.href = '/profile/edit'}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Complete Your Profile
        </button>
      </div>
    );
  }

  // Grid or List View
  const containerClass = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr'
    : 'space-y-4';

  return (
    <div>
      {/* Opportunities Grid/List */}
      <div className={containerClass}>
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onViewDetails={() => onViewDetails(opportunity)}
            onRespond={onRespond ? (response) => onRespond(opportunity.id, response) : undefined}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoading && opportunities.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin mr-2" />
          <span className="text-gray-600">Loading more...</span>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            Load More Opportunities
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* End of List Indicator */}
      {!hasMore && opportunities.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          You've viewed all available opportunities
        </div>
      )}
    </div>
  );
}
