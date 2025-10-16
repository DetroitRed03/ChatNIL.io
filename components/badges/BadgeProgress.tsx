'use client';

import { TrendingUp, Target } from 'lucide-react';

interface BadgeProgressProps {
  current: number;
  required: number;
  description: string;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
}

export default function BadgeProgress({
  current,
  required,
  description,
  label,
  showPercentage = true,
  color = 'blue'
}: BadgeProgressProps) {
  const percentage = Math.min(100, Math.round((current / required) * 100));
  const isComplete = current >= required;

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      light: 'bg-blue-100',
      text: 'text-blue-600',
      ring: 'ring-blue-500'
    },
    green: {
      bg: 'bg-green-500',
      light: 'bg-green-100',
      text: 'text-green-600',
      ring: 'ring-green-500'
    },
    purple: {
      bg: 'bg-purple-500',
      light: 'bg-purple-100',
      text: 'text-purple-600',
      ring: 'ring-purple-500'
    },
    orange: {
      bg: 'bg-orange-500',
      light: 'bg-orange-100',
      text: 'text-orange-600',
      ring: 'ring-orange-500'
    },
    yellow: {
      bg: 'bg-yellow-500',
      light: 'bg-yellow-100',
      text: 'text-yellow-600',
      ring: 'ring-yellow-500'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className="space-y-2">
      {/* Header */}
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className={`text-sm font-semibold ${colors.text}`}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className={`w-full ${colors.light} rounded-full h-3 overflow-hidden`}>
          <div
            className={`${colors.bg} h-3 rounded-full transition-all duration-500 ease-out ${
              isComplete ? 'animate-pulse' : ''
            }`}
            style={{ width: `${percentage}%` }}
          >
            {isComplete && (
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}
          </div>
        </div>

        {/* Target Indicator */}
        {!isComplete && percentage > 0 && (
          <div
            className="absolute top-0 flex items-center justify-center"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          >
            <div className={`w-4 h-4 rounded-full ${colors.bg} ${colors.ring} ring-2 ring-offset-1`} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Target className="w-3 h-3" />
          <span>{description}</span>
        </div>
        <span className="text-gray-500 font-medium">
          {current} / {required}
        </span>
      </div>

      {/* Completion Message */}
      {isComplete && (
        <div className={`flex items-center gap-1 text-xs ${colors.text} font-medium`}>
          <TrendingUp className="w-3 h-3" />
          <span>Goal achieved! Badge ready to claim.</span>
        </div>
      )}
    </div>
  );
}
