'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// Sport-specific positions mapping
const SPORTS_POSITIONS: Record<string, string[]> = {
  Football: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS'],
  Basketball: ['PG', 'SG', 'SF', 'PF', 'C'],
  Baseball: ['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'],
  Softball: ['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DP'],
  Soccer: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'],
  'Track & Field': ['Sprints', 'Middle Distance', 'Long Distance', 'Hurdles', 'Jumps', 'Throws', 'Multi'],
  'Cross Country': ['Distance Runner'],
  Volleyball: ['S', 'OH', 'MB', 'OPP', 'L', 'DS'],
  Tennis: ['Singles', 'Doubles'],
  Golf: ['Player'],
  Swimming: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'],
  Wrestling: ['Various Weight Classes'],
  Gymnastics: ['All-Around', 'Vault', 'Bars', 'Beam', 'Floor'],
  'Ice Hockey': ['C', 'LW', 'RW', 'D', 'G'],
  Lacrosse: ['Attack', 'Midfield', 'Defense', 'Goalie'],
  'Field Hockey': ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
  Rowing: ['Rower', 'Coxswain'],
  Fencing: ['Foil', 'Épée', 'Sabre'],
  Other: ['Athlete'],
};

const POPULAR_SPORTS = [
  'Football', 'Basketball', 'Baseball', 'Softball', 'Soccer',
  'Track & Field', 'Volleyball', 'Swimming'
];

// Position abbreviation definitions
const POSITION_DEFINITIONS: Record<string, string> = {
  // Football
  QB: 'Quarterback', RB: 'Running Back', WR: 'Wide Receiver', TE: 'Tight End',
  OL: 'Offensive Line', DL: 'Defensive Line', LB: 'Linebacker', DB: 'Defensive Back',
  K: 'Kicker', PUNT: 'Punter', LS: 'Long Snapper',
  // Basketball
  PG: 'Point Guard', SG: 'Shooting Guard', SF: 'Small Forward',
  PF: 'Power Forward', CTR: 'Center',
  // Baseball/Softball
  P: 'Pitcher', C: 'Catcher', '1B': 'First Base', '2B': 'Second Base',
  '3B': 'Third Base', SS: 'Shortstop', OF: 'Outfield', DH: 'Designated Hitter', DP: 'Designated Player',
  // Soccer
  GK: 'Goalkeeper', CB: 'Center Back', LBK: 'Left Back', RBK: 'Right Back',
  CDM: 'Central Defensive Midfielder', CM: 'Central Midfielder', CAM: 'Central Attacking Midfielder',
  LW: 'Left Winger', RW: 'Right Winger', ST: 'Striker',
  // Volleyball
  S: 'Setter', OH: 'Outside Hitter', MB: 'Middle Blocker',
  OPP: 'Opposite', L: 'Libero', DS: 'Defensive Specialist',
  // Ice Hockey
  G: 'Goalie', D: 'Defense',
};

interface SportsPositionPickerProps {
  selectedSport?: string;
  selectedPosition?: string;
  onSportChange: (sport: string) => void;
  onPositionChange: (position: string) => void;
  error?: string;
  disabled?: boolean;
  showPositionDefinition?: boolean;
}

export function SportsPositionPicker({
  selectedSport,
  selectedPosition,
  onSportChange,
  onPositionChange,
  error,
  disabled = false,
  showPositionDefinition = true,
}: SportsPositionPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSports = Object.keys(SPORTS_POSITIONS);
  const filteredSports = React.useMemo(() => {
    if (!searchQuery) return allSports;
    return allSports.filter(sport =>
      sport.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allSports]);

  const handleSportSelect = (sport: string) => {
    onSportChange(sport);
    setIsOpen(false);
    setSearchQuery('');
    // Reset position when sport changes
    onPositionChange('');
  };

  const availablePositions = selectedSport ? SPORTS_POSITIONS[selectedSport] || [] : [];
  const positionDefinition = selectedPosition && POSITION_DEFINITIONS[selectedPosition];

  return (
    <div className="space-y-4">
      {/* Sport Selector */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Primary Sport *
        </label>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error
              ? 'border-error-500 bg-error-50'
              : 'border-border bg-background-card hover:border-border-secondary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-text-tertiary" />
            <span className={selectedSport ? 'text-text-primary' : 'text-text-tertiary'}>
              {selectedSport || 'Select your sport'}
            </span>
          </div>
          <ChevronDown className={cn(
            'h-5 w-5 text-text-tertiary transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-background-card border border-border rounded-lg shadow-xl max-h-96 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-border">
              <input
                type="text"
                placeholder="Search sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            {/* Popular Sports */}
            {!searchQuery && (
              <div className="p-3 border-b border-border">
                <div className="text-xs font-medium text-text-tertiary mb-2">Popular Sports</div>
                <div className="space-y-1">
                  {POPULAR_SPORTS.map(sport => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportSelect(sport)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md transition-colors',
                        selectedSport === sport
                          ? 'bg-primary-100 text-primary-800 font-medium'
                          : 'hover:bg-background-hover text-text-primary'
                      )}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Sports */}
            <div className="p-3 max-h-64 overflow-y-auto">
              <div className="text-xs font-medium text-text-tertiary mb-2">
                {searchQuery ? 'Search Results' : 'All Sports'}
              </div>
              <div className="space-y-1">
                {filteredSports.length > 0 ? (
                  filteredSports.map(sport => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportSelect(sport)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md transition-colors',
                        selectedSport === sport
                          ? 'bg-primary-100 text-primary-800 font-medium'
                          : 'hover:bg-background-hover text-text-primary'
                      )}
                    >
                      {sport}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center text-text-tertiary">
                    No sports found. Try "Other" for custom sports.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>

      {/* Position Selector */}
      {selectedSport && availablePositions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Position {selectedSport !== 'Other' && '*'}
          </label>
          <div className="flex flex-wrap gap-2">
            {availablePositions.map(position => (
              <button
                key={position}
                type="button"
                onClick={() => onPositionChange(position)}
                disabled={disabled}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  selectedPosition === position
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {position}
              </button>
            ))}
          </div>

          {/* Position Definition */}
          {showPositionDefinition && positionDefinition && (
            <div className="mt-3 p-3 bg-accent-50 rounded-lg border border-accent-200">
              <p className="text-sm text-accent-900">
                <span className="font-semibold">{selectedPosition}:</span> {positionDefinition}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Badge Display */}
      {selectedSport && selectedPosition && (
        <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <Trophy className="h-5 w-5 text-primary-600" />
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="lg">
              {selectedSport}
            </Badge>
            <span className="text-text-tertiary">·</span>
            <Badge variant="accent" size="lg">
              {selectedPosition}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
