'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Profile error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-full">
            <AlertCircle className="w-12 h-12 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn't load this profile. It may not exist or you may not have permission to view it.
          </p>
        </div>

        {error.message && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
