'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { School, GraduationCap, BookOpen, Award, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  athlete: {
    bio?: string;
    school: string;
    graduationYear?: number;
    major?: string;
    gpa?: number;
    firstName: string;
    lastName: string;
  };
  className?: string;
}

export function AboutSection({ athlete, className }: AboutSectionProps) {
  const personalDetails = [
    {
      icon: School,
      label: 'School',
      value: athlete.school,
      show: true,
    },
    {
      icon: GraduationCap,
      label: 'Class of',
      value: athlete.graduationYear?.toString(),
      show: !!athlete.graduationYear,
    },
    {
      icon: BookOpen,
      label: 'Major',
      value: athlete.major,
      show: !!athlete.major,
    },
    {
      icon: Award,
      label: 'GPA',
      value: athlete.gpa?.toFixed(2),
      show: !!athlete.gpa,
    },
  ].filter(detail => detail.show);

  const getGPAColor = (gpa?: number) => {
    if (!gpa) return 'gray';
    if (gpa >= 3.7) return 'success';
    if (gpa >= 3.0) return 'primary';
    if (gpa >= 2.5) return 'warning';
    return 'gray';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <CardTitle>About {athlete.firstName}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bio */}
          {athlete.bio && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Bio</h4>
              <p className="text-base text-text-secondary leading-relaxed max-w-3xl">
                {athlete.bio}
              </p>
            </div>
          )}

          {/* Personal Details Grid */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Academic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalDetails.map((detail, index) => {
                const Icon = detail.icon;
                return (
                  <motion.div
                    key={detail.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-background-secondary rounded-lg border border-border-light"
                  >
                    <div className="p-2 bg-primary-50 rounded-md">
                      <Icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-tertiary mb-0.5">
                        {detail.label}
                      </p>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {detail.value}
                      </p>
                    </div>
                    {detail.label === 'GPA' && athlete.gpa && (
                      <Badge
                        variant={getGPAColor(athlete.gpa) as any}
                        size="sm"
                      >
                        {athlete.gpa >= 3.7 ? 'Excellent' :
                         athlete.gpa >= 3.0 ? 'Good' :
                         athlete.gpa >= 2.5 ? 'Fair' : 'Average'}
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {!athlete.bio && personalDetails.length === 1 && (
            <div className="text-center py-8">
              <p className="text-sm text-text-tertiary">
                Additional information coming soon
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
