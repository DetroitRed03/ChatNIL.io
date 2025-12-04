'use client';

import { useState } from 'react';
import { Plus, X, Target } from 'lucide-react';
import { SportsPositionPicker } from './SportsPositionPicker';
import { PositionPickerModal } from './PositionPickerModal';

export interface SecondarySport {
  sport: string;
  position?: string;
}

export interface SecondarySportsManagerProps {
  sports: SecondarySport[];
  onChange: (sports: SecondarySport[]) => void;
  maxSports?: number;
  disabled?: boolean;
}

/**
 * SecondarySportsManager Component
 *
 * Manages multiple secondary sports with position selection.
 * Uses SportsPositionPicker and PositionPickerModal for each sport entry.
 *
 * Features:
 * - Add up to maxSports (default 3) secondary sports
 * - Each sport has independent position picker
 * - Remove individual sports
 * - Disabled state support
 * - Empty state with call-to-action
 *
 * @example
 * ```tsx
 * <SecondarySportsManager
 *   sports={[
 *     { sport: 'Soccer', position: 'Midfielder' },
 *     { sport: 'Tennis', position: 'Singles Player' }
 *   ]}
 *   onChange={(sports) => setSports(sports)}
 *   maxSports={3}
 * />
 * ```
 */
export function SecondarySportsManager({
  sports,
  onChange,
  maxSports = 3,
  disabled = false
}: SecondarySportsManagerProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  // Add a new sport
  const handleAddSport = () => {
    if (sports.length < maxSports) {
      onChange([...sports, { sport: '', position: undefined }]);
    }
  };

  // Remove a sport by index
  const handleRemoveSport = (index: number) => {
    const updated = sports.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Update sport at index
  const handleSportChange = (index: number, sport: string, position?: string) => {
    const updated = sports.map((item, i) =>
      i === index ? { sport, position } : item
    );
    onChange(updated);
  };

  // Open position picker modal for specific index
  const handleOpenPositionPicker = (index: number) => {
    setActiveModalIndex(index);
  };

  // Close position picker modal
  const handleClosePositionPicker = () => {
    setActiveModalIndex(null);
  };

  // Handle position selection from modal
  const handlePositionSelect = (position: string) => {
    if (activeModalIndex !== null) {
      const sport = sports[activeModalIndex];
      handleSportChange(activeModalIndex, sport.sport, position);
    }
  };

  const canAddMore = sports.length < maxSports;
  const slotsRemaining = maxSports - sports.length;

  return (
    <div className="space-y-4">
      {/* Label and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Secondary Sports (Optional)
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Add up to {maxSports} additional sports you play competitively
          </p>
        </div>
        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={handleAddSport}
            className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium hover:bg-primary-200 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Sport
          </button>
        )}
      </div>

      {/* Sports List */}
      {sports.length > 0 ? (
        <div className="space-y-3">
          {sports.map((sport, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              {/* Sport Icon */}
              <div className="pt-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-primary-600" />
                </div>
              </div>

              {/* Sport Picker */}
              <div className="flex-1">
                <SportsPositionPicker
                  value={{ sport: sport.sport, position: sport.position }}
                  onChange={(newSport, position) => handleSportChange(index, newSport, position)}
                  label={`Sport ${index + 1}`}
                  showPositionButton
                  onOpenPositionPicker={() => handleOpenPositionPicker(index)}
                  disabled={disabled}
                  placeholder="e.g., Soccer, Tennis, Track"
                />
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveSport(index)}
                disabled={disabled}
                className={`mt-8 p-2 rounded-lg transition-colors ${
                  disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                aria-label={`Remove ${sport.sport || 'sport'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3">
            <Target className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-3">
            No secondary sports added yet
          </p>
          {canAddMore && !disabled && (
            <button
              type="button"
              onClick={handleAddSport}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Your First Secondary Sport
            </button>
          )}
        </div>
      )}

      {/* Slots Remaining Indicator */}
      {sports.length > 0 && canAddMore && !disabled && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {slotsRemaining} {slotsRemaining === 1 ? 'slot' : 'slots'} remaining
          </span>
          <button
            type="button"
            onClick={handleAddSport}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Add Another Sport
          </button>
        </div>
      )}

      {/* Max Reached Message */}
      {!canAddMore && sports.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Maximum of {maxSports} secondary sports reached
        </p>
      )}

      {/* Position Picker Modal */}
      {activeModalIndex !== null && sports[activeModalIndex] && (
        <PositionPickerModal
          sport={sports[activeModalIndex].sport}
          currentPosition={sports[activeModalIndex].position}
          isOpen={true}
          onClose={handleClosePositionPicker}
          onSelect={handlePositionSelect}
          allowCustom
        />
      )}
    </div>
  );
}
