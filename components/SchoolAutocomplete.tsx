'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, GraduationCap, School } from 'lucide-react';

interface SchoolAutocompleteProps {
  value: string;
  onChange: (school: string) => void;
  placeholder?: string;
  includeLevel?: boolean;
  filterByState?: string;
}

// Popular schools data - can be expanded with full database later
const POPULAR_SCHOOLS = [
  // High Schools
  { name: 'IMG Academy', level: 'High School', state: 'FL', type: 'hs' },
  { name: 'Bishop Gorman High School', level: 'High School', state: 'NV', type: 'hs' },
  { name: 'St. John Bosco High School', level: 'High School', state: 'CA', type: 'hs' },
  { name: 'Mater Dei High School', level: 'High School', state: 'CA', type: 'hs' },
  { name: 'De La Salle High School', level: 'High School', state: 'CA', type: 'hs' },

  // Division I Schools
  { name: 'University of Alabama', level: 'NCAA Division I', state: 'AL', type: 'college' },
  { name: 'Ohio State University', level: 'NCAA Division I', state: 'OH', type: 'college' },
  { name: 'University of Georgia', level: 'NCAA Division I', state: 'GA', type: 'college' },
  { name: 'University of Michigan', level: 'NCAA Division I', state: 'MI', type: 'college' },
  { name: 'Clemson University', level: 'NCAA Division I', state: 'SC', type: 'college' },
  { name: 'University of Texas', level: 'NCAA Division I', state: 'TX', type: 'college' },
  { name: 'University of Southern California', level: 'NCAA Division I', state: 'CA', type: 'college' },
  { name: 'Duke University', level: 'NCAA Division I', state: 'NC', type: 'college' },
  { name: 'Stanford University', level: 'NCAA Division I', state: 'CA', type: 'college' },
  { name: 'University of Notre Dame', level: 'NCAA Division I', state: 'IN', type: 'college' },
  { name: 'University of Florida', level: 'NCAA Division I', state: 'FL', type: 'college' },
  { name: 'Louisiana State University', level: 'NCAA Division I', state: 'LA', type: 'college' },
  { name: 'University of Oregon', level: 'NCAA Division I', state: 'OR', type: 'college' },
  { name: 'Penn State University', level: 'NCAA Division I', state: 'PA', type: 'college' },
  { name: 'University of Oklahoma', level: 'NCAA Division I', state: 'OK', type: 'college' },
];

export default function SchoolAutocomplete({
  value,
  onChange,
  placeholder = 'Search for your school...',
  includeLevel = false,
  filterByState
}: SchoolAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [filteredSchools, setFilteredSchools] = useState(POPULAR_SCHOOLS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  useEffect(() => {
    let schools = POPULAR_SCHOOLS;

    // Filter by state if provided
    if (filterByState) {
      schools = schools.filter(school => school.state === filterByState);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      schools = schools.filter(school =>
        school.name.toLowerCase().includes(query) ||
        school.state.toLowerCase().includes(query)
      );
    }

    setFilteredSchools(schools);
  }, [searchQuery, filterByState]);

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

  const handleSelect = (schoolName: string) => {
    setSearchQuery(schoolName);
    onChange(schoolName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredSchools.length > 0 ? (
            <ul className="py-2">
              {filteredSchools.map((school, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSelect(school.name)}
                    className="w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors flex items-start gap-3"
                  >
                    {school.type === 'hs' ? (
                      <School className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {school.name}
                      </div>
                      {includeLevel && (
                        <div className="text-sm text-gray-500">
                          {school.level} • {school.state}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchQuery.trim() ? (
                <>
                  <p className="mb-2">No schools found matching "{searchQuery}"</p>
                  <p className="text-xs">
                    Press Enter to use "{searchQuery}" as your school name
                  </p>
                </>
              ) : (
                'Start typing to search for schools...'
              )}
            </div>
          )}

          {/* Custom school option */}
          {searchQuery.trim() && !filteredSchools.find(s => s.name.toLowerCase() === searchQuery.toLowerCase()) && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleSelect(searchQuery)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <span className="font-medium">Use: </span>
                <span className="text-gray-900">"{searchQuery}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
