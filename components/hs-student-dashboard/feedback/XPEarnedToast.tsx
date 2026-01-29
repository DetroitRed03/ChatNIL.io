'use client';

import { useEffect, useState } from 'react';

interface XPEarnedToastProps {
  amount: number;
  onComplete?: () => void;
}

export function XPEarnedToast({ amount, onComplete }: XPEarnedToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <span className="text-lg">+{amount} XP</span>
      </div>
    </div>
  );
}

export default XPEarnedToast;
