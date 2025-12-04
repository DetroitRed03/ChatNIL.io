'use client';

import { Users, Trophy, MapPin, Briefcase } from 'lucide-react';

interface ScoreBreakdownChartProps {
  social: number;     // 0-30
  athletic: number;   // 0-30
  market: number;     // 0-20
  brand: number;      // 0-20
}

const CATEGORIES = [
  {
    key: 'social' as const,
    label: 'Social',
    icon: Users,
    maxScore: 30,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    key: 'athletic' as const,
    label: 'Athletic',
    icon: Trophy,
    maxScore: 30,
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
  {
    key: 'market' as const,
    label: 'Market',
    icon: MapPin,
    maxScore: 20,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    key: 'brand' as const,
    label: 'Brand',
    icon: Briefcase,
    maxScore: 20,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    textColor: 'text-orange-600',
  },
];

export function ScoreBreakdownChart({ social, athletic, market, brand }: ScoreBreakdownChartProps) {
  const scores = { social, athletic, market, brand };

  return (
    <div className="space-y-6">
      {/* Bar Chart View */}
      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const score = scores[category.key];
          const percentage = (score / category.maxScore) * 100;
          const Icon = category.icon;

          return (
            <div key={category.key} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${category.lightColor}`}>
                    <Icon className={`w-4 h-4 ${category.textColor}`} />
                  </div>
                  <span className="font-medium text-gray-900">{category.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${category.textColor}`}>{score}</span>
                  <span className="text-sm text-gray-500">/ {category.maxScore}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${category.color} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Percentage */}
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">{percentage.toFixed(1)}% of maximum</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        {CATEGORIES.map((category) => {
          const score = scores[category.key];
          const percentage = (score / category.maxScore) * 100;

          return (
            <div key={category.key} className="text-center">
              <div className={`text-xs font-medium ${category.textColor} uppercase tracking-wide mb-1`}>
                {category.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{score}</div>
              <div className="text-xs text-gray-500">{percentage.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact version for smaller displays
 */
export function ScoreBreakdownCompact({ social, athletic, market, brand }: ScoreBreakdownChartProps) {
  const scores = { social, athletic, market, brand };
  const total = social + athletic + market + brand;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Total Score</span>
        <span className="text-2xl font-bold text-gray-900">{total} / 100</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const score = scores[category.key];
          const Icon = category.icon;

          return (
            <div key={category.key} className={`flex items-center gap-2 p-2 rounded-lg ${category.lightColor}`}>
              <Icon className={`w-4 h-4 ${category.textColor}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-600 truncate">{category.label}</div>
                <div className={`text-sm font-bold ${category.textColor}`}>
                  {score}/{category.maxScore}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
