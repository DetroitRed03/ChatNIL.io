'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface TraitBadgeProps {
  traitCode: string;
  traitName: string;
  score?: number;
  iconName?: string;
  colorHex?: string;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  rank?: number;
  className?: string;
}

export function TraitBadge({
  traitCode,
  traitName,
  score,
  iconName = 'Circle',
  colorHex = '#6B7280',
  size = 'md',
  showScore = true,
  rank,
  className,
}: TraitBadgeProps) {
  // Get the icon component dynamically
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
    iconName
  ] || Icons.Circle;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-3',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const scoreSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  // Generate subtle background color from hex
  const bgColor = `${colorHex}15`;
  const borderColor = `${colorHex}40`;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        'hover:shadow-md hover:scale-105',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      {/* Rank indicator */}
      {rank && (
        <span
          className={cn(
            'flex-shrink-0 rounded-full flex items-center justify-center font-bold',
            size === 'sm' && 'w-4 h-4 text-[10px]',
            size === 'md' && 'w-5 h-5 text-xs',
            size === 'lg' && 'w-6 h-6 text-sm',
            rank === 1 && 'bg-yellow-200 text-yellow-800',
            rank === 2 && 'bg-gray-200 text-gray-700',
            rank === 3 && 'bg-orange-200 text-orange-800',
            rank > 3 && 'bg-gray-100 text-gray-600'
          )}
        >
          {rank}
        </span>
      )}

      {/* Icon */}
      <IconComponent
        className={cn(iconSizes[size])}
        style={{ color: colorHex }}
      />

      {/* Trait name */}
      <span style={{ color: colorHex }}>{traitName}</span>

      {/* Score */}
      {showScore && score !== undefined && (
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-full font-semibold',
            scoreSizes[size]
          )}
          style={{
            backgroundColor: colorHex,
            color: 'white',
          }}
        >
          {Math.round(score)}%
        </span>
      )}
    </div>
  );
}

// Horizontal list of trait badges
interface TraitBadgeListProps {
  traits: Array<{
    code: string;
    name: string;
    score?: number;
    iconName?: string;
    colorHex?: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  showScores?: boolean;
  showRanks?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function TraitBadgeList({
  traits,
  size = 'md',
  showScores = true,
  showRanks = false,
  maxDisplay,
  className,
}: TraitBadgeListProps) {
  const displayTraits = maxDisplay ? traits.slice(0, maxDisplay) : traits;
  const remainingCount = maxDisplay && traits.length > maxDisplay ? traits.length - maxDisplay : 0;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayTraits.map((trait, index) => (
        <TraitBadge
          key={trait.code}
          traitCode={trait.code}
          traitName={trait.name}
          score={trait.score}
          iconName={trait.iconName}
          colorHex={trait.colorHex}
          size={size}
          showScore={showScores}
          rank={showRanks ? index + 1 : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full bg-gray-100 text-gray-600 font-medium',
            size === 'sm' && 'px-2 py-1 text-xs',
            size === 'md' && 'px-3 py-2 text-sm',
            size === 'lg' && 'px-4 py-3 text-base'
          )}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
