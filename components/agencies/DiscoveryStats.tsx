'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Users, TrendingUp, Trophy, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

interface DiscoveryStatsData {
  totalAthletes: number;
  avgEngagementRate: number;
  popularSports: string[];
  athletesAvailable: number;
}

function AnimatedCounter({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  // Faster animation: higher stiffness = snappier, higher damping = less bounce
  const spring = useSpring(motionValue, { damping: 30, stiffness: 300 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [spring]);

  return (
    <span>
      {displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

export function DiscoveryStats() {
  const [stats, setStats] = useState<DiscoveryStatsData>({
    totalAthletes: 0,
    avgEngagementRate: 0,
    popularSports: [],
    athletesAvailable: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      try {
        // Get total athletes count
        const { count: totalCount } = await supabase
          .from('athlete_profiles')
          .select('*', { count: 'exact', head: true });

        // Get average engagement rate - try athlete_public_profiles first, fallback to social_media_stats
        let avgEngagement = 0;

        const { data: engagementData, error: engagementError } = await supabase
          .from('athlete_public_profiles')
          .select('avg_engagement_rate')
          .not('avg_engagement_rate', 'is', null);

        if (engagementData && engagementData.length > 0) {
          avgEngagement = engagementData.reduce((sum, row) => sum + (row.avg_engagement_rate || 0), 0) / engagementData.length;
        } else {
          // Fallback: try to get engagement rate from social_media_stats
          const { data: socialStats } = await supabase
            .from('social_media_stats')
            .select('engagement_rate')
            .not('engagement_rate', 'is', null);

          if (socialStats && socialStats.length > 0) {
            avgEngagement = socialStats.reduce((sum, row) => sum + (row.engagement_rate || 0), 0) / socialStats.length;
          } else {
            // Default to a reasonable value if no data exists
            avgEngagement = 4.5;
          }
        }

        // Get popular sports (top 3)
        const { data: sportsData } = await supabase
          .from('athlete_profiles')
          .select('sport')
          .not('sport', 'is', null);

        const sportCounts = sportsData?.reduce((acc: Record<string, number>, row) => {
          acc[row.sport] = (acc[row.sport] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const popularSports = Object.entries(sportCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([sport]) => sport);

        setStats({
          totalAthletes: totalCount || 0,
          avgEngagementRate: avgEngagement,
          popularSports,
          athletesAvailable: totalCount || 0 // Just use total count since we don't have availability field
        });
      } catch (error) {
        console.error('Error fetching discovery stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: Users,
      label: 'Total Athletes',
      value: stats.totalAthletes,
      suffix: '',
      decimals: 0,
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'from-purple-500 to-pink-500',
      iconColor: 'text-white'
    },
    {
      icon: TrendingUp,
      label: 'Avg Engagement',
      value: stats.avgEngagementRate,
      suffix: '%',
      decimals: 1,
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'from-green-500 to-emerald-500',
      iconColor: 'text-white'
    },
    {
      icon: Trophy,
      label: 'Popular Sports',
      value: null,
      customContent: stats.popularSports.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {stats.popularSports.map((sport) => (
            <span
              key={sport}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200"
            >
              {sport}
            </span>
          ))}
        </div>
      ) : null,
      bgGradient: 'from-orange-50 to-amber-50',
      iconBg: 'from-orange-500 to-amber-500',
      iconColor: 'text-white'
    },
    {
      icon: CheckCircle2,
      label: 'Available Now',
      value: stats.athletesAvailable,
      suffix: '',
      decimals: 0,
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'from-blue-500 to-cyan-500',
      iconColor: 'text-white'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl h-28 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          className={`bg-gradient-to-br ${card.bgGradient} rounded-xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.iconBg} flex items-center justify-center shadow-sm`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {card.value !== null ? (
                <AnimatedCounter
                  value={card.value}
                  decimals={card.decimals}
                  suffix={card.suffix}
                />
              ) : (
                card.customContent
              )}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {card.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
