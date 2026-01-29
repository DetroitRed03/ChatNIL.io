'use client';

import { useEffect, useState } from 'react';

interface StreakUpdatedToastProps {
  streak: number;
  onComplete?: () => void;
}

export function StreakUpdatedToast({ streak, onComplete }: StreakUpdatedToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-36 left-1/2 -translate-x-1/2 z-50 animate-pulse">
      <div className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
        <span className="text-xl">🔥</span>
        <span className="text-lg">{streak} Day Streak!</span>
      </div>
    </div>
  );
}

export default StreakUpdatedToast;
