'use client';

import { motion } from 'framer-motion';
import { User, Edit2, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProfileSummaryCardProps {
  user: {
    fullName: string;
    sport: string;
    school: string;
    avatar?: string;
  };
  profile: {
    identity: any;
    business: any;
    money: any;
    legacy: any;
  };
  discoveryComplete: boolean;
}

export function ProfileSummaryCard({ user, profile, discoveryComplete }: ProfileSummaryCardProps) {
  const identityData = profile.identity?.data || {};

  // Extract key profile attributes
  const sport = identityData.sport?.value || user.sport || 'Not set';
  const position = identityData.position?.value || 'Not set';
  const leadershipStyle = identityData.leadershipStyle?.value || identityData.leadership_style?.value;
  const personalBrand = identityData.personalBrandStatement?.value || identityData.personal_brand_statement?.value;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Your Profile
          </span>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
            <p className="text-sm text-gray-400">{user.school || 'High School Athlete'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">Sport</p>
            <p className="text-sm font-medium text-white">{sport}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-400">Position</p>
            <p className="text-sm font-medium text-white">{position}</p>
          </div>
        </div>

        {/* Discovery Insights */}
        {discoveryComplete && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Trophy className="h-4 w-4 text-yellow-400" />
              Discovery Complete
            </div>

            {leadershipStyle && (
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <p className="text-xs text-blue-400 mb-1">Leadership Style</p>
                <p className="text-sm text-white">{leadershipStyle}</p>
              </div>
            )}

            {personalBrand && (
              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                <p className="text-xs text-purple-400 mb-1">Personal Brand</p>
                <p className="text-sm text-white line-clamp-3">{personalBrand}</p>
              </div>
            )}
          </div>
        )}

        {!discoveryComplete && (
          <div className="bg-gray-700/30 rounded-lg p-3 text-center">
            <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Complete Discovery to unlock your full profile
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
