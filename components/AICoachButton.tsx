'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getWidgetContent } from '@/lib/chat/role-content';

export function AICoachButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const widget = getWidgetContent(user?.role);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded State - Mini Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 mb-2"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{widget.title}</h4>
                <p className="text-xs text-gray-500">{widget.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {widget.description}
            </p>
            <Link
              href="/chat"
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-2.5 rounded-lg transition-colors"
              onClick={() => setIsExpanded(false)}
            >
              {widget.cta}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          w-14 h-14 rounded-full shadow-lg flex items-center justify-center
          transition-colors duration-200
          ${isExpanded
            ? 'bg-gray-800 hover:bg-gray-700 shadow-gray-500/30'
            : 'bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/30'
          }
        `}
        title={widget.title}
        aria-label={widget.title}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}

export default AICoachButton;
