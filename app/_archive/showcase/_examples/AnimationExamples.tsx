'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import {
  Sparkles,
  Zap,
  Heart,
  Star,
  TrendingUp,
  Award,
  Gift,
  Rocket,
} from 'lucide-react';

export function AnimationExamples() {
  const [showNotification, setShowNotification] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="w-full space-y-12">
      {/* Fade Animations */}
      <Section title="Fade Animations" description="Opacity-based entrance effects">
        <div className="flex flex-wrap gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
          >
            Fade In
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-40 h-40 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
          >
            Fade Delayed
          </motion.div>

          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-40 h-40 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
                onClick={() => setIsVisible(!isVisible)}
              >
                Click to Hide
              </motion.div>
            )}
          </AnimatePresence>

          {!isVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-40 h-40 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
              onClick={() => setIsVisible(!isVisible)}
            >
              Click to Show
            </motion.div>
          )}
        </div>
      </Section>

      {/* Slide Animations */}
      <Section title="Slide Animations" description="Directional entrance effects">
        <div className="space-y-4 max-w-2xl">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg"
          >
            Slide from Left
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
            className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg"
          >
            Slide from Right
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
            className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold shadow-lg"
          >
            Slide from Bottom
          </motion.div>
        </div>
      </Section>

      {/* Scale Animations */}
      <Section title="Scale Animations" description="Size-based entrance effects">
        <div className="flex flex-wrap gap-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-40 h-40 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
          >
            Pop In
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150 }}
            className="w-40 h-40 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
          >
            Spin & Scale
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer"
          >
            Hover Me
          </motion.button>
        </div>
      </Section>

      {/* Rotate Animations */}
      <Section title="Rotate Animations" description="Rotational effects">
        <div className="flex flex-wrap gap-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg"
          >
            <Award className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Star className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </Section>

      {/* Bounce Animation */}
      <Section title="Bounce Animations" description="Spring-based bouncing effects">
        <div className="flex flex-wrap gap-8">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Heart className="w-10 h-10 text-white fill-white" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <TrendingUp className="w-10 h-10 text-white" />
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </Section>

      {/* Interactive Like Button */}
      <Section title="Interactive Animations" description="User interaction effects">
        <div className="flex flex-wrap gap-8 items-center">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setLikeCount(likeCount + 1)}
            className="relative"
          >
            <motion.div
              animate={likeCount > 0 ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer ${
                likeCount > 0
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                  : 'bg-gray-200'
              }`}
            >
              <Heart
                className={`w-12 h-12 ${
                  likeCount > 0 ? 'text-white fill-white' : 'text-gray-400'
                }`}
              />
            </motion.div>

            {/* Like counter */}
            <AnimatePresence>
              {likeCount > 0 && (
                <motion.div
                  initial={{ scale: 0, y: 0 }}
                  animate={{ scale: 1, y: -10 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                >
                  {likeCount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
            className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Gift className="w-12 h-12 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotification(true)}
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Rocket className="w-12 h-12 text-white" />
          </motion.button>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-2xl max-w-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold">Success!</div>
                    <div className="text-sm text-emerald-100">Animation triggered</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* Shimmer Effect */}
      <Section title="Shimmer Effects" description="Gradient animation effects">
        <div className="space-y-4 max-w-2xl">
          <motion.div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-bold shadow-lg overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <span className="relative">Shimmer Effect</span>
          </motion.div>

          <motion.div className="relative p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold shadow-lg overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative">Continuous Shimmer</span>
          </motion.div>
        </div>
      </Section>

      {/* Stagger Children */}
      <Section title="Stagger Animations" description="Sequential child animations">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-4 gap-4 max-w-2xl"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="aspect-square bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
            >
              {i + 1}
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Loading Spinner */}
      <Section title="Loading Animations" description="Spinner and skeleton effects">
        <div className="flex flex-wrap gap-8 items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-gray-200 border-t-primary-500 rounded-full"
          />

          <motion.div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-4 h-4 bg-primary-500 rounded-full"
              />
            ))}
          </motion.div>

          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-48 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
          />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
        {children}
      </div>
    </motion.div>
  );
}
