'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface RankingOption {
  value: string;
  label: string;
}

interface QuestionRankingProps {
  options: RankingOption[];
  value?: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function QuestionRanking({
  options,
  value = [],
  onChange,
  disabled = false,
}: QuestionRankingProps) {
  // Initialize with default order if no value provided
  const [rankedItems, setRankedItems] = React.useState<string[]>(() => {
    if (value.length === options.length) return value;
    return options.map((o) => o.value);
  });

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (value.length === options.length) {
      setRankedItems(value);
    }
  }, [value, options.length]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    if (toIndex < 0 || toIndex >= rankedItems.length) return;

    const newItems = [...rankedItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    setRankedItems(newItems);
    onChange(newItems);
  };

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    moveItem(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getOptionLabel = (itemValue: string) => {
    return options.find((o) => o.value === itemValue)?.label || itemValue;
  };

  return (
    <div className="w-full space-y-3">
      <p className="text-sm text-text-tertiary text-center mb-4">
        Drag and drop or use arrows to rank from most important (1) to least important
      </p>

      <div className="space-y-2">
        {rankedItems.map((itemValue, index) => {
          const isDragging = draggedIndex === index;

          return (
            <div
              key={itemValue}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                'hover:border-primary-300 hover:bg-primary-50/30',
                isDragging
                  ? 'border-primary-500 bg-primary-100 shadow-lg scale-[1.02] opacity-90'
                  : 'border-gray-200 bg-white',
                disabled && 'opacity-50 cursor-not-allowed hover:border-gray-200 hover:bg-white'
              )}
            >
              {/* Drag handle */}
              <div
                className={cn(
                  'cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600',
                  disabled && 'cursor-not-allowed'
                )}
              >
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Rank number */}
              <span
                className={cn(
                  'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold',
                  index === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : index === 1
                    ? 'bg-gray-100 text-gray-600'
                    : index === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-50 text-gray-500'
                )}
              >
                {index + 1}
              </span>

              {/* Option label */}
              <span className="flex-1 text-base text-text-primary">
                {getOptionLabel(itemValue)}
              </span>

              {/* Arrow controls for accessibility */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveItem(index, index - 1)}
                  disabled={disabled || index === 0}
                  className={cn(
                    'p-1 rounded hover:bg-gray-100 transition-colors',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                  aria-label="Move up"
                >
                  <ArrowUp className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, index + 1)}
                  disabled={disabled || index === rankedItems.length - 1}
                  className={cn(
                    'p-1 rounded hover:bg-gray-100 transition-colors',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                  aria-label="Move down"
                >
                  <ArrowDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between text-xs text-text-tertiary pt-2 px-2">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-100" />
          Most important
        </span>
        <span className="flex items-center gap-1">
          Least important
          <span className="w-3 h-3 rounded bg-gray-50" />
        </span>
      </div>
    </div>
  );
}
