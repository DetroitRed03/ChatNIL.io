'use client';

import { motion } from 'framer-motion';
import { Heart, Star, Users } from 'lucide-react';
import Image from 'next/image';

export function AthleteCardExample() {
  return (
    <div className="w-full max-w-sm">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden"
      >
        {/* Card Content */}
        <div className="p-6">

          {/* Avatar and Name */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                MJ
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">Marcus Johnson</h3>
              <p className="text-sm text-gray-600 font-medium">Basketball • Guard</p>

              {/* Rating Badge */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-orange-600" />
                  <span className="text-sm font-semibold">4.9</span>
                </div>
                <div className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                  Top 5%
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Followers</span>
              </div>
              <p className="text-lg font-bold text-gray-900">24.5K</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                <span className="text-xs font-medium">FMV Score</span>
              </div>
              <p className="text-lg font-bold text-orange-600">$8,500</p>
            </div>
          </div>

          {/* Connect Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            <Heart className="w-5 h-5" />
            Connect
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
