'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { X, Trophy, Plus } from 'lucide-react';
import { searchSports } from '@/lib/sports-data';

interface SportsTagsInputProps {
  value: string[];
  onChange: (sports: string[]) => void;
  placeholder?: string;
  excludeSports?: string[];
}

export default function SportsTagsInput({
  value,
  onChange,
  placeholder = 'Add a sport...',
  excludeSports = []
}: SportsTagsInputProps) {
  const [sports, setSports] = useState<string[]>(value || []);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Sync internal state with prop changes
  useEffect(() => {
    setSports(value || []);
  }, [value]);

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.length > 1) {
      const searchResults = searchSports(inputValue, 8);
      // Filter out already selected sports and excluded sports
      const filtered = searchResults.filter(
        sport => !sports.includes(sport) && !excludeSports.includes(sport)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, sports, excludeSports]);

  const addSport = (sport: string) => {
    const trimmed = sport.trim();
    if (trimmed && !sports.includes(trimmed) && !excludeSports.includes(trimmed)) {
      const newSports = [...sports, trimmed];
      setSports(newSports);
      onChange(newSports);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeSport = (sport: string) => {
    const newSports = sports.filter(s => s !== sport);
    setSports(newSports);
    onChange(newSports);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        addSport(suggestions[0]); // Add first suggestion
      } else {
        addSport(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && sports.length > 0) {
      removeSport(sports[sports.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Input field with tags */}
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
          {/* Sport chips */}
          {sports.map((sport) => (
            <span
              key={sport}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              <Trophy className="h-3 w-3" />
              {sport}
              <button
                type="button"
                onClick={() => removeSport(sport)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.length > 1) {
                setShowSuggestions(suggestions.length > 0);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={sports.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[200px] outline-none bg-transparent font-medium"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Suggested Sports
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSport(suggestion)}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Trophy className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-sm text-gray-500 flex items-start gap-2">
        <span className="text-blue-500 font-semibold">💡</span>
        <span>Type to search sports, then press Enter or click to add. Press backspace to remove the last sport.</span>
      </p>
    </div>
  );
}
