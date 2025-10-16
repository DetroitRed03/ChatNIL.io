'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target } from 'lucide-react';
import { searchSports, getPositionsForSport } from '@/lib/sports-data';

interface SportAutocompleteProps {
  sportValue: string;
  positionValue: string;
  onSportChange: (sport: string) => void;
  onPositionChange: (position: string) => void;
  sportError?: string;
  positionError?: string;
  className?: string;
}

export default function SportAutocomplete({
  sportValue,
  positionValue,
  onSportChange,
  onPositionChange,
  sportError,
  positionError,
  className = ''
}: SportAutocompleteProps) {
  const [sportSuggestions, setSportSuggestions] = useState<string[]>([]);
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  // Update positions when sport changes
  useEffect(() => {
    if (sportValue) {
      const positions = getPositionsForSport(sportValue);
      setAvailablePositions(positions);
    } else {
      setAvailablePositions([]);
    }
  }, [sportValue]);

  const handleSportInputChange = (value: string) => {
    onSportChange(value);

    if (value.length > 1) {
      const suggestions = searchSports(value, 6);
      setSportSuggestions(suggestions);
      setShowSportSuggestions(suggestions.length > 0);
    } else {
      setSportSuggestions([]);
      setShowSportSuggestions(false);
    }
  };

  const selectSport = (sport: string) => {
    onSportChange(sport);
    setShowSportSuggestions(false);
    const positions = getPositionsForSport(sport);
    setAvailablePositions(positions);
  };

  const selectPosition = (position: string) => {
    onPositionChange(position);
  };

  return (
    <div className={className}>
      {/* Primary Sport */}
      <div className="relative mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
          Primary Sport
        </label>
        <div className="relative">
          <Trophy className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={sportValue}
            onChange={(e) => handleSportInputChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200 hover:border-orange-300 font-medium ${
              sportError ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="e.g., Basketball, Football, Tennis"
          />
        </div>
        {sportError && (
          <p className="mt-1 text-sm text-red-600">{sportError}</p>
        )}

        {/* Sport suggestions dropdown */}
        {showSportSuggestions && sportSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {sportSuggestions.map((sport, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSport(sport)}
                className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none flex items-center transition-colors"
              >
                <Trophy className="h-4 w-4 text-orange-500 mr-3" />
                <span className="font-medium text-gray-900">{sport}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Position (if sport has positions) */}
      {availablePositions.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
            Position / Role
          </label>

          {/* Position grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {availablePositions.map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => selectPosition(position)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  positionValue === position
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-md'
                    : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {position}
              </button>
            ))}
          </div>

          {/* Custom position input */}
          <div className="relative">
            <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={positionValue}
              onChange={(e) => onPositionChange(e.target.value)}
              className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200 hover:border-orange-300 ${
                positionError ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Or enter custom position"
            />
          </div>
          {positionError && (
            <p className="mt-1 text-sm text-red-600">{positionError}</p>
          )}
        </div>
      )}

      {/* No positions available - allow free text */}
      {availablePositions.length === 0 && sportValue && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
            Position / Role (Optional)
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={positionValue}
              onChange={(e) => onPositionChange(e.target.value)}
              className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200 hover:border-orange-300 ${
                positionError ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter your position or role"
            />
          </div>
          {positionError && (
            <p className="mt-1 text-sm text-red-600">{positionError}</p>
          )}
        </div>
      )}
    </div>
  );
}