'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  TrendingUp,
  MessageSquare,
  Star,
  Instagram,
  Bookmark
} from 'lucide-react';
import { useState } from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function AthleteCardExample() {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="w-80 bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg"
    >

      {/* Hero Section */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">

        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Profile Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-slate-800 shadow-2xl ring-4 ring-white/50"
          >
            MJ
          </motion.div>
        </div>

        {/* Verified Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg"
        >
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-slate-800">Verified</span>
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSaved(!isSaved)}
          className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          <Bookmark
            className={cn(
              "w-4 h-4 transition-all",
              isSaved ? "fill-amber-500 text-amber-500" : "text-gray-600"
            )}
          />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Name & School */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <h3 className="font-bold text-xl text-slate-900">Marcus Johnson</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            🏀 Basketball • Duke University
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200"
          >
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">Followers</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">247K</div>
            <div className="text-xs text-blue-600 mt-1">+12% this month</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200"
          >
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">8.4%</div>
            <div className="text-xs text-emerald-600 mt-1">Top 5%</div>
          </motion.div>
        </motion.div>

        {/* FMV Range */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="mb-4 p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 rounded-xl relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          <div className="relative">
            <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              💰 Estimated FMV Range
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              $15K - $35K
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {['High Engagement', 'Fashion', 'Gaming'].map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <Badge variant="secondary">{tag}</Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-2"
        >
          <Button
            variant="primary"
            className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact
          </Button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <Instagram className="w-5 h-5" />
          </motion.button>
        </motion.div>

      </div>

    </motion.div>
  );
}
