'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SearchResult {
  id: string;
  type: 'athlete' | 'deal' | 'action' | 'report';
  title: string;
  subtitle?: string;
  status?: 'green' | 'yellow' | 'red';
  icon?: string;
}

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  recentSearches?: string[];
}

export function SearchCommand({
  isOpen,
  onClose,
  onSearch,
  onSelect,
  recentSearches = []
}: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
        setSelectedIndex(0);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [query, onSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex]);
          handleClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  }, [results, selectedIndex, onSelect]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    onClose();
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'athlete':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'deal':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'action':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'report':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status?: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      data-testid="search-command"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Search Panel */}
      <div className="relative w-full max-w-2xl mx-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search athletes, deals, or actions..."
              className="flex-grow text-lg text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            {/* No query - show recent or suggestions */}
            {!query && (
              <div className="px-4 py-3">
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Recent Searches
                    </p>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Critical Items', query: 'severity:critical' },
                      { label: 'Unassigned', query: 'assignee:none' },
                      { label: 'Overdue', query: 'due:overdue' },
                      { label: 'This Week', query: 'due:this-week' }
                    ].map(action => (
                      <button
                        key={action.query}
                        onClick={() => setQuery(action.query)}
                        className="px-3 py-2 text-sm text-left text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Has query but no results */}
            {query && !isLoading && results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500">No results found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}

            {/* Results list */}
            {results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      onSelect(result);
                      handleClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selectedIndex === index ? 'bg-orange-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedIndex === index ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className={`font-medium truncate ${
                        selectedIndex === index ? 'text-orange-900' : 'text-gray-900'
                      }`}>
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    {result.status && (
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(result.status)}`} />
                    )}
                    {selectedIndex === index && (
                      <span className="text-xs text-gray-400">
                        Enter ↵
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↓</kbd>
                <span className="ml-1">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↵</kbd>
                <span className="ml-1">to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">K</kbd>
              <span className="ml-1">to open</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
