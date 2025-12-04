'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingDown, Target, TrendingUp, Info } from 'lucide-react';

interface DealValueEstimatesProps {
  low: number; // in cents
  mid: number; // in cents
  high: number; // in cents;
  className?: string;
}

const estimateConfig = {
  low: {
    icon: TrendingDown,
    label: 'Conservative',
    description: 'Minimum expected deal value',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  mid: {
    icon: Target,
    label: 'Expected',
    description: 'Most likely deal value range',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-300',
    highlight: true,
  },
  high: {
    icon: TrendingUp,
    label: 'Optimistic',
    description: 'Maximum potential deal value',
    color: 'text-success-600',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-200',
  },
};

function formatCurrency(cents: number): string {
  // Handle invalid or undefined values
  if (!cents || isNaN(cents) || cents < 0) {
    return '$0';
  }

  const dollars = cents / 100;
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  } else if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  } else {
    return `$${dollars.toLocaleString()}`;
  }
}

export function DealValueEstimates({ low, mid, high, className }: DealValueEstimatesProps) {
  // Safely handle undefined or invalid values
  const estimates = [
    { key: 'low', value: low || 0 },
    { key: 'mid', value: mid || 0 },
    { key: 'high', value: high || 0 },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Estimated Deal Values
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Based on FMV score, market conditions, and comparable athletes
          </p>
        </div>
        <button
          className="p-2 rounded-lg hover:bg-background-hover transition-colors group"
          title="How are these calculated?"
        >
          <Info className="h-5 w-5 text-text-tertiary group-hover:text-text-primary" />
        </button>
      </div>

      {/* Estimate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {estimates.map(({ key, value }, index) => {
          const config = estimateConfig[key as keyof typeof estimateConfig];
          const Icon = config.icon;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden',
                  'highlight' in config && config.highlight && 'ring-2 ring-primary-500 shadow-lg'
                )}
              >
                {/* Highlight Badge */}
                {'highlight' in config && config.highlight && (
                  <div className="absolute top-0 right-0">
                    <Badge
                      variant="primary"
                      size="sm"
                      className="rounded-none rounded-bl-lg"
                    >
                      Recommended
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.bgColor)}>
                      <Icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    {/* Value */}
                    <div>
                      <p className={cn('text-3xl font-bold', config.color)}>
                        {formatCurrency(value)}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        per deal
                      </p>
                    </div>

                    {/* Additional Info */}
                    {key === 'mid' && (
                      <div className={cn('p-2 rounded-lg', config.bgColor)}>
                        <p className="text-xs text-text-secondary">
                          Most athletes at this tier secure deals in this range
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Explanation */}
      <Card variant="flat" className="bg-background-secondary">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                How Deal Values Are Calculated
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                These estimates are based on your FMV score, social media reach,
                athletic achievements, and market conditions. They represent typical
                deal values for a single brand partnership or NIL opportunity. Actual
                deals may vary based on campaign specifics, brand budget, and negotiation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
