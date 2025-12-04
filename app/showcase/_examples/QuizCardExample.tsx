'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Brain, Clock, Award, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function QuizCardExample() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="w-96 bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              <span className="font-bold text-lg">NIL Basics</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Beginner
            </Badge>
          </div>

          <h3 className="text-xl font-bold mb-2">Understanding NIL Rights</h3>
          <p className="text-indigo-100 text-sm">Learn the fundamentals of Name, Image, and Likeness</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">5 min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Brain className="w-4 h-4" />
            <span className="text-sm">10 questions</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Award className="w-4 h-4" />
            <span className="text-sm">50 XP</span>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-900">Your Progress</span>
            <span className="text-gray-600">3 of 10 completed</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '30%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Sample Question Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl"
        >
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Sample Question:</h4>
          <p className="text-sm text-gray-700 mb-3">
            What does NIL stand for in college athletics?
          </p>

          <div className="space-y-2">
            {[
              'Name, Image, Likeness',
              'National Interaction League',
              'New Income Law',
            ].map((option, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => setSelected(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg text-left text-sm font-medium transition-all ${
                  selected === i
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">Complete to unlock</div>
              <div className="font-bold text-amber-700">Scholar Badge + 50 XP</div>
            </div>
            <Award className="w-8 h-8 text-amber-500" />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button variant="primary" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
            Continue Quiz
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
