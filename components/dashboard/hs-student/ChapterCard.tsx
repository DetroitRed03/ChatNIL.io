'use client';

import { motion } from 'framer-motion';
import { Lock, CheckCircle, ArrowRight, Target, BookOpen, DollarSign, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { PillarType, PILLARS } from '@/lib/discovery/questions';
import { useRouter } from 'next/navigation';

interface ChapterCardProps {
  pillar: PillarType;
  isUnlocked: boolean;
  isCurrent: boolean;
  profileData: any;
  delay?: number;
}

const pillarIcons: Record<PillarType, React.ReactNode> = {
  identity: <Target className="h-8 w-8" />,
  business: <BookOpen className="h-8 w-8" />,
  money: <DollarSign className="h-8 w-8" />,
  legacy: <Star className="h-8 w-8" />,
};

const pillarColors: Record<PillarType, { bg: string; gradient: string; text: string; border: string }> = {
  identity: {
    bg: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  business: {
    bg: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  money: {
    bg: 'bg-green-500',
    gradient: 'from-green-500 to-green-600',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  legacy: {
    bg: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
};

// Key insights to show for each unlocked pillar
const pillarInsights: Record<PillarType, (data: any) => string[]> = {
  identity: (data) => [
    data?.sport ? `Sport: ${data.sport.value || data.sport}` : null,
    data?.leadershipStyle ? `Leadership: ${data.leadershipStyle.value || data.leadershipStyle}` : null,
    data?.personalBrandStatement ? 'Personal brand defined ✓' : null,
  ].filter((x): x is string => Boolean(x)).slice(0, 3),
  business: (data) => [
    data?.stateNilAwareness ? 'State rules learned ✓' : null,
    data?.complianceConfidenceScore ? `Confidence: ${data.complianceConfidenceScore.value || data.complianceConfidenceScore}/10` : null,
    data?.supportNetwork ? 'Support network identified ✓' : null,
  ].filter((x): x is string => Boolean(x)).slice(0, 3),
  money: (data) => [
    data?.hasBankAccount ? 'Bank account: ✓' : null,
    data?.taxAwareness ? 'Tax basics learned ✓' : null,
    data?.savingsGoals ? 'Savings goals set ✓' : null,
  ].filter((x): x is string => Boolean(x)).slice(0, 3),
  legacy: (data) => [
    data?.causesPassionateAbout ? 'Causes identified ✓' : null,
    data?.legacyStatement ? 'Legacy defined ✓' : null,
    data?.visionClarityScore ? `Vision clarity: ${data.visionClarityScore.value || data.visionClarityScore}/10` : null,
  ].filter((x): x is string => Boolean(x)).slice(0, 3),
};

export function ChapterCard({ pillar, isUnlocked, isCurrent, profileData, delay = 0 }: ChapterCardProps) {
  const router = useRouter();
  const pillarInfo = PILLARS[pillar];
  const colors = pillarColors[pillar];
  const insights = isUnlocked ? pillarInsights[pillar](profileData?.data || {}) : [];

  const handleClick = () => {
    if (isUnlocked) {
      router.push(`/learn/chapter/${pillar}`);
    } else if (isCurrent) {
      router.push('/discovery');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          ${isUnlocked
            ? `bg-gray-800/50 border-gray-700 hover:${colors.border} hover:border`
            : isCurrent
              ? `bg-gray-800/30 ${colors.border} border`
              : 'bg-gray-800/20 border-gray-800'
          }
        `}
        onClick={handleClick}
      >
        {/* Gradient accent for unlocked */}
        {isUnlocked && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`
                p-3 rounded-lg
                ${isUnlocked
                  ? `bg-gradient-to-br ${colors.gradient} text-white`
                  : isCurrent
                    ? `bg-gray-700 ${colors.text}`
                    : 'bg-gray-800 text-gray-600'
                }
              `}
            >
              {isUnlocked ? (
                pillarIcons[pillar]
              ) : (
                <Lock className="h-8 w-8" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-semibold ${
                    isUnlocked ? 'text-white' : isCurrent ? colors.text : 'text-gray-500'
                  }`}
                >
                  {pillarInfo.chapterTitle}
                </h3>
                {isUnlocked && (
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                )}
              </div>

              <p className={`text-sm mt-1 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                {pillarInfo.description}
              </p>

              {/* Insights for unlocked chapters */}
              {isUnlocked && insights.length > 0 && (
                <div className="mt-3 space-y-1">
                  {insights.map((insight, i) => (
                    <p key={i} className="text-xs text-gray-500">
                      • {insight}
                    </p>
                  ))}
                </div>
              )}

              {/* Current indicator */}
              {isCurrent && !isUnlocked && (
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <motion.span
                    className={`w-2 h-2 rounded-full ${colors.bg}`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  <span className={colors.text}>In Progress</span>
                </div>
              )}
            </div>

            {/* Arrow for clickable cards */}
            {(isUnlocked || isCurrent) && (
              <ArrowRight
                className={`h-5 w-5 flex-shrink-0 ${
                  isUnlocked ? 'text-gray-400' : colors.text
                }`}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
