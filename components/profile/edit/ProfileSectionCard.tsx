'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { CreativeSlider } from '@/components/ui/CreativeSlider';

export interface ProfileSectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  completionPercentage: number;
  defaultExpanded?: boolean;
  gradientColors?: [string, string];
}

/**
 * ProfileSectionCard Component
 *
 * Collapsible section card for profile editing with:
 * - Smooth expand/collapse animations
 * - Section completion slider (not counter!)
 * - V4 design system styling (orange/gold)
 * - Fun and engaging for Gen Z students
 *
 * @example
 * ```tsx
 * <ProfileSectionCard
 *   id="personal"
 *   title="Personal Information"
 *   description="Tell us about yourself"
 *   icon={User}
 *   completionPercentage={75}
 *   defaultExpanded
 * >
 *   <input ... />
 * </ProfileSectionCard>
 * ```
 */
export function ProfileSectionCard({
  id,
  title,
  description,
  icon: Icon,
  children,
  completionPercentage,
  defaultExpanded = false,
  gradientColors = ['#f97316', '#f59e0b'] // orange-500 to amber-500
}: ProfileSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden"
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Icon */}
          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Title and Description */}
          <div className="text-left flex-1">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>

          {/* Completion Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${
                  completionPercentage === 100
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                    : completionPercentage >= 75
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'
                    : 'text-gray-400'
                }`}
              >
                {completionPercentage}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>

            {/* Expand/Collapse Icon */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </motion.div>
          </div>
        </div>
      </button>

      {/* Completion Slider */}
      <div className="px-6 pb-4">
        <CreativeSlider
          min={0}
          max={100}
          value={completionPercentage}
          onChange={() => {}} // Read-only
          formatValue={(val) => `${val}%`}
          showValue={false}
          gradientColors={gradientColors}
          className="pointer-events-none"
        />
      </div>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`section-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
              opacity: { duration: 0.2 }
            }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-6 border-t border-gray-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Celebration (100%) */}
      {completionPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pb-4 flex items-center gap-2 text-green-600"
        >
          <div className="flex-1 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
          <span className="text-sm font-semibold">✨ Section Complete!</span>
          <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}
