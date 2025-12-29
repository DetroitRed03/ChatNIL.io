'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import * as Icons from 'lucide-react';
import { TraitBadgeList } from './TraitBadge';

interface ArchetypeCardProps {
  code: string;
  name: string;
  description: string;
  iconName?: string;
  colorHex?: string;
  exampleAthletes?: string[];
  topTraits?: Array<{
    code: string;
    name: string;
    score?: number;
    iconName?: string;
    colorHex?: string;
  }>;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ArchetypeCard({
  code,
  name,
  description,
  iconName = 'User',
  colorHex = '#6366F1',
  exampleAthletes = [],
  topTraits = [],
  variant = 'default',
  className,
}: ArchetypeCardProps) {
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
    iconName
  ] || Icons.User;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
          'hover:shadow-md hover:border-primary-300',
          className
        )}
        style={{ borderColor: `${colorHex}40` }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${colorHex}20` }}
        >
          <IconComponent className="w-5 h-5" style={{ color: colorHex }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary truncate">{name}</h4>
          <p className="text-xs text-text-tertiary truncate">{description}</p>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <Card
        variant="elevated"
        className={cn(
          'relative overflow-hidden',
          'border-2',
          className
        )}
        style={{ borderColor: `${colorHex}60` }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, ${colorHex} 0%, transparent 60%)`,
          }}
        />

        {/* Featured badge */}
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: colorHex }}
        >
          Your Archetype
        </div>

        <CardContent className="relative p-6 sm:p-8">
          {/* Icon and name */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${colorHex}20`,
                boxShadow: `0 4px 14px ${colorHex}30`,
              }}
            >
              <IconComponent
                className="w-8 h-8"
                style={{ color: colorHex }}
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                {name}
              </h2>
              <p
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: colorHex }}
              >
                {code.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            {description}
          </p>

          {/* Top traits */}
          {topTraits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Your Top Traits
              </h3>
              <TraitBadgeList
                traits={topTraits}
                size="md"
                showScores
                showRanks
                maxDisplay={5}
              />
            </div>
          )}

          {/* Example athletes */}
          {exampleAthletes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Similar Athletes
              </h3>
              <div className="flex flex-wrap gap-2">
                {exampleAthletes.map((athlete) => (
                  <span
                    key={athlete}
                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                  >
                    {athlete}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card variant="default" className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${colorHex}20` }}
          >
            <IconComponent className="w-6 h-6" style={{ color: colorHex }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: colorHex }}
            >
              {code.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Example athletes */}
        {exampleAthletes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {exampleAthletes.slice(0, 3).map((athlete) => (
              <span
                key={athlete}
                className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
              >
                {athlete}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Grid of archetype cards for showing all options
interface ArchetypeGridProps {
  archetypes: Array<{
    code: string;
    name: string;
    description: string;
    iconName?: string;
    colorHex?: string;
    exampleAthletes?: string[];
  }>;
  selectedCode?: string;
  onSelect?: (code: string) => void;
  className?: string;
}

export function ArchetypeGrid({
  archetypes,
  selectedCode,
  onSelect,
  className,
}: ArchetypeGridProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {archetypes.map((archetype) => {
        const isSelected = archetype.code === selectedCode;

        return (
          <div
            key={archetype.code}
            onClick={() => onSelect?.(archetype.code)}
            className={cn(
              'cursor-pointer transition-all duration-200',
              isSelected && 'ring-2 ring-primary-500 ring-offset-2 rounded-lg'
            )}
          >
            <ArchetypeCard {...archetype} />
          </div>
        );
      })}
    </div>
  );
}
