'use client';

import React, { useState, useEffect } from 'react';
import { AthleteCard, type AthleteCardData } from '../cards/AthleteCard';
import { AthleteCardSkeleton } from '../cards/CardSkeleton';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePagination } from '@/lib/demo/usePagination';
import { filterAthletes, searchAthletes } from '@/lib/demo/demo-filters';

interface AthleteBrowserProps {
  onSelect: (athleteId: string) => void;
  selectedAthleteId?: string;
  itemsPerPage?: number;
}

export function AthleteBrowser({
  onSelect,
  selectedAthleteId,
  itemsPerPage = 12
}: AthleteBrowserProps) {
  const [athletes, setAthletes] = useState<AthleteCardData[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<AthleteCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage
  } = usePagination(filteredAthletes, itemsPerPage);

  // Fetch athletes
  useEffect(() => {
    async function fetchAthletes() {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    }
    fetchAthletes();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = athletes;

    // Search filter
    if (searchQuery) {
      result = searchAthletes(result, searchQuery);
    }

    // Sport filter
    if (sportFilter !== 'all') {
      result = filterAthletes(result, { sport: sportFilter });
    }

    setFilteredAthletes(result);
    goToPage(1); // Reset to first page when filters change
  }, [searchQuery, sportFilter, athletes]);

  // Get unique sports for filter
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

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
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
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedItems.map((athlete) => (
                <motion.div
                  key={athlete.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <AthleteCard
                    athlete={athlete}
                    onClick={onSelect}
                    isSelected={selectedAthleteId === athlete.id}
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
