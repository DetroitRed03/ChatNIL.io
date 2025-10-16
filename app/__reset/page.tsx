'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { clearOutdatedVersionedData } from '@/lib/auth-storage';

interface ClearOperation {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
}

export default function ResetPage() {
  const [operations, setOperations] = useState<ClearOperation[]>([
    { name: 'localStorage', description: 'Clear all localStorage data', status: 'pending' },
    { name: 'sessionStorage', description: 'Clear all sessionStorage data', status: 'pending' },
    { name: 'cookies', description: 'Clear application cookies', status: 'pending' },
    { name: 'indexedDB', description: 'Clear IndexedDB databases', status: 'pending' },
    { name: 'cacheStorage', description: 'Clear Cache Storage', status: 'pending' },
    { name: 'serviceWorker', description: 'Unregister service workers', status: 'pending' },
  ]);

  const [isResetting, setIsResetting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const updateOperationStatus = (name: string, status: ClearOperation['status'], error?: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.name === name ? { ...op, status, error } : op
      )
    );
  };

  const clearLocalStorage = async () => {
    updateOperationStatus('localStorage', 'running');
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(window.localStorage);
        logger.info(`Clearing ${keys.length} localStorage items`, 'reset');

        // Clear versioned data first
        clearOutdatedVersionedData();

        // Clear all localStorage
        window.localStorage.clear();
        updateOperationStatus('localStorage', 'success');
      } else {
        updateOperationStatus('localStorage', 'success');
      }
    } catch (error) {
      logger.error('Failed to clear localStorage', 'reset', { error });
      updateOperationStatus('localStorage', 'error', 'Failed to clear localStorage');
    }
  };

  const clearSessionStorage = async () => {
    updateOperationStatus('sessionStorage', 'running');
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const keys = Object.keys(window.sessionStorage);
        logger.info(`Clearing ${keys.length} sessionStorage items`, 'reset');
        window.sessionStorage.clear();
        updateOperationStatus('sessionStorage', 'success');
      } else {
        updateOperationStatus('sessionStorage', 'success');
      }
    } catch (error) {
      logger.error('Failed to clear sessionStorage', 'reset', { error });
      updateOperationStatus('sessionStorage', 'error', 'Failed to clear sessionStorage');
    }
  };

  const clearCookies = async () => {
    updateOperationStatus('cookies', 'running');
    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        logger.info(`Clearing ${cookies.length} cookies`, 'reset');

        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name) {
            // Clear for current domain and path
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            // Also try with leading dot for subdomain cookies
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
          }
        });
        updateOperationStatus('cookies', 'success');
      } else {
        updateOperationStatus('cookies', 'success');
      }
    } catch (error) {
      logger.error('Failed to clear cookies', 'reset', { error });
      updateOperationStatus('cookies', 'error', 'Failed to clear cookies');
    }
  };

  const clearIndexedDB = async () => {
    updateOperationStatus('indexedDB', 'running');
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        // Get list of databases (only available in some browsers)
        if ('databases' in indexedDB && typeof (indexedDB as any).databases === 'function') {
          const databases = await (indexedDB as any).databases();
          logger.info(`Found ${databases.length} IndexedDB databases`, 'reset');

          for (const db of databases) {
            if (db.name) {
              const deleteRequest = indexedDB.deleteDatabase(db.name);
              await new Promise((resolve, reject) => {
                deleteRequest.onsuccess = () => resolve(null);
                deleteRequest.onerror = () => reject(deleteRequest.error);
              });
            }
          }
        } else {
          // Fallback: try to delete common database names
          const commonNames = ['keyval-store', 'firebaseLocalStorageDb'];
          for (const name of commonNames) {
            try {
              const deleteRequest = indexedDB.deleteDatabase(name);
              await new Promise((resolve) => {
                deleteRequest.onsuccess = () => resolve(null);
                deleteRequest.onerror = () => resolve(null); // Ignore errors for non-existent DBs
              });
            } catch (error) {
              // Ignore errors for non-existent DBs
            }
          }
        }
        updateOperationStatus('indexedDB', 'success');
      } else {
        updateOperationStatus('indexedDB', 'success');
      }
    } catch (error) {
      logger.error('Failed to clear IndexedDB', 'reset', { error });
      updateOperationStatus('indexedDB', 'error', 'Failed to clear IndexedDB');
    }
  };

  const clearCacheStorage = async () => {
    updateOperationStatus('cacheStorage', 'running');
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheNames = await caches.keys();
        logger.info(`Found ${cacheNames.length} cache storages`, 'reset');

        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
        updateOperationStatus('cacheStorage', 'success');
      } else {
        updateOperationStatus('cacheStorage', 'success');
      }
    } catch (error) {
      logger.error('Failed to clear Cache Storage', 'reset', { error });
      updateOperationStatus('cacheStorage', 'error', 'Failed to clear Cache Storage');
    }
  };

  const unregisterServiceWorkers = async () => {
    updateOperationStatus('serviceWorker', 'running');
    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        logger.info(`Found ${registrations.length} service workers`, 'reset');

        for (const registration of registrations) {
          await registration.unregister();
        }
        updateOperationStatus('serviceWorker', 'success');
      } else {
        updateOperationStatus('serviceWorker', 'success');
      }
    } catch (error) {
      logger.error('Failed to unregister service workers', 'reset', { error });
      updateOperationStatus('serviceWorker', 'error', 'Failed to unregister service workers');
    }
  };

  const performReset = async () => {
    if (isResetting) return;

    setIsResetting(true);
    logger.info('Starting complete client state reset', 'reset');

    // Run all clear operations in sequence
    await clearLocalStorage();
    await new Promise(resolve => setTimeout(resolve, 200));

    await clearSessionStorage();
    await new Promise(resolve => setTimeout(resolve, 200));

    await clearCookies();
    await new Promise(resolve => setTimeout(resolve, 200));

    await clearIndexedDB();
    await new Promise(resolve => setTimeout(resolve, 200));

    await clearCacheStorage();
    await new Promise(resolve => setTimeout(resolve, 200));

    await unregisterServiceWorkers();
    await new Promise(resolve => setTimeout(resolve, 200));

    setIsComplete(true);
    logger.info('Client state reset complete', 'reset');

    // Start countdown for redirect
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          logger.info('Redirecting to home page', 'reset');
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getStatusIcon = (status: ClearOperation['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <RefreshCcw className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Client State</h1>
          <p className="text-gray-600 text-sm">
            This will clear all cached data and reload the application
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {operations.map((operation) => (
            <div key={operation.name} className="flex items-center space-x-3">
              {getStatusIcon(operation.status)}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {operation.name}
                </div>
                <div className="text-xs text-gray-500">
                  {operation.description}
                </div>
                {operation.error && (
                  <div className="text-xs text-red-500 mt-1">
                    {operation.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isResetting && !isComplete && (
          <button
            onClick={performReset}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Clear All Data & Reload
          </button>
        )}

        {isComplete && (
          <div className="text-center">
            <div className="text-green-600 font-medium mb-2">
              ✅ Reset Complete!
            </div>
            <div className="text-sm text-gray-600">
              Redirecting to home page in {countdown} seconds...
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          This action cannot be undone. All local application data will be permanently removed.
        </div>
      </div>
    </div>
  );
}