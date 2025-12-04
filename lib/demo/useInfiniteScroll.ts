'use client';

import { useState, useMemo, useCallback } from 'react';

export function useInfiniteScroll<T>(
  items: T[],
  itemsPerLoad: number = 12
) {
  const [displayedCount, setDisplayedCount] = useState(itemsPerLoad);
  const [isLoading, setIsLoading] = useState(false);

  const displayedItems = useMemo(() => {
    return items.slice(0, displayedCount);
  }, [items, displayedCount]);

  const hasMore = displayedCount < items.length;

  const loadMore = useCallback(() => {
    setIsLoading(true);

    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + itemsPerLoad, items.length));
      setIsLoading(false);
    }, 300);
  }, [itemsPerLoad, items.length]);

  const reset = useCallback(() => {
    setDisplayedCount(itemsPerLoad);
  }, [itemsPerLoad]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    reset,
    totalCount: items.length,
    displayedCount
  };
}
