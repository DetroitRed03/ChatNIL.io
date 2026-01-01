'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: number | string;
}

/**
 * FilterSection Component
 *
 * Collapsible section for filter groups in the sidebar.
 * Shows title with chevron and optional badge for active filter count.
 */
export function FilterSection({
  title,
  defaultOpen = false,
  children,
  badge
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 transition-colors -mx-2 px-2 rounded-lg"
      >
        <span className="font-medium text-gray-900 text-sm">{title}</span>
        <div className="flex items-center gap-2">
          {badge !== undefined && badge !== 0 && (
            <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
