'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Check } from 'lucide-react';
import { getPositionsForSport } from '@/lib/sports-data';

export interface PositionPickerModalProps {
  sport: string;
  currentPosition?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (position: string) => void;
  allowCustom?: boolean;
}

/**
 * PositionPickerModal Component
 *
 * Modal popup with sport-specific position grid selection.
 * Integrated with SportsPositionPicker for seamless UX.
 *
 * Features:
 * - Grid layout of positions from getPositionsForSport()
 * - Visual selection indicator
 * - Custom position input fallback
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Accessibility compliant (ARIA labels, focus management)
 *
 * @example
 * ```tsx
 * <PositionPickerModal
 *   sport="Basketball"
 *   currentPosition="Point Guard"
 *   isOpen={modalOpen}
 *   onClose={() => setModalOpen(false)}
 *   onSelect={(pos) => setPosition(pos)}
 *   allowCustom
 * />
 * ```
 */
export function PositionPickerModal({
  sport,
  currentPosition,
  isOpen,
  onClose,
  onSelect,
  allowCustom = true
}: PositionPickerModalProps) {
  const [selectedPosition, setSelectedPosition] = useState(currentPosition || '');
  const [customPosition, setCustomPosition] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const positions = getPositionsForSport(sport);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPosition(currentPosition || '');
      setCustomPosition('');
      setIsCustomMode(false);
    }
  }, [isOpen, currentPosition]);

  // Handle position selection
  const handlePositionClick = (position: string) => {
    setSelectedPosition(position);
    setIsCustomMode(false);
    setCustomPosition('');
  };

  // Handle confirm
  const handleConfirm = () => {
    const finalPosition = isCustomMode && customPosition
      ? customPosition
      : selectedPosition;

    if (finalPosition) {
      onSelect(finalPosition);
      onClose();
    }
  };

  // Handle custom position input
  const handleCustomInput = (value: string) => {
    setCustomPosition(value);
    if (value) {
      setIsCustomMode(true);
      setSelectedPosition('');
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (selectedPosition || (isCustomMode && customPosition))) {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedPosition, customPosition, isCustomMode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="position-picker-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h2 id="position-picker-title" className="text-xl font-bold text-gray-900">
                      Select Position
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Choose your position for {sport}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
                {positions.length > 0 ? (
                  <>
                    {/* Position Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      {positions.map((position) => {
                        const isSelected = !isCustomMode && selectedPosition === position;
                        return (
                          <button
                            key={position}
                            type="button"
                            onClick={() => handlePositionClick(position)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50 shadow-md'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                                {position}
                              </span>
                              {isSelected && (
                                <div className="flex-shrink-0 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No predefined positions for {sport}</p>
                  </div>
                )}

                {/* Custom Position Input */}
                {allowCustom && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter a custom position:
                    </label>
                    <input
                      type="text"
                      value={customPosition}
                      onChange={(e) => handleCustomInput(e.target.value)}
                      placeholder="e.g., Utility Player, Specialist"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        isCustomMode && customPosition
                          ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50'
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    />
                    {isCustomMode && customPosition && (
                      <p className="mt-2 text-sm text-primary-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Using custom position: "{customPosition}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedPosition && !(isCustomMode && customPosition)}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    selectedPosition || (isCustomMode && customPosition)
                      ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Position
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
