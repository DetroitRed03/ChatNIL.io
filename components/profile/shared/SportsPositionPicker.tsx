'use client';

import { useState, useRef, useEffect } from 'react';
import { Trophy, ChevronDown, X } from 'lucide-react';
import { searchSports, getPositionsForSport, type SportName } from '@/lib/sports-data';

export interface SportsPositionPickerProps {
  value: {
    sport: string;
    position?: string;
  };
  onChange: (sport: string, position?: string) => void;
  label?: string;
  error?: string;
  showPositionButton?: boolean;
  onOpenPositionPicker?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * SportsPositionPicker Component
 *
 * Unified sport selection with autocomplete and optional position picker integration.
 * Used across profile editing and onboarding flows.
 *
 * Features:
 * - Autocomplete from SPORTS_DATA
 * - Integrates with PositionPickerModal
 * - Shows selected position
 * - Supports custom sport entry
 *
 * @example
 * ```tsx
 * <SportsPositionPicker
 *   value={{ sport: 'Basketball', position: 'Point Guard' }}
 *   onChange={(sport, position) => console.log(sport, position)}
 *   showPositionButton
 *   onOpenPositionPicker={() => setModalOpen(true)}
 * />
 * ```
 */
export function SportsPositionPicker({
  value,
  onChange,
  label = 'Sport',
  error,
  showPositionButton = true,
  onOpenPositionPicker,
  disabled = false,
  placeholder = 'e.g., Basketball, Football, Soccer'
}: SportsPositionPickerProps) {
  const [sportInput, setSportInput] = useState(value.sport || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SportName[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    setSportInput(value.sport || '');
  }, [value.sport]);

  // Handle sport input change
  const handleSportChange = (input: string) => {
    setSportInput(input);

    if (input.length >= 2) {
      const results = searchSports(input, 6);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Clear position if sport changes
    if (input !== value.sport) {
      onChange(input, undefined);
    }
  };

  // Select a sport from suggestions
  const selectSport = (sport: string) => {
    setSportInput(sport);
    onChange(sport, undefined); // Clear position when sport changes
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          selectSport(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Handle blur - but not if clicking on suggestions
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setFocusedIndex(-1);

      // Update onChange with final value on blur
      if (sportInput !== value.sport) {
        onChange(sportInput, value.position);
      }
    }, 200);
  };

  // Check if selected sport has positions available
  const hasPositions = value.sport && getPositionsForSport(value.sport).length > 0;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Sport Input with Autocomplete */}
        <div className="flex-1 relative">
          <div className="relative">
            <Trophy className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={sportInput}
              onChange={(e) => handleSportChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (sportInput.length >= 2) {
                  const results = searchSports(sportInput, 6);
                  setSuggestions(results);
                  setShowSuggestions(results.length > 0);
                }
              }}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder={placeholder}
              className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              aria-label={label}
              aria-invalid={!!error}
              aria-describedby={error ? `${label}-error` : undefined}
            />

            {/* Clear button */}
            {sportInput && !disabled && (
              <button
                type="button"
                onClick={() => {
                  setSportInput('');
                  onChange('', undefined);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear sport"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
            >
              {suggestions.map((sport, index) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => selectSport(sport)}
                  className={`w-full px-4 py-3 text-left hover:bg-primary-50 focus:bg-primary-50 focus:outline-none transition-colors flex items-center gap-2 ${
                    index === focusedIndex ? 'bg-primary-50' : ''
                  }`}
                  role="option"
                  aria-selected={index === focusedIndex}
                >
                  <Trophy className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900">{sport}</span>
                  {getPositionsForSport(sport).length > 0 && (
                    <span className="ml-auto text-xs text-gray-500">
                      {getPositionsForSport(sport).length} positions
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Position Picker Button */}
        {showPositionButton && hasPositions && onOpenPositionPicker && (
          <button
            type="button"
            onClick={onOpenPositionPicker}
            disabled={disabled || !value.sport}
            className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              disabled || !value.sport
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
            aria-label="Select position"
          >
            <ChevronDown className="h-4 w-4" />
            Position
          </button>
        )}
      </div>

      {/* Selected Position Display */}
      {value.position && (
        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
          <span className="font-medium">Selected Position:</span>
          <span className="text-gray-900">{value.position}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${label}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <span className="font-medium">⚠️</span>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && sportInput && !showSuggestions && getPositionsForSport(sportInput).length === 0 && (
        <p className="text-xs text-gray-500">
          Custom sport - position selection not available
        </p>
      )}
    </div>
  );
}
