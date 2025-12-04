'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { X, Trophy, Target, Plus } from 'lucide-react';
import { searchSports, getPositionsForSport } from '@/lib/sports-data';

interface SportPosition {
  sport: string;
  position?: string;
}

interface SecondarySportsInputProps {
  value: string[]; // Array of "Sport" or "Sport - Position" strings
  onChange: (sports: string[]) => void;
  placeholder?: string;
  excludeSports?: string[];
}

export default function SecondarySportsInput({
  value,
  onChange,
  placeholder = 'Add a sport...',
  excludeSports = []
}: SecondarySportsInputProps) {
  // Parse the string array into sport+position objects
  const parseValue = (arr: string[]): SportPosition[] => {
    return arr.map(item => {
      const parts = item.split(' - ');
      return {
        sport: parts[0],
        position: parts[1] || undefined
      };
    });
  };

  const [sports, setSports] = useState<SportPosition[]>(parseValue(value));
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPosition, setEditingPosition] = useState('');
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  // Sync internal state with prop changes
  useEffect(() => {
    setSports(parseValue(value));
  }, [value]);

  // Update parent component
  const updateParent = (newSports: SportPosition[]) => {
    const formatted = newSports.map(sp =>
      sp.position ? `${sp.sport} - ${sp.position}` : sp.sport
    );
    onChange(formatted);
  };

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.length > 1) {
      const searchResults = searchSports(inputValue, 8);
      // Filter out already selected sports and excluded sports
      const selectedSports = sports.map(s => s.sport);
      const filtered = searchResults.filter(
        sport => !selectedSports.includes(sport) && !excludeSports.includes(sport)
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
    const selectedSports = sports.map(s => s.sport);

    if (trimmed && !selectedSports.includes(trimmed) && !excludeSports.includes(trimmed)) {
      const newSport: SportPosition = { sport: trimmed };
      const newSports = [...sports, newSport];
      setSports(newSports);
      updateParent(newSports);
      setInputValue('');
      setShowSuggestions(false);

      // Check if this sport has positions and show editor
      const positions = getPositionsForSport(trimmed);
      if (positions.length > 0) {
        setEditingIndex(newSports.length - 1);
        setAvailablePositions(positions);
        setEditingPosition('');
      }
    }
  };

  const removeSport = (index: number) => {
    const newSports = sports.filter((_, i) => i !== index);
    setSports(newSports);
    updateParent(newSports);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const updatePosition = (index: number, position: string) => {
    const newSports = [...sports];
    newSports[index].position = position;
    setSports(newSports);
    updateParent(newSports);
    setEditingPosition(position);
  };

  const finishEditingPosition = () => {
    setEditingIndex(null);
    setEditingPosition('');
    setAvailablePositions([]);
  };

  const startEditingPosition = (index: number) => {
    const sport = sports[index];
    const positions = getPositionsForSport(sport.sport);
    if (positions.length > 0) {
      setEditingIndex(index);
      setAvailablePositions(positions);
      setEditingPosition(sport.position || '');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        addSport(suggestions[0]);
      } else {
        addSport(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && sports.length > 0 && editingIndex === null) {
      removeSport(sports.length - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input field with tags */}
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
          {/* Sport chips */}
          {sports.map((sportPos, index) => (
            <span
              key={`${sportPos.sport}-${index}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => startEditingPosition(index)}
            >
              <Trophy className="h-3 w-3" />
              <span>
                {sportPos.sport}
                {sportPos.position && (
                  <span className="text-blue-600 ml-1">• {sportPos.position}</span>
                )}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSport(index);
                }}
                className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
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

      {/* Position editor */}
      {editingIndex !== null && availablePositions.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Select Position for {sports[editingIndex].sport}
            </h4>
            <button
              type="button"
              onClick={finishEditingPosition}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Done
            </button>
          </div>

          {/* Position grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availablePositions.map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => updatePosition(editingIndex, position)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  sports[editingIndex].position === position
                    ? 'border-blue-600 bg-blue-100 text-blue-900 shadow-sm'
                    : 'border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {position}
              </button>
            ))}
          </div>

          {/* Custom position input */}
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
            <input
              type="text"
              value={editingPosition}
              onChange={(e) => {
                setEditingPosition(e.target.value);
                updatePosition(editingIndex, e.target.value);
              }}
              placeholder="Or enter custom position"
              className="w-full pl-10 pr-4 py-2.5 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
            />
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-sm text-gray-500 flex items-start gap-2">
        <span className="text-blue-500 font-semibold">💡</span>
        <span>Type to search sports, then press Enter or click to add. Click a sport chip to add/edit its position.</span>
      </p>
    </div>
  );
}
