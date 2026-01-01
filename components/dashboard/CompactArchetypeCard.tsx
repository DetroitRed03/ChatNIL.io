'use client';

import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Trait {
  name: string;
  score: number;
}

interface CompactArchetypeCardProps {
  archetype: string | null;
  traits: Trait[];
  completedAt?: string | null;
}

export function CompactArchetypeCard({ archetype, traits, completedAt }: CompactArchetypeCardProps) {
  // Get top 3 traits
  const topTraits = traits?.slice(0, 3) || [];

  // If no archetype yet, show CTA to complete assessment
  if (!archetype) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Your Archetype</h3>
        </div>

        <p className="text-sm text-gray-500 mb-4 flex-grow">
          Discover your athletic identity and unlock better brand matches.
        </p>

        <Link
          href="/assessment"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          Take Assessment
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{archetype}</h3>
            <p className="text-xs text-gray-500">Your Athletic Identity</p>
          </div>
        </div>
      </div>

      {/* Top Traits - Compact */}
      <div className="space-y-2.5 mb-4 flex-grow">
        {topTraits.map((trait, index) => (
          <motion.div
            key={trait.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-gray-600 w-24 truncate">{trait.name}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${trait.score}%` }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{trait.score}%</span>
          </motion.div>
        ))}
        {topTraits.length === 0 && (
          <p className="text-sm text-gray-400 italic">No traits data available</p>
        )}
      </div>

      {/* Footer Link */}
      <Link
        href="/assessment/results"
        className="flex items-center justify-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
      >
        View Full Results
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default CompactArchetypeCard;
