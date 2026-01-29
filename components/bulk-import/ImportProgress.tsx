'use client';

import { Loader2, Users } from 'lucide-react';

interface ImportProgressProps {
  progress: number;
  totalRows: number;
}

export function ImportProgress({ progress, totalRows }: ImportProgressProps) {
  const estimatedProcessed = Math.floor((progress / 100) * totalRows);

  return (
    <div className="py-12 text-center">
      {/* Animation */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="rgb(249 115 22)"
            strokeWidth="8"
            strokeDasharray={`${progress * 3.77} 377`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl font-bold text-orange-500">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-900">Importing Athletes...</h2>
      </div>

      <p className="text-gray-600 mb-8">
        Please don't close this page while the import is in progress
      </p>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-2 text-gray-600">
        <Users className="w-4 h-4" />
        <span>
          Processing approximately {estimatedProcessed.toLocaleString()} of {totalRows.toLocaleString()} athletes
        </span>
      </div>

      {/* Tips */}
      <div className="mt-8 text-sm text-gray-500">
        <p>Creating user accounts and setting up athlete profiles...</p>
      </div>
    </div>
  );
}
