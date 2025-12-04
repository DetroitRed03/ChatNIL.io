'use client';

import React from 'react';
import { TiltCard } from '@/components/ui/TiltCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Trophy, Star, Users } from 'lucide-react';

export interface AthleteCardData {
  id: string;
  name: string;
  sport: string;
  school?: string;
  fmv_score?: number;
  fmv_tier?: string;
  avatar_url?: string;
  total_followers?: number;
}

interface AthleteCardProps {
  athlete: AthleteCardData;
  onClick: (athleteId: string) => void;
  isSelected?: boolean;
  intensity?: number;
}

export function AthleteCard({
  athlete,
  onClick,
  isSelected = false,
  intensity = 10
}: AthleteCardProps) {
  const getTierColor = (tier?: string): 'accent' | 'primary' | 'success' | 'warning' | 'gray' => {
    switch (tier) {
      case 'elite': return 'accent';
      case 'high': return 'primary';
      case 'medium': return 'success';
      case 'developing': return 'warning';
      default: return 'gray';
    }
  };

  const formatFollowers = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <TiltCard
      intensity={intensity}
      className={cn(
        'cursor-pointer transition-all duration-300',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      onClick={() => onClick(athlete.id)}
    >
      <div className="p-8 space-y-5">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4">
          <Avatar
            src={athlete.avatar_url}
            alt={athlete.name}
            size="xl"
            fallback={athlete.name}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-text-primary truncate">
              {athlete.name}
            </h3>
            <p className="text-sm text-text-secondary truncate">
              {athlete.school || 'Unknown School'}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-text-secondary">
              {athlete.sport}
            </span>
          </div>

          {athlete.fmv_score !== undefined && (
            <Badge variant={getTierColor(athlete.fmv_tier)} size="sm" leftIcon={<Star className="h-3 w-3" />}>
              {athlete.fmv_score}
            </Badge>
          )}
        </div>

        {/* Follower Count */}
        {athlete.total_followers && (
          <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary pt-2 border-t border-border">
            <Users className="h-3 w-3" />
            <span>{formatFollowers(athlete.total_followers)} followers</span>
          </div>
        )}
      </div>
    </TiltCard>
  );
}
