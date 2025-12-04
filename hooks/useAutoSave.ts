import { useEffect, useRef, useState, useCallback } from 'react';

export interface AutoSaveOptions {
  delay?: number; // Debounce delay in milliseconds (default: 2000)
  enabled?: boolean; // Enable/disable auto-save (default: true)
}

export interface AutoSaveResult {
  saving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  save: () => Promise<void>;
}

/**
 * Auto-save hook with debouncing
 *
 * Automatically saves data after a delay when it changes.
 * Useful for form auto-save functionality.
 *
 * @example
 * ```tsx
 * const { saving, lastSaved, error } = useAutoSave(
 *   formData,
 *   async (data) => {
 *     await updateProfile(data);
 *   },
 *   { delay: 2000 }
 * );
 * ```
 */
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
): AutoSaveResult {
  const { delay = 2000, enabled = true } = options;

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T>(data);
  const isFirstRender = useRef(true);

  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Manual save function
  const save = useCallback(async () => {
    if (!enabled) return;

    try {
      setSaving(true);
      setError(null);

      await onSave(dataRef.current);

      setLastSaved(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error);
      console.error('Auto-save error:', error);
    } finally {
      setSaving(false);
    }
  }, [enabled, onSave]);

  // Auto-save effect
  useEffect(() => {
    // Skip first render to avoid saving immediately on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  return {
    saving,
    lastSaved,
    error,
    save,
  };
}

/**
 * Format last saved timestamp for display
 */
export function formatLastSaved(lastSaved: Date | null): string {
  if (!lastSaved) return 'Never';

  const now = new Date();
  const diffMs = now.getTime() - lastSaved.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffSeconds < 10) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  return lastSaved.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
