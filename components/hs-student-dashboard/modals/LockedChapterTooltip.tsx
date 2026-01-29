'use client';

import { useState } from 'react';

interface LockedChapterTooltipProps {
  children: React.ReactNode;
  chapterName: string;
  requiredLevel: number;
  currentLevel: number;
}

export function LockedChapterTooltip({
  children,
  chapterName,
  requiredLevel,
  currentLevel
}: LockedChapterTooltipProps) {
  const [show, setShow] = useState(false);
  const xpNeeded = (requiredLevel - currentLevel) * 100; // Rough estimate

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}

      {show && (
        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 text-white text-sm rounded-xl shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span>🔒</span>
            <span className="font-semibold">{chapterName} Locked</span>
          </div>
          <p className="text-gray-300 text-xs mb-2">
            Reach Level {requiredLevel} to unlock this chapter.
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-orange-400">⚡</span>
            <span>You need ~{xpNeeded} more XP</span>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

export default LockedChapterTooltip;
