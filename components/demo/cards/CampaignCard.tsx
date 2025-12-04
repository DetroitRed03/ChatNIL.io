'use client';

import React from 'react';
import { TiltCard } from '@/components/ui/TiltCard';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Target, DollarSign, Users } from 'lucide-react';

export interface CampaignCardData {
  id: string;
  name: string;
  brand: string;
  budget: number; // cents
  targetSports: string[];
  status: string;
}

interface CampaignCardProps {
  campaign: CampaignCardData;
  onClick: (campaignId: string) => void;
  isSelected?: boolean;
  intensity?: number;
}

export function CampaignCard({
  campaign,
  onClick,
  isSelected = false,
  intensity = 10
}: CampaignCardProps) {
  const formatCurrency = (cents: number): string => {
    const dollars = cents / 100;
    if (dollars >= 1000000) return `$${(dollars / 1000000).toFixed(1)}M`;
    if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
    return `$${dollars.toLocaleString()}`;
  };

  return (
    <TiltCard
      intensity={intensity}
      className={cn(
        'cursor-pointer transition-all duration-300',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
      )}
      onClick={() => onClick(campaign.id)}
    >
      <div className="p-8 space-y-5">
        {/* Header with Icon */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
            <Target className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-text-primary truncate">
              {campaign.name}
            </h3>
            <p className="text-sm text-text-secondary truncate">
              {campaign.brand}
            </p>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <DollarSign className="h-4 w-4 text-success-500" />
          <span className="font-semibold text-text-primary">
            {formatCurrency(campaign.budget)}
          </span>
          <span className="text-xs text-text-tertiary">budget</span>
        </div>

        {/* Target Sports */}
        {campaign.targetSports && campaign.targetSports.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-text-tertiary" />
              <span className="text-xs text-text-tertiary uppercase tracking-wide">
                Target Sports
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {campaign.targetSports.slice(0, 3).map((sport) => (
                <Badge key={sport} variant="primary" size="sm">
                  {sport}
                </Badge>
              ))}
              {campaign.targetSports.length > 3 && (
                <Badge variant="gray" size="sm">
                  +{campaign.targetSports.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </TiltCard>
  );
}
