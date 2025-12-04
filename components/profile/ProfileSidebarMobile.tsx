'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet, useBottomSheet } from './mobile/BottomSheet';
import {
  MessageCircle, Download, Share2, DollarSign, Star,
  CheckCircle, ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSidebarMobileProps {
  athlete: {
    firstName: string;
    fmvScore?: number;
    fmvTier?: string;
  };
}

export function ProfileSidebarMobile({ athlete }: ProfileSidebarMobileProps) {
  const { isOpen, open, close } = useBottomSheet();

  return (
    <>
      {/* Sticky CTA Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <Button
          variant="primary"
          className="w-full shadow-2xl"
          onClick={open}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Contact {athlete.firstName}
          <ChevronUp className="h-5 w-5 ml-auto" />
        </Button>
      </motion.div>

      {/* Bottom Sheet with Sidebar Content */}
      <BottomSheet
        isOpen={isOpen}
        onClose={close}
        title="Quick Actions"
        snapPoints={[60, 90]}
        defaultSnapPoint={0}
      >
        <div className="space-y-6 pb-20">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">
              Actions
            </h3>
            <Button variant="primary" className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Partnership Discussion
            </Button>
            <Button variant="secondary" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Media Kit
            </Button>
            <Button variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          </div>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 bg-success-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-success-700">
                  Available for partnerships
                </span>
              </div>
              <p className="text-xs text-text-tertiary">
                Typical response time: 24-48 hours
              </p>
            </CardContent>
          </Card>

          {/* FMV Breakdown */}
          <Card className="bg-gradient-to-br from-accent-50 to-primary-50 border-accent-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent-600" />
                <CardTitle className="text-lg">Fair Market Value</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-text-primary mb-1">
                  ${athlete.fmvScore ? (athlete.fmvScore / 1000).toFixed(1) : '0'}K
                </div>
                {athlete.fmvTier && (
                  <>
                    <Badge variant="accent" className="mb-2">
                      <Star className="h-3 w-3 mr-1" />
                      {athlete.fmvTier} Tier
                    </Badge>
                    <p className="text-xs text-text-tertiary">
                      Top 15% of athletes in tier
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Social Score</span>
                  <span className="font-semibold text-text-primary">85%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Engagement Score</span>
                  <span className="font-semibold text-text-primary">92%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Athletic Performance</span>
                  <span className="font-semibold text-text-primary">78%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-accent-200">
                <div className="flex items-center gap-2 text-xs text-accent-800">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified metrics</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BottomSheet>
    </>
  );
}
