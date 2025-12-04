'use client';

import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

export function OpportunityCardExample() {
  return (
    <div className="w-full max-w-sm">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden border-l-4 border-orange-500"
      >
        <div className="p-6">

          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Campus Ambassador</h3>
              <p className="text-sm text-gray-600 font-medium">Gatorade Sports</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5 mb-5 pb-5 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Remote • USA</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Posted 2 days ago</span>
            </div>
          </div>

          {/* Compensation */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Compensation
            </p>
            <p className="text-2xl font-bold text-gray-900">$500/month</p>
            <p className="text-sm text-gray-600 mt-1">+ Performance bonuses</p>
          </div>

          {/* Match Badge */}
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold">
              95% Match
            </div>
            <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-bold">
              Verified
            </div>
          </div>

          {/* Apply Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            View Details
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
