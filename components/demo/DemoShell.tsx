'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoShellProps {
  children: React.ReactNode;
  activeView: 'athlete' | 'agency';
  onViewChange?: (view: 'athlete' | 'agency') => void;
}

export function DemoShell({ children, activeView, onViewChange }: DemoShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-warning-500 to-warning-600 text-white py-2 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">
            Demo Mode - Showcasing FMV Calculator & Matchmaking Engine
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                CN
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">ChatNIL Demo</h1>
                <p className="text-xs text-text-tertiary">AI-Powered NIL Platform</p>
              </div>
            </div>

            {/* Perspective Switcher */}
            <div className="flex items-center gap-2 bg-background rounded-lg p-1 border border-border">
              <button
                onClick={() => onViewChange?.('athlete')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  activeView === 'athlete'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                )}
                aria-pressed={activeView === 'athlete'}
              >
                Athlete View
              </button>
              <button
                onClick={() => onViewChange?.('agency')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  activeView === 'agency'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                )}
                aria-pressed={activeView === 'agency'}
              >
                Agency View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
