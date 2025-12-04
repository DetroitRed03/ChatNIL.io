'use client';

import React, { useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import { MatchScoreBreakdown, type MatchScore } from './MatchScoreBreakdown';
import { motion, AnimatePresence } from 'framer-motion';

export interface AthleteMatch {
  athlete_id: string;
  athlete_name: string;
  sport: string;
  fmv_score: number;
  fmv_tier: string;
  match_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  recommended_offer_low: number; // cents
  recommended_offer_high: number; // cents
  avatar_url?: string;
  state?: string;
  match_breakdown: MatchScore;
  strengths: string[];
  concerns: string[];
  offer_justification?: string;
}

interface MatchDetailModalProps {
  isOpen: boolean;
  athleteMatch: AthleteMatch | null;
  onClose: () => void;
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  } else if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  } else {
    return `$${dollars.toLocaleString()}`;
  }
}

function getTierBadgeVariant(tier: string): 'accent' | 'primary' | 'success' | 'warning' | 'gray' {
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
}

export function MatchDetailModal({ isOpen, athleteMatch, onClose }: MatchDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!athleteMatch) return null;

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
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-border px-6 py-4 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={athleteMatch.avatar_url}
                      alt={athleteMatch.athlete_name}
                      size="lg"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">
                        {athleteMatch.athlete_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-text-secondary">
                          {athleteMatch.sport}
                        </span>
                        {athleteMatch.state && (
                          <>
                            <span className="text-text-tertiary">•</span>
                            <span className="text-sm text-text-secondary">
                              {athleteMatch.state}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getTierBadgeVariant(athleteMatch.fmv_tier)} size="sm">
                          FMV {athleteMatch.fmv_score}
                        </Badge>
                        <Badge variant="primary" size="sm">
                          {athleteMatch.match_score}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-background-hover transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="h-6 w-6 text-text-tertiary" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Match Score Breakdown */}
                <section>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Match Score Breakdown
                  </h3>
                  <MatchScoreBreakdown matchScore={athleteMatch.match_breakdown} />
                </section>

                {/* Strengths */}
                {athleteMatch.strengths && athleteMatch.strengths.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success-500" />
                      Key Strengths
                    </h3>
                    <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {athleteMatch.strengths.map((strength, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-text-primary"
                          >
                            <CheckCircle className="h-4 w-4 text-success-600 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}

                {/* Concerns */}
                {athleteMatch.concerns && athleteMatch.concerns.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning-500" />
                      Considerations
                    </h3>
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {athleteMatch.concerns.map((concern, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-text-primary"
                          >
                            <AlertCircle className="h-4 w-4 text-warning-600 flex-shrink-0 mt-0.5" />
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}

                {/* Recommended Offer */}
                <section>
                  <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary-500" />
                    Recommended Offer
                  </h3>
                  <div className="bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Suggested Range</p>
                        <p className="text-3xl font-bold text-primary-600">
                          {formatCurrency(athleteMatch.recommended_offer_low)} -{' '}
                          {formatCurrency(athleteMatch.recommended_offer_high)}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <TrendingUp className="h-8 w-8 text-primary-500" />
                      </div>
                    </div>
                    {athleteMatch.offer_justification && (
                      <div className="bg-white rounded-lg p-4 mt-4">
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {athleteMatch.offer_justification}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background-secondary border-t border-border px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                  <Button variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="primary">
                    Contact Athlete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
