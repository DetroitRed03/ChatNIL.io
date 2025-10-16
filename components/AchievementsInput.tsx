'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { X, Trophy, Plus } from 'lucide-react';

interface AchievementsInputProps {
  value: string[];
  onChange: (achievements: string[]) => void;
  placeholder?: string;
}

const COMMON_ACHIEVEMENTS = [
  'All-Conference',
  'All-State',
  'All-American',
  'Team Captain',
  'MVP',
  'State Champion',
  'Regional Champion',
  'National Champion',
  'Record Holder',
  'Rookie of the Year',
  'Player of the Year',
  'Academic All-American',
  'Conference POY',
  'Tournament MVP'
];

export default function AchievementsInput({
  value,
  onChange,
  placeholder = 'Add an achievement...'
}: AchievementsInputProps) {
  const [achievements, setAchievements] = useState<string[]>(value || []);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync internal state with prop changes (important for edit mode)
  useEffect(() => {
    setAchievements(value || []);
  }, [value]);

  const addAchievement = (achievement: string) => {
    const trimmed = achievement.trim();
    if (trimmed && !achievements.includes(trimmed)) {
      const newAchievements = [...achievements, trimmed];
      setAchievements(newAchievements);
      onChange(newAchievements);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeAchievement = (achievement: string) => {
    const newAchievements = achievements.filter(a => a !== achievement);
    setAchievements(newAchievements);
    onChange(newAchievements);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAchievement(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && achievements.length > 0) {
      removeAchievement(achievements[achievements.length - 1]);
    }
  };

  const filteredSuggestions = COMMON_ACHIEVEMENTS.filter(
    suggestion =>
      !achievements.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Input field with tags */}
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
          {/* Achievement chips */}
          {achievements.map((achievement) => (
            <span
              key={achievement}
              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
            >
              <Trophy className="h-3 w-3" />
              {achievement}
              <button
                type="button"
                onClick={() => removeAchievement(achievement)}
                className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={achievements.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[200px] outline-none bg-transparent"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                Common Achievements
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addAchievement(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-sm text-gray-500">
        Type and press Enter to add achievements. Click suggestions below to quick-add.
      </p>

      {/* Quick add buttons for popular achievements */}
      {achievements.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {COMMON_ACHIEVEMENTS.slice(0, 6).map((achievement) => (
            <button
              key={achievement}
              type="button"
              onClick={() => addAchievement(achievement)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              + {achievement}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
