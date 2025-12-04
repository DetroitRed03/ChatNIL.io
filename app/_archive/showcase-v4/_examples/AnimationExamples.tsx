'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';
import { Heart, Star, TrendingUp, Zap } from 'lucide-react';

export function AnimationExamples() {
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-12">

      {/* 3D Card Hover Effects */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">3D Card Transforms</h3>
        <div className="grid md:grid-cols-3 gap-6">

          {/* Lift Effect */}
          <motion.div
            whileHover={{ y: -12, scale: 1.03 }}
            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-gray-200"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Lift & Scale</h4>
            <p className="text-gray-600">Hover to see the card lift up with subtle scaling</p>
          </motion.div>

          {/* Rotate Effect */}
          <TiltCard>
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">3D Tilt</h4>
            <p className="text-gray-600">Move your mouse to see the 3D tilt effect</p>
          </TiltCard>

          {/* Glow Effect */}
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(249, 115, 22, 0.4)' }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-lg text-white"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-2">Glow Effect</h4>
            <p className="text-orange-100">Hover to see the orange glow expand</p>
          </motion.div>

        </div>
      </section>

      {/* Micro-interactions */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Micro-interactions</h3>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Like Button */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Like Animation</h4>
            <motion.button
              onClick={() => setIsLiked(!isLiked)}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center shadow-lg"
            >
              <motion.div
                animate={{
                  scale: isLiked ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`w-8 h-8 ${isLiked ? 'fill-white text-white' : 'text-white'}`}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Counter */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Counter Animation</h4>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCount(Math.max(0, count - 1))}
                className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xl"
              >
                -
              </motion.button>
              <motion.div
                key={count}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-bold text-orange-600 w-20 text-center"
              >
                {count}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCount(count + 1)}
                className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl"
              >
                +
              </motion.button>
            </div>
          </div>

        </div>
      </section>

      {/* Loading States */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Loading Animations</h3>
        <div className="grid md:grid-cols-3 gap-6">

          {/* Spinner */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-600 font-medium">Spinner</p>
          </div>

          {/* Pulse */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-12 h-12 bg-orange-500 rounded-full mb-4"
            />
            <p className="text-gray-600 font-medium">Pulse</p>
          </div>

          {/* Dots */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg flex flex-col items-center justify-center">
            <div className="flex gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-3 h-3 bg-orange-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-gray-600 font-medium">Bouncing Dots</p>
          </div>

        </div>
      </section>

      {/* Stagger Animation */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Stagger Animation</h3>
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-2">
                  {item}
                </div>
                <p className="text-sm font-semibold text-gray-700">Item {item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide In Animations */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Slide Animations</h3>
        <div className="grid md:grid-cols-2 gap-6">

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-2">Slide from Left</h4>
            <p className="text-gray-600">Smooth entrance animation</p>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-2">Slide from Right</h4>
            <p className="text-gray-600">Smooth entrance animation</p>
          </motion.div>

        </div>
      </section>

    </div>
  );
}

// 3D Tilt Card Component
function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 cursor-pointer"
    >
      {children}
    </motion.div>
  );
}
