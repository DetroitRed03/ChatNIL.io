'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/types';
import { getBadgeRarityColor } from '@/lib/badges';
import { Trophy, X, Sparkles, Award, Zap } from 'lucide-react';

interface BadgeUnlockModalProps {
  badge: Badge;
  isOpen: boolean;
  onClose: () => void;
  autoCloseAfter?: number; // milliseconds
}

export default function BadgeUnlockModal({
  badge,
  isOpen,
  onClose,
  autoCloseAfter = 5000
}: BadgeUnlockModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const rarityColors = getBadgeRarityColor(badge.rarity);

  useEffect(() => {
    if (isOpen) {
      // Trigger animations in sequence
      setTimeout(() => setShowConfetti(true), 100);
      setTimeout(() => setShowBadge(true), 300);

      // Auto-close after specified time
      if (autoCloseAfter > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseAfter);

        return () => clearTimeout(timer);
      }
    } else {
      setShowConfetti(false);
      setShowBadge(false);
    }
  }, [isOpen, autoCloseAfter]);

  const handleClose = () => {
    setShowBadge(false);
    setShowConfetti(false);
    setTimeout(() => onClose(), 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6'][
                  Math.floor(Math.random() * 5)
                ]
              }}
            />
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div
        className={`
          relative bg-white rounded-3xl shadow-2xl max-w-md w-full
          transform transition-all duration-500
          ${showBadge ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Badge Unlocked!
          </h2>
          <p className="text-gray-600">
            You've earned a new achievement
          </p>
        </div>

        {/* Badge Display */}
        <div className="px-6 pb-6">
          <div
            className={`
              relative rounded-2xl p-8 border-4
              ${rarityColors.bg} ${rarityColors.border}
              transform transition-all duration-700
              ${showBadge ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
            `}
          >
            {/* Rarity Badge */}
            <div className="absolute top-3 right-3">
              <span className={`
                px-3 py-1 rounded-full text-xs font-bold uppercase
                ${rarityColors.text} ${rarityColors.bg} border-2 ${rarityColors.border}
              `}>
                {badge.rarity}
              </span>
            </div>

            {/* Badge Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center
                  ${rarityColors.bg} ${rarityColors.border} border-4
                  shadow-lg ${rarityColors.glow}
                `}
                animate={{
                  boxShadow: [
                    '0 0 25px rgba(251, 191, 36, 0.6)',
                    '0 0 40px rgba(251, 191, 36, 0.9)',
                    '0 0 25px rgba(251, 191, 36, 0.6)',
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className={`w-12 h-12 ${rarityColors.text}`} />

                {/* Points Badge */}
                {badge.points > 0 && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-yellow-900 font-bold text-sm">
                      +{badge.points}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Badge Info */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {badge.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {badge.description}
              </p>

              {/* Category */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Award className={`w-4 h-4 ${rarityColors.text}`} />
                <span className={`${rarityColors.text} font-medium capitalize`}>
                  {badge.category}
                </span>
              </div>
            </div>

            {/* Sparkle effects in corners */}
            <Sparkles className="absolute top-2 left-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute bottom-2 right-2 w-4 h-4 text-yellow-400 animate-pulse delay-100" />
            <Zap className="absolute bottom-2 left-2 w-5 h-5 text-yellow-400 animate-pulse delay-200" />
          </div>

          {/* Points Earned */}
          {badge.points > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                You earned <span className="font-bold text-yellow-600">{badge.points} points</span>!
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Awesome!
          </button>
        </div>

        {/* Auto-close indicator */}
        {autoCloseAfter > 0 && (
          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-gray-400">
              This will close automatically
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confettiFall 3s linear infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
