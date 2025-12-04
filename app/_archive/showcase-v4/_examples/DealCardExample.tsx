'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

export function DealCardExample() {
  return (
    <div className="w-full max-w-sm">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden"
      >
        {/* Card Content */}
        <div className="p-6">

          {/* Brand Logo and Info */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5 3L2 12h6v9h5v-9h6l-8.5-9z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">Nike Campaign</h3>
              <p className="text-sm text-gray-600 font-medium">Social Media Partnership</p>
            </div>
          </div>

          {/* Campaign Value */}
          <div className="mb-5 pb-5 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Campaign Value
            </p>
            <p className="text-3xl font-bold text-gray-900">$12,000</p>
            <p className="text-sm text-gray-600 mt-1">3-month partnership</p>
          </div>

          {/* Match Score */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Match Score
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-green-500 h-2 rounded-full"
                  />
                </div>
                <span className="text-lg font-bold text-green-600">92%</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Apply Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
