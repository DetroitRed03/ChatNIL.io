'use client';

import { Sparkles, TrendingUp, Star, Flame, Crown, ChevronRight } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';

interface TierInfo {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  description: string;
  examples: string[];
  pointRange: string;
}

const tiers: TierInfo[] = [
  {
    name: 'Common',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    description: 'Perfect for getting started! These badges help you learn the basics and get comfortable with the platform.',
    examples: ['First Steps', 'Chat Starter', 'Profile Builder'],
    pointRange: '10-25 points'
  },
  {
    name: 'Uncommon',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-green-100',
    description: 'Building your NIL knowledge! Complete quizzes and engage with learning modules to earn these badges.',
    examples: ['NIL Basics', 'Contract Reader', 'Quiz Enthusiast'],
    pointRange: '50-75 points'
  },
  {
    name: 'Rare',
    icon: <Star className="w-8 h-8" />,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    description: 'Demonstrating real expertise! These badges show you understand advanced NIL concepts.',
    examples: ['Tax Expert', 'Brand Builder', 'Compliance Pro'],
    pointRange: '100-150 points'
  },
  {
    name: 'Epic',
    icon: <Flame className="w-8 h-8" />,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    description: 'Advanced mastery! Achieve these through consistent engagement and deep understanding.',
    examples: ['NIL Master', 'Strategic Thinker', 'Platform Expert'],
    pointRange: '200-300 points'
  },
  {
    name: 'Legendary',
    icon: <Crown className="w-8 h-8" />,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-50 to-yellow-100',
    description: 'Elite status! Reserved for those who have mastered every aspect of the NIL landscape.',
    examples: ['NIL Legend', 'Ultimate Achiever', 'Platform Champion'],
    pointRange: '500+ points'
  }
];

export function BadgeTierGuide() {
  return (
    <div className="mb-12 sm:mb-16">
      {/* Section Header - Centered */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Badge Difficulty Tiers
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Progress from beginner to expert as you master NIL concepts. Each tier unlocks new opportunities!
        </p>
      </div>

      {/* Tier Cards Grid - Centered */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
        {tiers.map((tier, index) => (
          <TiltCard key={tier.name} intensity={8} className="group h-full">
            <div className={`p-5 sm:p-6 md:p-8 h-full flex flex-col bg-gradient-to-br ${tier.bgGradient}`}>
              {/* Tier Header */}
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className={`${tier.color} transition-transform group-hover:scale-110 duration-300`}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{tier.pointRange}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 flex-grow">
                {tier.description}
              </p>

              {/* Examples */}
              <div className="space-y-2 mb-3 sm:mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Examples:</p>
                {tier.examples.map((example) => (
                  <div key={example} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <div className={`w-1.5 h-1.5 rounded-full ${tier.color.replace('text-', 'bg-')}`} />
                    {example}
                  </div>
                ))}
              </div>

              {/* Progression Indicator */}
              {index < tiers.length - 1 && (
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 sm:pt-4 border-t border-gray-300">
                  <span>Next tier: {tiers[index + 1].name}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}
