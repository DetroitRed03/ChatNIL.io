'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Package
} from 'lucide-react';

export function DealCardExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
      className="w-96 bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg"
    >

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
        </motion.div>

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-xl mb-1">Nike Basketball Campaign</h3>
              <p className="text-emerald-100 text-sm">Spring 2025 Partnership</p>
            </div>
            <Badge variant="success" className="bg-white/20 text-white border-white/30">
              Active
            </Badge>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div>
              <div className="text-emerald-100 text-xs mb-1">Deal Value</div>
              <div className="text-2xl font-bold">$25,000</div>
            </div>
            <div>
              <div className="text-emerald-100 text-xs mb-1">Duration</div>
              <div className="text-lg font-semibold">6 months</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-900">Campaign Progress</span>
            <span className="text-gray-600">6 of 10 deliverables</span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">60% complete</div>
        </motion.div>

        {/* Deliverables */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-6"
        >
          <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Package className="w-4 h-4" />
            Deliverables
          </h4>

          {[
            { label: 'Instagram Posts', completed: 3, total: 5, done: false },
            { label: 'Instagram Stories', completed: 8, total: 10, done: false },
            { label: 'TikTok Videos', completed: 2, total: 2, done: true },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
              </div>
              <span className="text-sm text-gray-600">
                {item.completed}/{item.total}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">847K</div>
            <div className="text-xs text-gray-600 mt-1">Impressions</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">5.2%</div>
            <div className="text-xs text-gray-600 mt-1">Engagement</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">$0.03</div>
            <div className="text-xs text-gray-600 mt-1">CPE</div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 text-sm text-gray-600 mb-6"
        >
          <Calendar className="w-4 h-4" />
          <span>Started Jan 15, 2025 • Ends Jul 15, 2025</span>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Full Campaign
          </Button>
        </motion.div>

      </div>

    </motion.div>
  );
}
