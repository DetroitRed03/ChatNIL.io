'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, MapPin, DollarSign, Target, Zap } from 'lucide-react';

export function OpportunityCardExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="w-96 bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg"
    >
      {/* Match Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 p-4 relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white fill-white" />
            <span className="text-white font-bold">High Match</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center gap-1"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
              >
                <Star className="w-4 h-4 text-white fill-white" />
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-white text-sm font-semibold"
        >
          94% Match Score
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="p-6">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-4 mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            A
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-slate-900 mb-1">Adidas Running</h3>
            <p className="text-sm text-gray-600">Athletic Apparel Campaign</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="success">Verified Brand</Badge>
              <Badge variant="secondary">Featured</Badge>
            </div>
          </div>
        </motion.div>

        {/* Deal Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-6"
        >
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs text-gray-600">Compensation Range</div>
              <div className="font-bold text-emerald-700">$18,000 - $25,000</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-xs text-gray-600">Location</div>
              <div className="font-semibold text-blue-700">Remote • National Campaign</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Target className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-xs text-gray-600">Content Required</div>
              <div className="font-semibold text-purple-700">6 Instagram Posts • 10 Stories</div>
            </div>
          </div>
        </motion.div>

        {/* Why You're a Match */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h4 className="font-semibold text-gray-900 text-sm mb-3">Why You're a Great Match</h4>
          <div className="space-y-2">
            {[
              'Your engagement rate exceeds campaign average by 45%',
              'Strong track record with athletic brands',
              'Audience demographics align perfectly',
            ].map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{reason}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button variant="primary" className="w-full bg-gradient-to-r from-primary-500 to-secondary-500">
            <Zap className="w-4 h-4 mr-2" />
            Apply Now
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">23 athletes have applied • 2 spots remaining</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
