import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

export interface CreativeSliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number | [number, number];
  value?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  formatValue?: (value: number) => string;
  gradientColors?: [string, string];
  snapPoints?: number[];
  showValue?: boolean;
  range?: boolean;
  className?: string;
}

export const CreativeSlider = React.forwardRef<HTMLDivElement, CreativeSliderProps>(
  (
    {
      label,
      min,
      max,
      step = 1,
      defaultValue,
      value: controlledValue,
      onChange,
      formatValue = (val) => val.toString(),
      gradientColors = ['#f97316', '#f59e0b'],
      snapPoints = [],
      showValue = true,
      range = false,
      className,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number | [number, number]>(() => {
      if (controlledValue !== undefined) return controlledValue;
      if (defaultValue !== undefined) return defaultValue;
      return range ? [min, min + (max - min) * 0.25] : min;
    });

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);

    // Motion values for animations
    const glowOpacity = useMotionValue(0);
    const pulseScale = useTransform(glowOpacity, [0, 1], [1, 1.05]);

    const handleValueChange = (newValue: number | [number, number]) => {
      // Snap to snap points if close enough
      const snapThreshold = (max - min) * 0.02;

      const snapValue = (val: number) => {
        for (const snapPoint of snapPoints) {
          if (Math.abs(val - snapPoint) < snapThreshold) {
            return snapPoint;
          }
        }
        return val;
      };

      const snappedValue = Array.isArray(newValue)
        ? [snapValue(newValue[0]), snapValue(newValue[1])] as [number, number]
        : snapValue(newValue);

      setInternalValue(snappedValue);
      onChange?.(snappedValue);
    };

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

    const handleMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max' = 'min') => {
      e.preventDefault();
      setIsDragging(thumb);
      animate(glowOpacity, 1, { duration: 0.2 });
    };

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const newValue = min + (percentage / 100) * (max - min);
        const steppedValue = Math.round(newValue / step) * step;

        if (range && Array.isArray(value)) {
          if (isDragging === 'min') {
            handleValueChange([Math.min(steppedValue, value[1] - step), value[1]]);
          } else {
            handleValueChange([value[0], Math.max(steppedValue, value[0] + step)]);
          }
        } else {
          handleValueChange(steppedValue);
        }
      },
      [isDragging, min, max, step, value, range]
    );

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(null);
      animate(glowOpacity, 0, { duration: 0.3 });
    }, []);

    React.useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const minValue = range && Array.isArray(value) ? value[0] : (value as number);
    const maxValue = range && Array.isArray(value) ? value[1] : (value as number);
    const minPercentage = getPercentage(minValue);
    const maxPercentage = getPercentage(range ? maxValue : minValue);

    return (
      <div ref={ref} className={cn('w-full space-y-4', className)}>
        {label && (
          <label className="block text-sm font-semibold text-text-primary">
            {label}
          </label>
        )}

        <div className="relative pt-8 pb-6">
          {/* Track background */}
          <div
            ref={trackRef}
            className="relative h-3 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = ((e.clientX - rect.left) / rect.width) * 100;
              const newValue = min + (percentage / 100) * (max - min);
              const steppedValue = Math.round(newValue / step) * step;

              if (range && Array.isArray(value)) {
                const distToMin = Math.abs(steppedValue - value[0]);
                const distToMax = Math.abs(steppedValue - value[1]);
                if (distToMin < distToMax) {
                  handleValueChange([steppedValue, value[1]]);
                } else {
                  handleValueChange([value[0], steppedValue]);
                }
              } else {
                handleValueChange(steppedValue);
              }
            }}
          >
            {/* Animated gradient fill */}
            <motion.div
              className="absolute top-0 h-full rounded-full"
              style={{
                left: range ? `${minPercentage}%` : '0%',
                width: range ? `${maxPercentage - minPercentage}%` : `${maxPercentage}%`,
                background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: isDragging ? ['0% 50%', '100% 50%'] : '0% 50%',
              }}
              transition={{
                duration: 2,
                repeat: isDragging ? Infinity : 0,
                ease: 'linear',
              }}
            />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                left: range ? `${minPercentage}%` : '0%',
                width: range ? `${maxPercentage - minPercentage}%` : `${maxPercentage}%`,
                background: `radial-gradient(ellipse at center, ${gradientColors[0]}40, transparent)`,
                opacity: glowOpacity,
                filter: 'blur(8px)',
              }}
            />
          </div>

          {/* Snap point indicators */}
          {snapPoints.map((snapPoint) => {
            const snapPercentage = getPercentage(snapPoint);
            return (
              <div
                key={snapPoint}
                className="absolute top-1/2 w-1 h-5 -translate-y-1/2 bg-gray-300 rounded-full"
                style={{ left: `${snapPercentage}%` }}
              />
            );
          })}

          {/* Min thumb (or single thumb) */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${minPercentage}%` }}
            animate={{
              scale: isDragging === 'min' ? 1.2 : 1,
            }}
          >
            <motion.div
              className="relative w-6 h-6 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing"
              style={{
                borderColor: gradientColors[0],
                scale: pulseScale,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'min')}
              whileHover={{ scale: 1.1 }}
            >
              {/* Inner dot */}
              <div className="absolute inset-2 rounded-full" style={{ backgroundColor: gradientColors[0] }} />

              {/* Glow ring */}
              {(isDragging === 'min' || isDragging === null && !range) && (
                <motion.div
                  className="absolute -inset-2 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${gradientColors[0]}60, transparent)`,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.div>

            {/* Value tooltip */}
            {showValue && (isDragging === 'min' || isDragging === null && !range) && (
              <motion.div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-text-primary text-white text-sm font-semibold rounded-lg shadow-lg whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {formatValue(minValue)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-primary" />
              </motion.div>
            )}
          </motion.div>

          {/* Max thumb (for range) */}
          {range && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
              style={{ left: `${maxPercentage}%` }}
              animate={{
                scale: isDragging === 'max' ? 1.2 : 1,
              }}
            >
              <motion.div
                className="relative w-6 h-6 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing"
                style={{
                  borderColor: gradientColors[1],
                  scale: pulseScale,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'max')}
                whileHover={{ scale: 1.1 }}
              >
                <div className="absolute inset-2 rounded-full" style={{ backgroundColor: gradientColors[1] }} />

                {isDragging === 'max' && (
                  <motion.div
                    className="absolute -inset-2 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${gradientColors[1]}60, transparent)`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>

              {showValue && isDragging === 'max' && (
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-text-primary text-white text-sm font-semibold rounded-lg shadow-lg whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {formatValue(maxValue)}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-text-primary" />
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Value display */}
        {showValue && !isDragging && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-tertiary">
              {formatValue(min)}
            </span>
            <motion.span
              className="font-bold text-lg bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
              key={range ? `${minValue}-${maxValue}` : minValue}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {range && Array.isArray(value)
                ? `${formatValue(value[0])} - ${formatValue(value[1])}`
                : formatValue(minValue)}
            </motion.span>
            <span className="text-text-tertiary">
              {formatValue(max)}
            </span>
          </div>
        )}
      </div>
    );
  }
);

CreativeSlider.displayName = 'CreativeSlider';
