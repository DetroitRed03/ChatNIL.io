'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const MIN_WIDTH = 200; // Minimum sidebar width in pixels
const MAX_WIDTH = 480; // Maximum sidebar width in pixels
const DEFAULT_WIDTH = 256; // Default width (w-64 = 16rem = 256px)
const STORAGE_KEY = 'chatnil-sidebar-width';

/**
 * Loads saved sidebar width from localStorage
 */
function loadWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_WIDTH;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_WIDTH;

    const parsed = parseInt(stored, 10);
    if (isNaN(parsed)) return DEFAULT_WIDTH;

    // Ensure it's within bounds
    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed));
  } catch (error) {
    console.error('Failed to load sidebar width:', error);
    return DEFAULT_WIDTH;
  }
}

/**
 * Saves sidebar width to localStorage
 */
function saveWidth(width: number) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, width.toString());
  } catch (error) {
    console.error('Failed to save sidebar width:', error);
  }
}

/**
 * Hook for resizable sidebar functionality
 */
export function useSidebarResize() {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(DEFAULT_WIDTH);

  // Load width on mount
  useEffect(() => {
    setWidth(loadWidth());
  }, []);

  /**
   * Starts the resize operation
   */
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [width]);

  /**
   * Handles mouse move during resize
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;

    // Clamp to min/max
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));

    setWidth(clampedWidth);
  }, [isResizing]);

  /**
   * Ends the resize operation
   */
  const stopResize = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);

    // Restore default cursor and text selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    // Save the final width
    saveWidth(width);
  }, [isResizing, width]);

  /**
   * Resets sidebar to default width
   */
  const resetWidth = useCallback(() => {
    setWidth(DEFAULT_WIDTH);
    saveWidth(DEFAULT_WIDTH);
  }, []);

  // Add global mouse event listeners during resize
  useEffect(() => {
    if (!isResizing) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, handleMouseMove, stopResize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  return {
    width,
    isResizing,
    startResize,
    resetWidth,
    MIN_WIDTH,
    MAX_WIDTH,
    DEFAULT_WIDTH,
  };
}
