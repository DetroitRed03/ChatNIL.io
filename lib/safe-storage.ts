/**
 * Safe storage utilities with error handling and fallbacks
 */

export interface StorageOptions {
  compress?: boolean;
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
  fallbackToMemory?: boolean;
}

interface StorageItem {
  value: any;
  timestamp: number;
  expiresAt?: number;
  compressed?: boolean;
  encrypted?: boolean;
}

// In-memory fallback storage
const memoryStorage = new Map<string, StorageItem>();

/**
 * Check if localStorage is available and working
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage size in bytes (approximate)
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) return 0;

  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  return totalSize;
}

/**
 * Clear old expired items from storage
 */
export function clearExpiredItems(): number {
  if (!isLocalStorageAvailable()) return 0;

  let clearedCount = 0;
  const now = Date.now();
  const itemsToRemove: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const rawValue = localStorage.getItem(key);
        if (!rawValue) continue;

        const parsed = JSON.parse(rawValue) as StorageItem;
        if (parsed.expiresAt && parsed.expiresAt < now) {
          itemsToRemove.push(key);
        }
      } catch {
        // If we can't parse the item, it might be corrupted
        // We could optionally remove it here
      }
    }

    // Remove expired items
    itemsToRemove.forEach(key => {
      localStorage.removeItem(key);
      clearedCount++;
    });

    console.log(`🧹 Cleared ${clearedCount} expired storage items`);
  } catch (error) {
    console.warn('⚠️ Error clearing expired items:', error);
  }

  return clearedCount;
}

/**
 * Clear old items when storage is full
 */
function clearOldItems(targetSize: number = 1024 * 1024): number { // 1MB default
  if (!isLocalStorageAvailable()) return 0;

  const items: Array<{ key: string; timestamp: number; size: number }> = [];

  try {
    // Collect all items with their timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const rawValue = localStorage.getItem(key);
        if (!rawValue) continue;

        const parsed = JSON.parse(rawValue) as StorageItem;
        const size = rawValue.length + key.length;
        items.push({ key, timestamp: parsed.timestamp, size });
      } catch {
        // If we can't parse, treat as very old
        const size = (localStorage.getItem(key) || '').length + key.length;
        items.push({ key, timestamp: 0, size });
      }
    }

    // Sort by timestamp (oldest first)
    items.sort((a, b) => a.timestamp - b.timestamp);

    let clearedSize = 0;
    let clearedCount = 0;

    // Remove oldest items until we've cleared enough space
    for (const item of items) {
      if (clearedSize >= targetSize) break;

      localStorage.removeItem(item.key);
      clearedSize += item.size;
      clearedCount++;
    }

    console.log(`🧹 Cleared ${clearedCount} old items (${clearedSize} bytes) to free storage space`);
    return clearedCount;
  } catch (error) {
    console.warn('⚠️ Error clearing old items:', error);
    return 0;
  }
}

/**
 * Safely set an item in localStorage with error handling
 */
export function safeSetItem(
  key: string,
  value: any,
  options: StorageOptions = {}
): boolean {
  const {
    compress = false,
    encrypt = false,
    expiresIn,
    fallbackToMemory = true
  } = options;

  const storageItem: StorageItem = {
    value,
    timestamp: Date.now(),
    compressed: compress,
    encrypted: encrypt
  };

  if (expiresIn) {
    storageItem.expiresAt = Date.now() + expiresIn;
  }

  const serialized = JSON.stringify(storageItem);

  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      console.warn(`⚠️ localStorage setItem failed for key "${key}":`, error);

      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.log('💾 Storage quota exceeded, attempting cleanup...');

        // First, clear expired items
        clearExpiredItems();

        // Try again
        try {
          localStorage.setItem(key, serialized);
          return true;
        } catch {
          // If still failing, clear old items
          clearOldItems();

          // Final attempt
          try {
            localStorage.setItem(key, serialized);
            return true;
          } catch (finalError) {
            console.error('❌ Failed to store item even after cleanup:', finalError);
          }
        }
      }
    }
  }

  // Fallback to memory storage
  if (fallbackToMemory) {
    console.log(`📝 Falling back to memory storage for key "${key}"`);
    memoryStorage.set(key, storageItem);
    return true;
  }

  return false;
}

/**
 * Safely get an item from localStorage with error handling
 */
export function safeGetItem<T = any>(
  key: string,
  defaultValue?: T,
  options: { fallbackToMemory?: boolean } = {}
): T | undefined {
  const { fallbackToMemory = true } = options;

  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      const rawValue = localStorage.getItem(key);
      if (rawValue !== null) {
        const parsed = JSON.parse(rawValue) as StorageItem;

        // Check if expired
        if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
          localStorage.removeItem(key);
          return defaultValue;
        }

        return parsed.value as T;
      }
    } catch (error) {
      console.warn(`⚠️ localStorage getItem failed for key "${key}":`, error);
      // Try to remove corrupted item
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore removal errors
      }
    }
  }

  // Try memory storage
  if (fallbackToMemory && memoryStorage.has(key)) {
    const item = memoryStorage.get(key)!;

    // Check if expired
    if (item.expiresAt && item.expiresAt < Date.now()) {
      memoryStorage.delete(key);
      return defaultValue;
    }

    return item.value as T;
  }

  return defaultValue;
}

/**
 * Safely remove an item from storage
 */
export function safeRemoveItem(key: string): boolean {
  let removed = false;

  // Remove from localStorage
  if (isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(key);
      removed = true;
    } catch (error) {
      console.warn(`⚠️ localStorage removeItem failed for key "${key}":`, error);
    }
  }

  // Remove from memory storage
  if (memoryStorage.has(key)) {
    memoryStorage.delete(key);
    removed = true;
  }

  return removed;
}

/**
 * Safely clear all storage
 */
export function safeClearStorage(): number {
  let clearedCount = 0;

  // Clear localStorage
  if (isLocalStorageAvailable()) {
    try {
      const length = localStorage.length;
      localStorage.clear();
      clearedCount += length;
    } catch (error) {
      console.warn('⚠️ localStorage clear failed:', error);
    }
  }

  // Clear memory storage
  clearedCount += memoryStorage.size;
  memoryStorage.clear();

  return clearedCount;
}

/**
 * Get storage info
 */
export function getStorageInfo() {
  return {
    localStorageAvailable: isLocalStorageAvailable(),
    localStorageSize: getStorageSize(),
    memoryStorageSize: memoryStorage.size,
    localStorageItemCount: isLocalStorageAvailable() ? localStorage.length : 0,
    memoryStorageItemCount: memoryStorage.size
  };
}

/**
 * React hook for storage with automatic error handling
 */
export function useStorage<T>(
  key: string,
  defaultValue: T,
  options: StorageOptions = {}
): [T, (value: T) => boolean, () => boolean] {
  const [value, setValue] = React.useState<T>(() =>
    safeGetItem(key, defaultValue, options) ?? defaultValue
  );

  const setStorageValue = React.useCallback((newValue: T): boolean => {
    const success = safeSetItem(key, newValue, options);
    if (success) {
      setValue(newValue);
    }
    return success;
  }, [key, options]);

  const removeStorageValue = React.useCallback((): boolean => {
    const success = safeRemoveItem(key);
    if (success) {
      setValue(defaultValue);
    }
    return success;
  }, [key, defaultValue]);

  return [value, setStorageValue, removeStorageValue];
}

// Note: Need to import React for the hook
import React from 'react';