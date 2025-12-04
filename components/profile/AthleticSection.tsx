'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Target, Award, Shield, Mail, User, Ruler, Weight, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface AthleticSectionProps {
  athlete: {
    primarySport: string;
    position?: string;
    secondarySports?: string[];
    division?: string;
    teamName?: string;
    achievements?: string[];
    coachName?: string;
    coachEmail?: string;
    heightInches?: number;
    weightLbs?: number;
    jerseyNumber?: number;
  };
  viewMode?: 'public' | 'verified-brand' | 'athlete';
  className?: string;
}

export function AthleticSection({
  athlete,
  viewMode = 'public',
  className,
}: AthleticSectionProps) {
  const showCoachInfo = viewMode === 'verified-brand' || viewMode === 'athlete';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={className}
    >
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Trophy className="h-5 w-5 text-accent-600" />
            </div>
            <CardTitle>Athletic Information</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Primary Sport & Position */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
              <Trophy className="h-6 w-6 text-primary-600" />
              <div>
                <p className="text-xs text-primary-700 font-medium">Primary Sport</p>
                <p className="text-lg font-bold text-primary-900">
                  {athlete.primarySport}
                  {athlete.position && ` · ${athlete.position}`}
                </p>
              </div>
            </div>

            {athlete.division && (
              <Badge variant="accent" size="lg">
                <Shield className="h-4 w-4 mr-1" />
                {athlete.division}
              </Badge>
            )}

            {athlete.teamName && (
              <Badge variant="secondary" size="lg">
                {athlete.teamName}
              </Badge>
            )}
          </div>

          {/* Physical Stats */}
          {(athlete.heightInches || athlete.weightLbs || athlete.jerseyNumber !== undefined) && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Physical Stats
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {athlete.heightInches && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Ruler className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-blue-700 font-medium">Height</p>
                    <p className="text-lg font-bold text-blue-900">
                      {Math.floor(athlete.heightInches / 12)}'{athlete.heightInches % 12}"
                    </p>
                    <p className="text-xs text-blue-600">{athlete.heightInches} inches</p>
                  </div>
                )}
                {athlete.weightLbs && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Weight className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-blue-700 font-medium">Weight</p>
                    <p className="text-lg font-bold text-blue-900">
                      {athlete.weightLbs} lbs
                    </p>
                  </div>
                )}
                {athlete.jerseyNumber !== undefined && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Hash className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-blue-700 font-medium">Jersey</p>
                    <p className="text-lg font-bold text-blue-900">
                      #{athlete.jerseyNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Secondary Sports */}
          {athlete.secondarySports && athlete.secondarySports.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-text-tertiary" />
                Secondary Sports
              </h4>
              <div className="flex flex-wrap gap-2">
                {athlete.secondarySports.map((sport) => (
                  <Badge key={sport} variant="gray" size="md">
                    {sport}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {athlete.achievements && athlete.achievements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-text-tertiary" />
                Achievements & Honors
              </h4>
              <div className="space-y-2">
                {athlete.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border',
                      index % 2 === 0 ? 'bg-accent-50 border-accent-200' : 'bg-background-secondary border-border-light'
                    )}
                  >
                    <div className="mt-0.5">
                      <Trophy className={cn(
                        'h-5 w-5',
                        index % 2 === 0 ? 'text-accent-600' : 'text-primary-600'
                      )} />
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed flex-1">
                      {achievement}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Coach Information (Verified Brands Only) */}
          {showCoachInfo && (athlete.coachName || athlete.coachEmail) && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h4 className="text-sm font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Coach Contact
              </h4>
              <div className="space-y-2">
                {athlete.coachName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary-600" />
                    <span className="text-sm text-text-primary font-medium">
                      {athlete.coachName}
                    </span>
                  </div>
                )}
                {athlete.coachEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary-600" />
                    <a
                      href={`mailto:${athlete.coachEmail}`}
                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {athlete.coachEmail}
                    </a>
                  </div>
                )}
              </div>
              <p className="text-xs text-primary-700 mt-3 italic">
                * Coach contact information is only visible to verified brands
              </p>
            </div>
          )}

          {/* Empty State */}
          {!athlete.achievements?.length &&
           !athlete.secondarySports?.length &&
           !athlete.division &&
           !athlete.teamName && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-text-tertiary">
                More athletic details coming soon
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
