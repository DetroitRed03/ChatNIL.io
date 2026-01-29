'use client';

import { motion } from 'framer-motion';

interface QuickXPCardProps {
  icon: string;
  title: string;
  subtitle: string;
  xp: number;
  color: 'orange' | 'blue' | 'green' | 'purple';
  onClick: () => void;
}

const colorClasses = {
  orange: 'bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600',
  blue: 'bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600',
  green: 'bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600',
  purple: 'bg-gradient-to-br from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600',
};

export function QuickXPCard({
  icon,
  title,
  subtitle,
  xp,
  color,
  onClick,
}: QuickXPCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`${colorClasses[color]} text-white rounded-xl p-4 text-left transition-all w-full min-h-[100px] relative overflow-hidden`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <span className="text-2xl">{icon}</span>
          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold">
            +{xp} XP
          </span>
        </div>
        <h4 className="font-bold mt-2 text-base">{title}</h4>
        <p className="text-sm text-white/80">{subtitle}</p>
      </div>

      {/* Arrow */}
      <motion.div
        className="absolute bottom-3 right-3 text-white/50"
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        →
      </motion.div>
    </motion.button>
  );
}
