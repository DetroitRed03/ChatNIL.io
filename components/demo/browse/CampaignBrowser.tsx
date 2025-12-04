'use client';

import React, { useState, useEffect } from 'react';
import { CampaignCard, type CampaignCardData } from '../cards/CampaignCard';
import { CampaignCardSkeleton } from '../cards/CardSkeleton';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePagination } from '@/lib/demo/usePagination';
import { searchCampaigns } from '@/lib/demo/demo-filters';

interface CampaignBrowserProps {
  onSelect: (campaignId: string) => void;
  selectedCampaignId?: string;
  itemsPerPage?: number;
}

export function CampaignBrowser({
  onSelect,
  selectedCampaignId,
  itemsPerPage = 12
}: CampaignBrowserProps) {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage
  } = usePagination(filteredCampaigns, itemsPerPage);

  // Fetch campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      setIsLoading(true);
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
        setIsLoading(false);
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
    goToPage(1); // Reset to first page when filters change
  }, [searchQuery, campaigns]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search campaigns by name, brand, or sport..."
        resultCount={filteredCampaigns.length}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
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
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {paginatedItems.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CampaignCard
                    campaign={campaign}
                    onClick={onSelect}
                    isSelected={selectedCampaignId === campaign.id}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onNext={nextPage}
              onPrev={prevPage}
            />
          )}
        </>
      )}
    </div>
  );
}
