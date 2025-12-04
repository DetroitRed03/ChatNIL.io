'use client';

import React, { useState, useEffect } from 'react';
import { CampaignCard, type CampaignCardData } from '../cards/CampaignCard';
import { CampaignCardSkeleton } from '../cards/CardSkeleton';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInfiniteScroll } from '@/lib/demo/useInfiniteScroll';
import { searchCampaigns } from '@/lib/demo/demo-filters';

interface CampaignFeedProps {
  onSelect: (campaignId: string) => void;
  selectedCampaignId?: string;
  itemsPerLoad?: number;
}

export function CampaignFeed({
  onSelect,
  selectedCampaignId,
  itemsPerLoad = 12
}: CampaignFeedProps) {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignCardData[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    reset
  } = useInfiniteScroll(filteredCampaigns, itemsPerLoad);

  // Fetch campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      setIsInitialLoading(true);
      try {
        const response = await fetch('/api/demo/matchmaking/campaigns');
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
          setFilteredCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setIsInitialLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  // Apply search filter
  useEffect(() => {
    let result = campaigns;

    if (searchQuery) {
      result = searchCampaigns(result, searchQuery);
    }

    setFilteredCampaigns(result);
    reset(); // Reset infinite scroll when filters change
  }, [searchQuery, campaigns, reset]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search campaigns by name, brand, or sport..."
        resultCount={filteredCampaigns.length}
      />

      {/* Feed */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerLoad }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Campaigns Found"
          description="Try adjusting your search"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <CampaignCard
                  campaign={campaign}
                  onClick={onSelect}
                  isSelected={selectedCampaignId === campaign.id}
                />
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={loadMore}
                disabled={isLoading}
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  `Load More (${filteredCampaigns.length - displayedItems.length} remaining)`
                )}
              </Button>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && displayedItems.length > 0 && (
            <div className="text-center py-8 text-text-secondary">
              <p>You've reached the end of the results</p>
              <p className="text-sm mt-1">
                Showing all {displayedItems.length} campaigns
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
