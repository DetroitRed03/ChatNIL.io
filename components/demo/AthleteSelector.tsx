'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface Athlete {
  id: string;
  name: string;
  sport: string;
  school?: string;
  fmv_score?: number;
  fmv_tier?: string;
  avatar_url?: string;
}

interface AthleteSelectorProps {
  onSelect: (athleteId: string) => void;
  selectedAthleteId?: string;
}

export function AthleteSelector({ onSelect, selectedAthleteId }: AthleteSelectorProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch athletes
  useEffect(() => {
    async function fetchAthletes() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/demo/fmv/athletes');
        if (response.ok) {
          const data = await response.json();
          setAthletes(data.athletes || []);
          setFilteredAthletes(data.athletes || []);
        }
      } catch (error) {
        console.error('Failed to fetch athletes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAthletes();
  }, []);

  // Set selected athlete from prop
  useEffect(() => {
    if (selectedAthleteId && athletes.length > 0) {
      const athlete = athletes.find(a => a.id === selectedAthleteId);
      if (athlete) {
        setSelectedAthlete(athlete);
      }
    }
  }, [selectedAthleteId, athletes]);

  // Filter athletes by search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAthletes(athletes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAthletes(
        athletes.filter(
          athlete =>
            athlete.name.toLowerCase().includes(query) ||
            athlete.sport.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, athletes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsOpen(false);
    setSearchQuery('');
    onSelect(athlete.id);
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'elite':
        return 'text-accent-600';
      case 'high':
        return 'text-primary-600';
      case 'medium':
        return 'text-success-600';
      case 'developing':
        return 'text-warning-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTierBadgeVariant = (tier?: string): 'accent' | 'primary' | 'success' | 'warning' | 'gray' => {
    switch (tier) {
      case 'elite':
        return 'accent';
      case 'high':
        return 'primary';
      case 'medium':
        return 'success';
      case 'developing':
        return 'warning';
      default:
        return 'gray';
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-border rounded-lg px-4 py-3 flex items-center justify-between hover:border-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {selectedAthlete ? (
            <>
              <Avatar
                src={selectedAthlete.avatar_url}
                alt={selectedAthlete.name}
                size="sm"
              />
              <div className="text-left">
                <p className="font-medium text-text-primary">{selectedAthlete.name}</p>
                <p className="text-sm text-text-secondary">{selectedAthlete.sport}</p>
              </div>
              {selectedAthlete.fmv_score !== undefined && (
                <Badge variant={getTierBadgeVariant(selectedAthlete.fmv_tier)} size="sm">
                  FMV {selectedAthlete.fmv_score}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-text-secondary">Select an athlete...</span>
          )}
        </div>
        <ChevronDown className={cn('h-5 w-5 text-text-tertiary transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-lg shadow-lg overflow-hidden animate-slide-down">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by name or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          {/* Athletes List */}
          <div className="max-h-80 overflow-y-auto" role="listbox">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : filteredAthletes.length === 0 ? (
              <div className="py-8 px-4 text-center text-text-secondary">
                <p>No athletes found</p>
              </div>
            ) : (
              filteredAthletes.map((athlete) => (
                <button
                  key={athlete.id}
                  onClick={() => handleSelectAthlete(athlete)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-background-hover transition-colors text-left"
                  role="option"
                  aria-selected={selectedAthlete?.id === athlete.id}
                >
                  <Avatar
                    src={athlete.avatar_url}
                    alt={athlete.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{athlete.name}</p>
                    <p className="text-sm text-text-secondary">{athlete.sport}</p>
                  </div>
                  {athlete.fmv_score !== undefined && (
                    <Badge variant={getTierBadgeVariant(athlete.fmv_tier)} size="sm">
                      {athlete.fmv_score}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
