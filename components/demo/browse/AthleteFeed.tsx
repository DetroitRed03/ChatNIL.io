'use client';

import React, { useState, useEffect } from 'react';
import { AthleteCard, type AthleteCardData } from '../cards/AthleteCard';
import { AthleteCardSkeleton } from '../cards/CardSkeleton';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInfiniteScroll } from '@/lib/demo/useInfiniteScroll';
import { filterAthletes, searchAthletes } from '@/lib/demo/demo-filters';

interface AthleteFeedProps {
  onSelect: (athleteId: string) => void;
  selectedAthleteId?: string;
  itemsPerLoad?: number;
}

export function AthleteFeed({
  onSelect,
  selectedAthleteId,
  itemsPerLoad = 12
}: AthleteFeedProps) {
  const [athletes, setAthletes] = useState<AthleteCardData[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<AthleteCardData[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');

  const {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    reset
  } = useInfiniteScroll(filteredAthletes, itemsPerLoad);

  // Fetch athletes
  useEffect(() => {
    async function fetchAthletes() {
      setIsInitialLoading(true);
      try {
        const response = await fetch('/api/demo/fmv/athletes');
        if (response.ok) {
          const data = await response.json();
          setAthletes(data.athletes || []);
          setFilteredAthletes(data.athletes || []);
        }
      } catch (error) {
        console.error('Failed to fetch athletes:', error);
      } finally {
        setIsInitialLoading(false);
      }
    }
    fetchAthletes();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = athletes;

    if (searchQuery) {
      result = searchAthletes(result, searchQuery);
    }

    if (sportFilter !== 'all') {
      result = filterAthletes(result, { sport: sportFilter });
    }

    setFilteredAthletes(result);
    reset(); // Reset infinite scroll when filters change
  }, [searchQuery, sportFilter, athletes, reset]);

  const uniqueSports = Array.from(
    new Set(athletes.map(a => a.sport).filter(Boolean))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search athletes by name or school..."
        sportFilter={sportFilter}
        onSportFilterChange={setSportFilter}
        sports={uniqueSports}
        resultCount={filteredAthletes.length}
      />

      {/* Feed */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerLoad }).map((_, i) => (
            <AthleteCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAthletes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Athletes Found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((athlete, index) => (
              <motion.div
                key={athlete.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <AthleteCard
                  athlete={athlete}
                  onClick={onSelect}
                  isSelected={selectedAthleteId === athlete.id}
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
                  `Load More (${filteredAthletes.length - displayedItems.length} remaining)`
                )}
              </Button>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && displayedItems.length > 0 && (
            <div className="text-center py-8 text-text-secondary">
              <p>You've reached the end of the results</p>
              <p className="text-sm mt-1">
                Showing all {displayedItems.length} athletes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
