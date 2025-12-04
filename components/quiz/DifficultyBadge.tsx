/**
 * Difficulty Badge Component
 *
 * Displays visual difficulty indicator with color coding and point values
 */

import { Lock } from 'lucide-react';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  isLocked?: boolean;
  points?: number;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
}

const difficultyConfig = {
  beginner: {
    label: 'Beginner',
    emoji: '🌱',
    colors: 'bg-green-100 text-green-700 border-green-200',
    hoverColors: 'hover:bg-green-200',
    lockedColors: 'bg-gray-100 text-gray-400 border-gray-200',
    points: 10,
  },
  intermediate: {
    label: 'Intermediate',
    emoji: '⚡',
    colors: 'bg-blue-100 text-blue-700 border-blue-200',
    hoverColors: 'hover:bg-blue-200',
    lockedColors: 'bg-gray-100 text-gray-400 border-gray-200',
    points: 25,
  },
  advanced: {
    label: 'Advanced',
    emoji: '🔥',
    colors: 'bg-orange-100 text-orange-700 border-orange-200',
    hoverColors: 'hover:bg-orange-200',
    lockedColors: 'bg-gray-100 text-gray-400 border-gray-200',
    points: 50,
  },
  expert: {
    label: 'Expert',
    emoji: '💎',
    colors: 'bg-purple-100 text-purple-700 border-purple-200',
    hoverColors: 'hover:bg-purple-200',
    lockedColors: 'bg-gray-100 text-gray-400 border-gray-200',
    points: 100,
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function DifficultyBadge({
  difficulty,
  isLocked = false,
  points,
  size = 'md',
  showPoints = true,
}: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];
  const displayPoints = points ?? config.points;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all
        ${isLocked ? config.lockedColors : config.colors}
        ${!isLocked && config.hoverColors}
        ${sizeConfig[size]}
      `}
    >
      {isLocked ? (
        <Lock className="h-3 w-3" />
      ) : (
        <span>{config.emoji}</span>
      )}
      <span>{config.label}</span>
      {showPoints && !isLocked && (
        <span className="opacity-75">• {displayPoints}pts</span>
      )}
      {isLocked && (
        <span className="opacity-75">🔒</span>
      )}
    </div>
  );
}
