'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight, Download, Star, Play, Plus, Trash2, Settings } from 'lucide-react';

export function ButtonExamples() {
  return (
    <div className="space-y-12">

      {/* Primary Buttons */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Primary Buttons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            Primary Button
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            With Icon
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-200"
          >
            Gradient
          </motion.button>
        </div>
      </section>

      {/* Secondary Buttons */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Secondary Buttons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Secondary
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Neutral
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Star className="w-5 h-5" />
            Success
          </motion.button>
        </div>
      </section>

      {/* Icon Buttons */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Icon Buttons</h3>
        <div className="flex items-center gap-4 flex-wrap">

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            <Heart className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 flex items-center justify-center transition-colors duration-200"
          >
            <Play className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-colors duration-200"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors duration-200"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Button Sizes */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Button Sizes</h3>
        <div className="flex items-center gap-4 flex-wrap">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            Small
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            Medium
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-lg shadow-orange-500/30 transition-colors duration-200"
          >
            Large
          </motion.button>
        </div>
      </section>

      {/* Button Groups */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Button Groups</h3>
        <div className="inline-flex rounded-xl overflow-hidden border-2 border-gray-200">
          <motion.button
            whileHover={{ backgroundColor: '#f97316' }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 font-semibold text-gray-700 hover:text-white border-r border-gray-200 transition-colors duration-200"
          >
            Option 1
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: '#f97316' }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 font-semibold text-gray-700 hover:text-white border-r border-gray-200 transition-colors duration-200"
          >
            Option 2
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: '#f97316' }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 font-semibold text-gray-700 hover:text-white transition-colors duration-200"
          >
            Option 3
          </motion.button>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Loading States</h3>
        <div className="flex items-center gap-4 flex-wrap">

          <button
            disabled
            className="bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 opacity-50 cursor-not-allowed flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Loading...
          </button>

          <button
            disabled
            className="bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
          >
            Disabled
          </button>
        </div>
      </section>

    </div>
  );
}
