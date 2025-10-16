'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface NILGoalsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const COMMON_NIL_GOALS = [
  'Build Personal Brand',
  'Generate Income',
  'Gain Marketing Experience',
  'Network with Professionals',
  'Prepare for Professional Career',
  'Support Family Financially',
  'Fund Education',
  'Invest in Future',
  'Grow Social Media Presence',
  'Learn Business Skills',
  'Create Content',
  'Partner with Local Businesses'
];

export default function NILGoalsInput({
  value = [],
  onChange,
  placeholder = 'Add a NIL goal...'
}: NILGoalsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddGoal = (goal: string) => {
    const trimmedGoal = goal.trim();
    if (trimmedGoal && !value.includes(trimmedGoal)) {
      onChange([...value, trimmedGoal]);
      setInputValue('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    onChange(value.filter(goal => goal !== goalToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGoal(inputValue);
    }
  };

  const handleQuickAdd = (goal: string) => {
    if (!value.includes(goal)) {
      onChange([...value, goal]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200 hover:border-orange-300 font-medium"
        />
        <button
          type="button"
          onClick={() => handleAddGoal(inputValue)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Goals as Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((goal, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium"
            >
              <span>{goal}</span>
              <button
                type="button"
                onClick={() => handleRemoveGoal(goal)}
                className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Common Goals Quick-Add Buttons */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Common NIL Goals (click to add):</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_NIL_GOALS.filter(goal => !value.includes(goal)).map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => handleQuickAdd(goal)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors"
            >
              + {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Type and press Enter to add goals. Click suggestions below to quick-add.
      </p>
    </div>
  );
}
