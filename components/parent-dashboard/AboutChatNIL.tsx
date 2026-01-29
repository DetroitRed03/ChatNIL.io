'use client';

import { motion } from 'framer-motion';
import { Info, ChevronRight, Target, Shield, DollarSign, Compass } from 'lucide-react';

interface AboutChatNILProps {
  onLearnMore?: () => void;
}

export function AboutChatNIL({ onLearnMore }: AboutChatNILProps) {
  const topics = [
    {
      icon: Target,
      label: 'Building their personal brand',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Shield,
      label: 'Understanding state and NCAA rules',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      icon: DollarSign,
      label: 'Managing money and taxes',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      icon: Compass,
      label: 'Planning for their future',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <motion.div
      data-testid="about-chatnil"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Info className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">About ChatNIL</h2>
      </div>

      <p className="text-sm text-gray-700 mb-5">
        ChatNIL teaches student athletes about NIL (Name, Image, Likeness) rules
        before they get to college. Our interactive lessons help them understand
        their rights and responsibilities.
      </p>

      <p className="text-sm font-medium text-gray-900 mb-3">Your child is learning about:</p>

      <div className="space-y-2 mb-5">
        {topics.map((topic, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 bg-white/60 rounded-lg p-2"
          >
            <div className={`w-8 h-8 ${topic.bgColor} rounded-lg flex items-center justify-center`}>
              <topic.icon className={`w-4 h-4 ${topic.color}`} />
            </div>
            <span className="text-sm text-gray-700">{topic.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/80 rounded-xl p-4 border border-purple-100 mb-4">
        <p className="text-sm text-gray-600">
          <strong className="text-gray-900">Important:</strong> We do NOT facilitate
          deals for high school students. ChatNIL is purely educational.
        </p>
      </div>

      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-purple-600 hover:text-purple-700 font-medium text-sm hover:bg-white/50 rounded-lg transition-colors"
        >
          Learn More About NIL
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
