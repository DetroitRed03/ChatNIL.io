'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ExternalLink } from 'lucide-react';

export function MetricCardExample() {
  const metrics = [
    { label: 'Engagement Rate', value: '8.4%', change: '+2.3%', positive: true },
    { label: 'Reach', value: '156K', change: '+12.5%', positive: true },
    { label: 'Story Views', value: '42.3K', change: '+8.1%', positive: true },
    { label: 'Profile Visits', value: '9.2K', change: '+5.7%', positive: true },
  ];

  return (
    <div className="w-full max-w-sm">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">Performance</h3>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-orange-100 text-sm font-medium">Last 30 Days</p>
        </div>

        {/* Metrics */}
        <div className="p-6">
          <div className="space-y-4 mb-5">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{metric.value}</p>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${
                  metric.positive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-bold">{metric.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Analytics Link */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
          >
            Instagram Analytics
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
