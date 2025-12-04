'use client';

import React from 'react';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart, Users, Target, DollarSign, MapPin, TrendingUp } from 'lucide-react';

export interface MatchScore {
  brand_values_match: number; // 0-20
  interests_match: number; // 0-15
  campaign_fit: number; // 0-20
  budget_alignment: number; // 0-15
  geography_match: number; // 0-10
  demographics_match: number; // 0-10
  engagement_potential: number; // 0-10
}

interface MatchScoreBreakdownProps {
  matchScore: MatchScore;
  className?: string;
}

const factorConfig = {
  brand_values_match: {
    icon: Heart,
    label: 'Brand Values',
    max: 20,
    color: 'text-pink-600',
    progressColor: 'bg-pink-500',
    description: 'Alignment with brand mission and values',
  },
  interests_match: {
    icon: Users,
    label: 'Interests',
    max: 15,
    color: 'text-purple-600',
    progressColor: 'bg-purple-500',
    description: 'Shared interests and hobbies',
  },
  campaign_fit: {
    icon: Target,
    label: 'Campaign Fit',
    max: 20,
    color: 'text-primary-600',
    progressColor: 'bg-primary-500',
    description: 'Match with campaign objectives',
  },
  budget_alignment: {
    icon: DollarSign,
    label: 'Budget',
    max: 15,
    color: 'text-success-600',
    progressColor: 'bg-success-500',
    description: 'FMV aligns with budget range',
  },
  geography_match: {
    icon: MapPin,
    label: 'Geography',
    max: 10,
    color: 'text-blue-600',
    progressColor: 'bg-blue-500',
    description: 'Location and market overlap',
  },
  demographics_match: {
    icon: Users,
    label: 'Demographics',
    max: 10,
    color: 'text-cyan-600',
    progressColor: 'bg-cyan-500',
    description: 'Target audience alignment',
  },
  engagement_potential: {
    icon: TrendingUp,
    label: 'Engagement',
    max: 10,
    color: 'text-accent-600',
    progressColor: 'bg-accent-500',
    description: 'Predicted campaign performance',
  },
};

export function MatchScoreBreakdown({ matchScore, className }: MatchScoreBreakdownProps) {
  const factors = Object.entries(matchScore).map(([key, score]) => ({
    key,
    score,
    config: factorConfig[key as keyof typeof factorConfig],
  }));

  // Calculate total and percentage
  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const maxScore = factors.reduce((sum, f) => sum + f.config.max, 0);
  const overallPercentage = Math.round((totalScore / maxScore) * 100);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Score */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-6 border border-primary-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-lg font-semibold text-text-primary">Overall Match</h4>
            <p className="text-sm text-text-secondary mt-1">
              {totalScore} out of {maxScore} points
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-primary-600">{overallPercentage}%</p>
          </div>
        </div>
        <Progress value={overallPercentage} className="h-3" indicatorClassName="bg-primary-500" />
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
          Match Factor Breakdown
        </h4>
        <div className="space-y-3">
          {factors.map(({ key, score, config }, index) => {
            const Icon = config.icon;
            const percentage = (score / config.max) * 100;

            // Color code: >80% green, 60-80% yellow, <60% red
            let statusColor = 'text-gray-600';
            let statusBg = 'bg-gray-100';
            if (percentage >= 80) {
              statusColor = 'text-success-600';
              statusBg = 'bg-success-100';
            } else if (percentage >= 60) {
              statusColor = 'text-warning-600';
              statusBg = 'bg-warning-100';
            } else if (percentage > 0) {
              statusColor = 'text-error-600';
              statusBg = 'bg-error-100';
            }

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="bg-white rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg', statusBg)}>
                    <Icon className={cn('h-5 w-5', statusColor)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-text-primary">{config.label}</p>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {config.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={cn('text-lg font-bold', config.color)}>
                          {score}/{config.max}
                        </p>
                        <p className="text-xs text-text-tertiary">{Math.round(percentage)}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <Progress
                      value={percentage}
                      className="h-2"
                      indicatorClassName={config.progressColor}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-background-secondary rounded-lg p-4 border border-border">
        <p className="text-xs font-medium text-text-primary mb-2 uppercase tracking-wide">
          Score Interpretation
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success-500"></div>
            <span className="text-text-secondary">80%+ Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning-500"></div>
            <span className="text-text-secondary">60-80% Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error-500"></div>
            <span className="text-text-secondary">&lt;60% Needs Improvement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
