'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

export function AthleteCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16" variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" variant="text" />
            <Skeleton className="h-4 w-1/2" variant="text" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Skeleton className="h-4 w-20" variant="text" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Followers */}
        <div className="flex justify-center pt-2 border-t border-border">
          <Skeleton className="h-3 w-24" variant="text" />
        </div>
      </div>
    </Card>
  );
}

export function CampaignCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Icon and Name */}
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" variant="text" />
            <Skeleton className="h-4 w-1/2" variant="text" />
          </div>
        </div>

        {/* Budget */}
        <div className="pt-2 border-t border-border">
          <Skeleton className="h-4 w-24" variant="text" />
        </div>

        {/* Sports Tags */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" variant="text" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}
