'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Trophy, Target, BookOpen, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PillarType, PILLARS, PILLAR_ORDER } from '@/lib/discovery/questions';
import confetti from 'canvas-confetti';

interface ChapterUnlockProps {
  pillar: PillarType;
  onClose: () => void;
}

const pillarIcons: Record<PillarType, React.ReactNode> = {
  identity: <Target className="h-16 w-16" />,
  business: <BookOpen className="h-16 w-16" />,
  money: <DollarSign className="h-16 w-16" />,
  legacy: <Star className="h-16 w-16" />,
};

const pillarColors: Record<PillarType, { gradient: string; text: string }> = {
  identity: {
    gradient: 'from-blue-500 to-blue-600',
    text: 'text-blue-400',
  },
  business: {
    gradient: 'from-purple-500 to-purple-600',
    text: 'text-purple-400',
  },
  money: {
    gradient: 'from-green-500 to-green-600',
    text: 'text-green-400',
  },
  legacy: {
    gradient: 'from-orange-500 to-orange-600',
    text: 'text-orange-400',
  },
};

const pillarSummaries: Record<PillarType, string[]> = {
  identity: [
    'Your sport and position',
    'Your social media presence',
    'Your leadership style',
    'Your personal brand keywords',
    'What makes you unique',
  ],
  business: [
    'State NIL rules awareness',
    'Deal evaluation skills',
    'Red flag recognition',
    'Contract basics',
    'Support network for decisions',
  ],
  money: [
    'Your financial habits',
    'Tax awareness',
    'Budgeting basics',
    'Savings goals',
    'Financial decision-making',
  ],
  legacy: [
    'Your future vision',
    'Causes you care about',
    'Impact you want to make',
    'Role models and inspiration',
    'Your legacy statement',
  ],
};

export function ChapterUnlock({ pillar, onClose }: ChapterUnlockProps) {
  const [showContent, setShowContent] = useState(false);
  const pillarInfo = PILLARS[pillar];
  const colors = pillarColors[pillar];
  const currentIndex = PILLAR_ORDER.indexOf(pillar);
  const nextPillar = currentIndex < PILLAR_ORDER.length - 1 ? PILLAR_ORDER[currentIndex + 1] : null;

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F97316'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F97316'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Show content after delay
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with Animation */}
          <div className={`bg-gradient-to-r ${colors.gradient} p-8 text-center`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 bg-white/20 rounded-full">
                {pillarIcons[pillar]}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-6 w-6" />
                <span className="text-lg font-semibold">CHAPTER UNLOCKED!</span>
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold">{pillarInfo.chapterTitle}</h2>
            </motion.div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
              >
                {/* What We Learned */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    What we discovered about you:
                  </h3>
                  <ul className="space-y-2">
                    {pillarSummaries[pillar].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`} />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Next Chapter Preview */}
                {nextPillar ? (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Coming up next:</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{PILLARS[nextPillar].icon}</span>
                      <div>
                        <p className={`font-medium ${pillarColors[nextPillar].text}`}>
                          {PILLARS[nextPillar].chapterTitle}
                        </p>
                        <p className="text-sm text-gray-400">
                          {PILLARS[nextPillar].description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                    <p className="text-center text-yellow-300 font-medium">
                      🎉 You've completed all 4 chapters!
                    </p>
                    <p className="text-center text-sm text-gray-400 mt-1">
                      Your Discovery Journey is complete!
                    </p>
                  </div>
                )}

                {/* Continue Button */}
                <Button
                  onClick={onClose}
                  className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90`}
                >
                  {nextPillar ? (
                    <>
                      Continue to {PILLARS[nextPillar].name}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      View My Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
