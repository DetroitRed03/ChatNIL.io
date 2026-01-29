'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DimensionTooltipProps {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  status: 'good' | 'warning' | 'critical';
  children: React.ReactNode;
}

export function DimensionTooltip({
  name,
  score,
  maxScore,
  description,
  status,
  children
}: DimensionTooltipProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 256; // w-64 = 16rem = 256px

      // Calculate position - center above the trigger
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      let top = rect.top - 8; // 8px gap

      // Keep tooltip within viewport
      if (left < 8) left = 8;
      if (left + tooltipWidth > window.innerWidth - 8) {
        left = window.innerWidth - tooltipWidth - 8;
      }

      setPosition({ top, left });
    }
  }, [show]);

  const statusColors = {
    good: 'text-emerald-500',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };

  const percentage = Math.round((score / maxScore) * 100);

  return (
    <>
      <div
        ref={triggerRef}
        className="cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        tabIndex={0}
      >
        {children}
      </div>

      {show && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg transform -translate-y-full animate-in fade-in duration-150"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">{name}</span>
            <span className={`font-bold ${statusColors[status]}`}>
              {score}/{maxScore}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${
                status === 'good' ? 'bg-emerald-500' :
                status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-gray-300 text-xs">{description}</p>

          {/* Arrow */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-gray-900" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
