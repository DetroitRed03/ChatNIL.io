'use client';

import { ImprovementSuggestion } from '@/types';
import { Users, Trophy, MapPin, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';

interface ImprovementSuggestionCardProps {
  suggestion: ImprovementSuggestion;
}

const AREA_CONFIG = {
  social: {
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    accentColor: 'bg-blue-500',
  },
  athletic: {
    icon: Trophy,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    accentColor: 'bg-green-500',
  },
  market: {
    icon: MapPin,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    accentColor: 'bg-purple-500',
  },
  brand: {
    icon: Briefcase,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    accentColor: 'bg-orange-500',
  },
};

const PRIORITY_CONFIG = {
  high: {
    label: 'High Priority',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    dotColor: 'bg-red-500',
  },
  medium: {
    label: 'Medium Priority',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    dotColor: 'bg-yellow-500',
  },
  low: {
    label: 'Low Priority',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    dotColor: 'bg-gray-500',
  },
};

export function ImprovementSuggestionCard({ suggestion }: ImprovementSuggestionCardProps) {
  const areaConfig = AREA_CONFIG[suggestion.area];
  const priorityConfig = PRIORITY_CONFIG[suggestion.priority];
  const Icon = areaConfig.icon;

  return (
    <div
      className={`relative border-2 ${areaConfig.borderColor} ${areaConfig.bgColor} rounded-lg p-5 hover:shadow-md transition-shadow`}
    >
      {/* Priority Badge */}
      <div className="absolute top-3 right-3">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${priorityConfig.bgColor}`}>
          <div className={`w-2 h-2 rounded-full ${priorityConfig.dotColor}`} />
          <span className={`text-xs font-medium ${priorityConfig.color}`}>
            {priorityConfig.label}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pr-24">
        <div className={`p-2 rounded-lg ${areaConfig.accentColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
            {suggestion.area}
          </div>
          <h4 className={`text-lg font-bold ${areaConfig.color}`}>
            {suggestion.current} → {suggestion.target}
          </h4>
        </div>
      </div>

      {/* Action Steps */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Action Steps</span>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed pl-6">
            {suggestion.action}
          </p>
        </div>
      </div>

      {/* Impact */}
      <div className={`flex items-center justify-between pt-3 border-t ${areaConfig.borderColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Potential Impact:</span>
          <span className={`text-sm font-bold ${areaConfig.color}`}>{suggestion.impact}</span>
        </div>
        <ArrowRight className={`w-5 h-5 ${areaConfig.color}`} />
      </div>
    </div>
  );
}

/**
 * Compact list view for multiple suggestions
 */
export function ImprovementSuggestionList({ suggestions }: { suggestions: ImprovementSuggestion[] }) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Great job! You're maximizing all scoring categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <ImprovementSuggestionCard key={index} suggestion={suggestion} />
      ))}
    </div>
  );
}

/**
 * Compact inline suggestion for small spaces
 */
export function ImprovementSuggestionCompact({ suggestion }: { suggestion: ImprovementSuggestion }) {
  const areaConfig = AREA_CONFIG[suggestion.area];
  const Icon = areaConfig.icon;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${areaConfig.bgColor} border ${areaConfig.borderColor}`}>
      <Icon className={`w-5 h-5 ${areaConfig.color} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${areaConfig.color} truncate`}>
          {suggestion.target}
        </div>
        <div className="text-xs text-gray-600">{suggestion.impact}</div>
      </div>
      <div className={`px-2 py-0.5 rounded text-xs font-medium ${areaConfig.color} ${areaConfig.bgColor}`}>
        {suggestion.area}
      </div>
    </div>
  );
}
