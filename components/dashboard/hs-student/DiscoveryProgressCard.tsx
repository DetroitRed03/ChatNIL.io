'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target, BookOpen, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PillarType, PILLARS, PILLAR_ORDER } from '@/lib/discovery/questions';

interface DiscoveryProgressCardProps {
  currentPillar: PillarType;
  currentDay: number;
  completionPercentage: number;
  unlockedChapters: PillarType[];
  onContinue: () => void;
}

const pillarIcons: Record<PillarType, React.ReactNode> = {
  identity: <Target className="h-5 w-5" />,
  business: <BookOpen className="h-5 w-5" />,
  money: <DollarSign className="h-5 w-5" />,
  legacy: <Star className="h-5 w-5" />,
};

const pillarColors: Record<PillarType, { bg: string; border: string; text: string; gradient: string }> = {
  identity: {
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
  },
  business: {
    bg: 'bg-purple-500',
    border: 'border-purple-500',
    text: 'text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
  },
  money: {
    bg: 'bg-green-500',
    border: 'border-green-500',
    text: 'text-green-400',
    gradient: 'from-green-500 to-green-600',
  },
  legacy: {
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    text: 'text-orange-400',
    gradient: 'from-orange-500 to-orange-600',
  },
};

export function DiscoveryProgressCard({
  currentPillar,
  currentDay,
  completionPercentage,
  unlockedChapters,
  onContinue,
}: DiscoveryProgressCardProps) {
  const colors = pillarColors[currentPillar];
  const pillarInfo = PILLARS[currentPillar];

  return (
    <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            Discovery Journey
          </CardTitle>
          <span className={`text-sm font-medium ${colors.text}`}>
            {completionPercentage}% Complete
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${colors.gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Pillar Progress Dots */}
        <div className="flex items-center justify-between px-2">
          {PILLAR_ORDER.map((pillar, index) => {
            const isUnlocked = unlockedChapters.includes(pillar);
            const isCurrent = pillar === currentPillar;
            const pColors = pillarColors[pillar];

            return (
              <div key={pillar} className="flex flex-col items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isUnlocked
                      ? `${pColors.bg} text-white`
                      : isCurrent
                        ? `bg-gray-800 ${pColors.border} border-2 ${pColors.text}`
                        : 'bg-gray-800 border border-gray-600 text-gray-500'
                    }
                  `}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {pillarIcons[pillar]}
                </motion.div>
                <span className={`text-xs mt-1 ${isCurrent ? pColors.text : 'text-gray-500'}`}>
                  {PILLARS[pillar].name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Progress */}
        <div className={`p-4 rounded-lg bg-gradient-to-r ${colors.gradient}/10 border ${colors.border}/30`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Currently exploring</p>
              <p className={`text-lg font-semibold ${colors.text}`}>
                {pillarInfo.icon} {pillarInfo.title}
              </p>
              <p className="text-sm text-gray-500">Day {currentDay} of 5</p>
            </div>
            <Button
              onClick={onContinue}
              className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90`}
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
