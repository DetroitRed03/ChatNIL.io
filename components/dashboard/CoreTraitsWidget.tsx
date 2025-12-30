/**
 * Core Traits Widget - Dashboard Component
 *
 * Displays the athlete's brand archetype and top traits:
 * - Archetype name and description
 * - Top 5 personality traits with scores
 * - Visual representation with icons
 * - CTA to take/retake assessment
 *
 * Features:
 * - Orange/amber gradient header (brand identity theme)
 * - Loading, error, and empty states
 * - Smooth animations with Framer Motion
 * - Responsive design
 */

'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Sparkles, User, ArrowRight, Crown, Zap, Heart, Trophy, Target, Shield, Users, Lightbulb, Rocket, Fingerprint, Link2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CoreTraitsWidgetProps {
  userId?: string;
  className?: string;
}

interface TraitResult {
  archetypeCode: string;
  archetypeName: string;
  archetypeDescription: string;
  topTraits: string[];
  traitScores: Record<string, number>;
  calculatedAt: string;
}

// Trait icons mapping
const TRAIT_ICONS: Record<string, React.ElementType> = {
  leadership: Crown,
  creativity: Lightbulb,
  community_focus: Heart,
  competition: Trophy,
  authenticity: Fingerprint,
  resilience: Shield,
  teamwork: Users,
  ambition: Rocket,
  charisma: Sparkles,
  discipline: Target,
  innovation: Zap,
  loyalty: Link2,
};

// Trait display names
const TRAIT_NAMES: Record<string, string> = {
  leadership: 'Leadership',
  creativity: 'Creativity',
  community_focus: 'Community Focus',
  competition: 'Competitive Drive',
  authenticity: 'Authenticity',
  resilience: 'Resilience',
  teamwork: 'Team Player',
  ambition: 'Ambition',
  charisma: 'Charisma',
  discipline: 'Discipline',
  innovation: 'Innovation',
  loyalty: 'Loyalty',
};

// Archetype icons and colors
const ARCHETYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; gradient: string }> = {
  captain: { icon: Crown, color: 'text-amber-600', gradient: 'from-amber-400 to-orange-500' },
  trailblazer: { icon: Rocket, color: 'text-orange-600', gradient: 'from-orange-400 to-amber-500' },
  champion: { icon: Trophy, color: 'text-yellow-600', gradient: 'from-yellow-400 to-amber-500' },
  ambassador: { icon: Heart, color: 'text-red-600', gradient: 'from-red-400 to-rose-500' },
  entertainer: { icon: Sparkles, color: 'text-amber-600', gradient: 'from-amber-400 to-orange-500' },
  purist: { icon: Target, color: 'text-gray-600', gradient: 'from-gray-500 to-gray-600' },
  connector: { icon: Users, color: 'text-green-600', gradient: 'from-green-400 to-emerald-500' },
  builder: { icon: Lightbulb, color: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
};

// Fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

// Loading skeleton component
function CoreTraitsSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// Error state component
function ErrorState() {
  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
          <User className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-600 font-medium">Failed to load brand identity</p>
        <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
      </div>
    </div>
  );
}

// Empty state component - CTA to take assessment
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-orange-500/90 via-orange-600/90 to-amber-500/90 px-6 py-6">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Brand Identity
        </h3>
        <p className="text-white/90 text-sm mt-1">Discover your athlete archetype</p>
      </div>

      {/* Empty Content */}
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
          <User className="h-10 w-10 text-orange-600" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Discover Your Brand Identity!</h4>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Take our 5-minute assessment to uncover your athlete archetype and find brand partnerships that align with who you truly are.
        </p>
        <Link href="/assessment">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            Take Assessment
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export function CoreTraitsWidget({ userId, className = '' }: CoreTraitsWidgetProps) {
  const { data, isLoading, error } = useSWR<{ results: TraitResult | null }>(
    userId ? `/api/assessment/results?userId=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Loading state
  if (isLoading) return <CoreTraitsSkeleton />;

  // Error state
  if (error) return <ErrorState />;

  // Empty state - no assessment results
  if (!data?.results) return <EmptyState />;

  const { archetypeCode, archetypeName, archetypeDescription, topTraits, traitScores, calculatedAt } = data.results;

  // Get archetype config
  const archetypeConfig = ARCHETYPE_CONFIG[archetypeCode] || ARCHETYPE_CONFIG.captain;
  const ArchetypeIcon = archetypeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Gradient Header with Animation */}
      <div className={`relative bg-gradient-to-r ${archetypeConfig.gradient} px-6 py-6 overflow-hidden`}>
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />

        {/* Header Content */}
        <div className="relative">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <ArchetypeIcon className="h-6 w-6" />
            {archetypeName}
          </h3>
          <p className="text-white/90 text-sm mt-1">Your Athlete Archetype</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Archetype Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-gray-600 text-sm leading-relaxed">
            {archetypeDescription}
          </p>
        </motion.div>

        {/* Top Traits */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-600" />
            Top Traits
          </h4>
          <div className="space-y-2">
            {topTraits.slice(0, 5).map((trait, index) => {
              const TraitIcon = TRAIT_ICONS[trait] || Target;
              const score = traitScores[trait] || 0;

              return (
                <motion.div
                  key={trait}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${archetypeConfig.gradient}`}>
                    <TraitIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {TRAIT_NAMES[trait] || trait}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{score}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                        className={`h-full bg-gradient-to-r ${archetypeConfig.gradient} rounded-full`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-2"
        >
          <Link href="/assessment/results">
            <button className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${archetypeConfig.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}>
              View Full Results
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <Link href="/assessment">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
              <RefreshCw className="h-4 w-4" />
              Retake Assessment
            </button>
          </Link>
        </motion.div>

        {/* Timestamp */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-gray-400 text-center mt-4"
        >
          Completed {new Date(calculatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </motion.p>
      </div>
    </motion.div>
  );
}
