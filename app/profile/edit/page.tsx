'use client';

import * as React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  User, Trophy, TrendingUp, Heart, DollarSign, Image as ImageIcon,
  Check, AlertCircle, Loader2
} from 'lucide-react';
import { SportsPositionPicker } from '@/components/profile/reusable/SportsPositionPicker';
import { InterestsSelector } from '@/components/profile/reusable/InterestsSelector';
import { SocialMediaStatsCard } from '@/components/profile/reusable/SocialMediaStatsCard';
import { PortfolioManagementSection } from '@/components/portfolio/PortfolioManagementSection';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { motion, AnimatePresence } from 'framer-motion';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function EditProfilePage() {
  const { user } = useAuth();
  // Cast to any since this page is for athletes and needs to access athlete-specific fields
  const profile = user?.profile as any;
  const [activeTab, setActiveTab] = useState('personal');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [completionScore, setCompletionScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const hasChanges = useRef(false);

  // Personal data
  const [bio, setBio] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [school, setSchool] = useState('');
  const [graduationYear, setGraduationYear] = useState<number | undefined>();
  const [major, setMajor] = useState('');
  const [gpa, setGpa] = useState<number | undefined>();

  // Athletic data
  const [primarySport, setPrimarySport] = useState('');
  const [position, setPosition] = useState('');
  const [division, setDivision] = useState('');

  // Social media data
  const [socialMedia, setSocialMedia] = useState({
    instagram: {} as any,
    tiktok: {} as any,
    twitter: {} as any,
  });

  // Interests data
  const [selectedInterests, setSelectedInterests] = useState<{
    [category: string]: string[];
  }>({
    'Content Creation': [],
    'Lifestyle Interests': [],
    'Causes Care About': [],
    'Brand Affinity': [],
  });

  // Load existing profile data on mount
  useEffect(() => {
    if (profile && !isInitialized.current) {
      isInitialized.current = true;
      setBio(profile.bio || '');
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setSchool(profile.school_name || profile.school || '');
      setGraduationYear(profile.graduation_year);
      setMajor(profile.major || '');
      setGpa(profile.gpa);
      setPrimarySport(profile.primary_sport || profile.sport || '');
      setPosition(profile.position || '');
      setDivision(profile.division || '');
      setCompletionScore(profile.profile_completion_score || 0);
      // Load interests if available
      if (profile.content_creation_interests || profile.lifestyle_interests ||
          profile.causes_care_about || profile.brand_affinity) {
        setSelectedInterests({
          'Content Creation': profile.content_creation_interests || [],
          'Lifestyle Interests': profile.lifestyle_interests || [],
          'Causes Care About': profile.causes_care_about || [],
          'Brand Affinity': profile.brand_affinity || [],
        });
      }
      // Load social media stats if available
      if (profile.social_media_stats && typeof profile.social_media_stats === 'object') {
        setSocialMedia({
          instagram: profile.social_media_stats.instagram || {},
          tiktok: profile.social_media_stats.tiktok || {},
          twitter: profile.social_media_stats.twitter || {},
        });
      }
      setLoading(false);
    } else if (!profile && user) {
      // Still loading profile from auth context
      setLoading(true);
    } else if (!user) {
      setLoading(false);
    }
  }, [profile, user]);

  // Autosave with debounce - actually calls the API
  const autosave = useCallback(async () => {
    if (!user || loading || !hasChanges.current) return;

    setSaveStatus('saving');

    try {
      const response = await fetch('/api/user/update-athlete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          first_name: firstName,
          last_name: lastName,
          school_name: school,
          graduation_year: graduationYear,
          major,
          gpa,
          primary_sport: primarySport,
          position,
          division,
          content_creation_interests: selectedInterests['Content Creation'],
          lifestyle_interests: selectedInterests['Lifestyle Interests'],
          causes_care_about: selectedInterests['Causes Care About'],
          brand_affinity: selectedInterests['Brand Affinity'],
          social_media_stats: {
            instagram: socialMedia.instagram?.handle || socialMedia.instagram?.followers ? socialMedia.instagram : null,
            tiktok: socialMedia.tiktok?.handle || socialMedia.tiktok?.followers ? socialMedia.tiktok : null,
            twitter: socialMedia.twitter?.handle || socialMedia.twitter?.followers ? socialMedia.twitter : null,
          },
        })
      });

      const data = await response.json();

      if (data.success) {
        setSaveStatus('saved');
        hasChanges.current = false;
        if (data.profile_completion) {
          setCompletionScore(data.profile_completion);
        }
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        console.error('Save failed:', data.error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Autosave error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [user, loading, bio, firstName, lastName, school, graduationYear, major, gpa, primarySport, position, division, selectedInterests, socialMedia]);

  // Track changes after initial load
  useEffect(() => {
    if (isInitialized.current && !loading) {
      hasChanges.current = true;
    }
  }, [bio, firstName, lastName, school, graduationYear, major, gpa, primarySport, position, division, selectedInterests, socialMedia, loading]);

  // Debounced autosave effect - only trigger after data changes
  useEffect(() => {
    if (loading || !isInitialized.current || !hasChanges.current) return;

    const timer = setTimeout(() => {
      if (saveStatus === 'idle') {
        autosave();
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [bio, firstName, lastName, school, graduationYear, major, gpa, primarySport, position, division, selectedInterests, socialMedia, loading, autosave, saveStatus]);

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'athletic', label: 'Athletic', icon: Trophy },
    { id: 'social', label: 'Social', icon: TrendingUp },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'nil', label: 'NIL', icon: DollarSign },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Edit Your Profile
          </h1>
          <p className="text-text-secondary">
            Complete your profile to unlock more opportunities and increase your visibility
          </p>
        </div>

        {/* Profile Completion Indicator */}
        <Card className="mb-6 p-6 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">
              Profile Completion
            </h3>
            <Badge variant="primary" size="lg">
              {completionScore}%
            </Badge>
          </div>
          <Progress
            value={completionScore}
            max={100}
            variant="primary"
            size="lg"
            className="mb-3"
          />
          <p className="text-sm text-text-secondary">
            {completionScore < 40 && 'Complete basic info to reach 40% and unlock messaging'}
            {completionScore >= 40 && completionScore < 80 && 'Add more details to reach 80% and appear in premium searches'}
            {completionScore >= 80 && completionScore < 100 && 'Almost there! Complete all fields to maximize your visibility'}
            {completionScore === 100 && 'Perfect! Your profile is complete and optimized'}
          </p>
        </Card>

        {/* Autosave Status */}
        <div className="flex items-center justify-end mb-4 h-6">
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-sm text-text-tertiary"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </motion.div>
            )}
            {saveStatus === 'saved' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-sm text-success-600"
              >
                <Check className="h-4 w-4" />
                <span>Saved</span>
              </motion.div>
            )}
            {saveStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-sm text-error-600"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Error saving</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal">
          {/* Tab List - Scrollable on mobile */}
          <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full">
              {tabs.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Personal Tab */}
          <TabsContent value="personal">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                Personal Information
              </h2>
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell brands and fans about yourself..."
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background-card focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-text-tertiary">
                      Share your story, passions, and what makes you unique
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {bio.length}/500
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput
                    label="First Name *"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                  <FloatingInput
                    label="Last Name *"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>

                {/* School & Graduation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput
                    label="School/University *"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g., UCLA"
                  />
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Graduation Year
                    </label>
                    <select
                      value={graduationYear || ''}
                      onChange={(e) => setGraduationYear(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background-card focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select year</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 4).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Major & GPA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput
                    label="Major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g., Business Administration"
                  />
                  <FloatingInput
                    label="GPA"
                    type="number"
                    value={gpa?.toString() || ''}
                    onChange={(e) => setGpa(parseFloat(e.target.value))}
                    placeholder="e.g., 3.5"
                    min="0"
                    max="4.0"
                    step="0.01"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Athletic Tab */}
          <TabsContent value="athletic">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                Athletic Information
              </h2>
              <div className="space-y-6">
                <SportsPositionPicker
                  selectedSport={primarySport}
                  selectedPosition={position}
                  onSportChange={setPrimarySport}
                  onPositionChange={setPosition}
                  showPositionDefinition
                />

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Division
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background-card focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select division</option>
                    <option value="Division I">Division I</option>
                    <option value="Division II">Division II</option>
                    <option value="Division III">Division III</option>
                    <option value="NAIA">NAIA</option>
                    <option value="JUCO">JUCO</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                Social Media Stats
              </h2>
              <div className="space-y-4">
                <SocialMediaStatsCard
                  platform="instagram"
                  data={socialMedia.instagram}
                  onChange={(data) => setSocialMedia(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, ...data }
                  }))}
                  isEditable
                />
                <SocialMediaStatsCard
                  platform="tiktok"
                  data={socialMedia.tiktok}
                  onChange={(data) => setSocialMedia(prev => ({
                    ...prev,
                    tiktok: { ...prev.tiktok, ...data }
                  }))}
                  isEditable
                />
                <SocialMediaStatsCard
                  platform="twitter"
                  data={socialMedia.twitter}
                  onChange={(data) => setSocialMedia(prev => ({
                    ...prev,
                    twitter: { ...prev.twitter, ...data }
                  }))}
                  isEditable
                />
              </div>
            </Card>
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                Interests & Values
              </h2>
              <InterestsSelector
                selectedInterests={selectedInterests}
                onChange={(category, interests) => {
                  setSelectedInterests(prev => ({
                    ...prev,
                    [category]: interests
                  }));
                }}
                maxPerCategory={10}
              />
            </Card>
          </TabsContent>

          {/* NIL Tab */}
          <TabsContent value="nil">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-6">
                NIL Preferences
              </h2>
              <p className="text-text-secondary">
                NIL preferences form coming soon...
              </p>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            {user?.id && <PortfolioManagementSection userId={user.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
