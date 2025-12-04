'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Trophy, TrendingUp, Star } from 'lucide-react';

interface FMVData {
  social_score: number;
  athletic_score: number;
  market_score: number;
  brand_score: number;
}

interface ScoreBreakdownCardsProps {
  fmv: FMVData;
  className?: string;
}

const categoryConfig = {
  social: {
    icon: Instagram,
    label: 'Social Reach',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    progressColor: 'bg-pink-500',
    max: 30,
    description: 'Your social media presence and engagement across platforms',
    details: [
      'Total followers and reach',
      'Engagement rate and interaction',
      'Platform verification status',
      'Content quality and consistency',
    ],
  },
  athletic: {
    icon: Trophy,
    label: 'Athletic Profile',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    progressColor: 'bg-blue-500',
    max: 30,
    description: 'Your athletic achievements, rankings, and performance',
    details: [
      'School prestige and program strength',
      'External rankings and recognition',
      'Star rating and performance metrics',
      'Position marketability',
    ],
  },
  market: {
    icon: TrendingUp,
    label: 'Market Opportunity',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    progressColor: 'bg-green-500',
    max: 20,
    description: 'Your geographic location and market conditions',
    details: [
      'State NIL legislation favorability',
      'Geographic market desirability',
      'Content creation capabilities',
      'Local brand opportunities',
    ],
  },
  brand: {
    icon: Star,
    label: 'Brand Alignment',
    color: 'text-accent-600',
    bgColor: 'bg-accent-50',
    progressColor: 'bg-accent-500',
    max: 20,
    description: 'Your personal brand, values, and partnership readiness',
    details: [
      'Brand affinity and interests',
      'Values and causes alignment',
      'Profile completeness and professionalism',
      'Partnership readiness',
    ],
  },
};

export function ScoreBreakdownCards({ fmv, className }: ScoreBreakdownCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Safely handle undefined or missing score values
  const categories = [
    { key: 'social', score: fmv?.social_score || 0 },
    { key: 'athletic', score: fmv?.athletic_score || 0 },
    { key: 'market', score: fmv?.market_score || 0 },
    { key: 'brand', score: fmv?.brand_score || 0 },
  ];

  const toggleCard = (key: string) => {
    setExpandedCard(expandedCard === key ? null : key);
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {categories.map(({ key, score }, index) => {
        const config = categoryConfig[key as keyof typeof categoryConfig];
        const Icon = config.icon;
        const percentage = (score / config.max) * 100;
        const isExpanded = expandedCard === key;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card
              clickable
              onClick={() => toggleCard(key)}
              className="h-full hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.bgColor)}>
                      <Icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <p className="text-sm text-text-secondary mt-1">
                        {score} / {config.max} points
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-text-tertiary transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress
                    value={percentage}
                    className="h-2"
                    indicatorClassName={config.progressColor}
                  />
                  <p className="text-xs text-text-tertiary text-right">
                    {Math.round(percentage)}% of maximum
                  </p>
                </div>

                {/* Expandable Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border space-y-3">
                        <p className="text-sm text-text-secondary">
                          {config.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-text-primary uppercase tracking-wide">
                            Contributing Factors
                          </p>
                          <ul className="space-y-1.5">
                            {config.details.map((detail, i) => (
                              <li
                                key={i}
                                className="text-sm text-text-secondary flex items-start gap-2"
                              >
                                <span className="text-success-500 mt-0.5">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
