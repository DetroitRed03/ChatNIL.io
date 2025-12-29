'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ArchetypeCard,
  TraitBadgeList,
  TraitRadar,
  TraitBarChart,
} from '@/components/assessment';
import { ARCHETYPES } from '@/lib/assessment/archetypes';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Share2,
  Download,
  RefreshCw,
  MessageSquare,
  Loader2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import type { TraitCode, CoreTrait } from '@/lib/assessment/types';

interface ResultsData {
  results: {
    id: string;
    userId: string;
    traitScores: Record<string, number>;
    topTraits: TraitCode[];
    archetypeCode: string;
    archetypeName: string;
    archetypeDescription: string;
    calculatedAt: string;
  };
  traits: CoreTrait[];
  archetype: {
    id: string;
    code: string;
    name: string;
    description: string;
    definingTraits: Record<string, { min: number }>;
    exampleAthletes: string[];
    aiPersonalityHint: string;
    iconName: string;
    colorHex: string;
  } | null;
}

export default function AssessmentResultsPage() {
  const { user, isLoading: authLoading, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);

  // Handle auth redirects - wait for BOTH auth AND profile to load
  useEffect(() => {
    if (authLoading || isLoadingProfile) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (user.role !== 'athlete') {
      const redirectPath = user.role === 'agency' ? '/agencies/dashboard' : '/dashboard';
      router.replace(redirectPath);
    }
  }, [user, authLoading, isLoadingProfile, router]);

  useEffect(() => {
    if (user && user.role === 'athlete') {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/assessment/results?userId=${user?.id}`);
      const data = await response.json();

      if (!data.results) {
        setError('No assessment results found. Please complete the assessment first.');
        return;
      }

      setResultsData(data);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    router.push('/assessment');
  };

  const handleStartChat = () => {
    router.push('/');
  };

  const handleShare = async () => {
    if (!resultsData) return;

    const shareText = `I just discovered my athlete archetype: ${resultsData.results.archetypeName}! My top traits are ${resultsData.results.topTraits.slice(0, 3).join(', ')}. Find yours on ChatNIL!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Athlete Archetype',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    }
  };

  // Show loading state while auth/profile is loading
  if (authLoading || isLoadingProfile || !user || user.role !== 'athlete' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {authLoading ? 'Authenticating...' : isLoadingProfile ? 'Loading profile...' : 'Loading your results...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !resultsData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <Card variant="elevated" className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Results Found
            </h2>
            <p className="text-gray-600 mb-6">{error || 'Please complete the assessment first.'}</p>
            <Button variant="primary" onClick={() => router.push('/assessment')}>
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { results, traits, archetype } = resultsData;

  // Get archetype data from local constants (has more info like exampleAthletes)
  const archetypeInfo = ARCHETYPES.find(a => a.code === results.archetypeCode) || archetype;

  // Prepare trait data for visualization
  const traitData = Object.entries(results.traitScores)
    .map(([code, score]) => {
      const trait = traits.find(t => t.traitCode === code);
      return {
        trait: code,
        traitName: trait?.traitName || code,
        score: score as number,
        colorHex: trait?.colorHex,
        iconName: trait?.iconName,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Top traits with full info
  const topTraitsData = results.topTraits.slice(0, 5).map((code, index) => {
    const trait = traits.find(t => t.traitCode === code);
    return {
      code,
      name: trait?.traitName || code,
      score: results.traitScores[code],
      iconName: trait?.iconName,
      colorHex: trait?.colorHex,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Your Results</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Your Athlete Brand Identity
          </h1>
          <p className="text-lg text-gray-600">
            Based on your assessment responses
          </p>
        </motion.div>

        {/* Archetype Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ArchetypeCard
            code={results.archetypeCode}
            name={results.archetypeName}
            description={results.archetypeDescription}
            iconName={archetypeInfo?.iconName}
            colorHex={archetypeInfo?.colorHex}
            exampleAthletes={archetypeInfo?.exampleAthletes}
            topTraits={topTraitsData}
            variant="featured"
          />
        </motion.div>

        {/* Trait Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Radar Chart */}
          <Card variant="default">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trait Overview
              </h3>
              {/* Hide radar on mobile, show bar chart instead */}
              <div className="hidden sm:block">
                <TraitRadar
                  data={traitData.slice(0, 8)}
                  size={300}
                  className="mx-auto"
                />
              </div>
              <div className="sm:hidden">
                <TraitBarChart data={traitData.slice(0, 6)} />
              </div>
            </CardContent>
          </Card>

          {/* All Traits Bar Chart */}
          <Card variant="default">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                All Trait Scores
              </h3>
              <TraitBarChart data={traitData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* What This Means */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card variant="default">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What This Means For Your Brand
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary-50 border border-primary-100">
                  <h4 className="font-medium text-primary-900 mb-2">
                    Best Partnership Types
                  </h4>
                  <p className="text-sm text-primary-700">
                    {results.archetypeCode === 'captain' &&
                      'Team-focused brands, leadership programs, motivational speaking'}
                    {results.archetypeCode === 'trailblazer' &&
                      'Innovative startups, tech brands, cause-driven campaigns'}
                    {results.archetypeCode === 'champion' &&
                      'Performance brands, competition sponsors, athletic gear'}
                    {results.archetypeCode === 'ambassador' &&
                      'Nonprofit partnerships, community programs, educational brands'}
                    {results.archetypeCode === 'entertainer' &&
                      'Media brands, entertainment partnerships, lifestyle products'}
                    {results.archetypeCode === 'purist' &&
                      'Sports equipment, training programs, athletic apparel'}
                    {results.archetypeCode === 'connector' &&
                      'Relationship-based brands, team gear, networking platforms'}
                    {results.archetypeCode === 'builder' &&
                      'Business partnerships, equity deals, long-term brand building'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-accent-50 border border-accent-100">
                  <h4 className="font-medium text-accent-900 mb-2">
                    Content Strategy
                  </h4>
                  <p className="text-sm text-accent-700">
                    {results.archetypeCode === 'captain' &&
                      'Focus on team moments, leadership insights, and mentorship content'}
                    {results.archetypeCode === 'trailblazer' &&
                      'Share unique perspectives, behind-the-scenes innovation, boundary-pushing content'}
                    {results.archetypeCode === 'champion' &&
                      'Highlight training routines, competition moments, and winning mindset'}
                    {results.archetypeCode === 'ambassador' &&
                      'Community service content, cause awareness, authentic storytelling'}
                    {results.archetypeCode === 'entertainer' &&
                      'Engaging personality content, creative collaborations, fan interactions'}
                    {results.archetypeCode === 'purist' &&
                      'Training content, skill development, craft-focused storytelling'}
                    {results.archetypeCode === 'connector' &&
                      'Collaborative content, team features, relationship highlights'}
                    {results.archetypeCode === 'builder' &&
                      'Business insights, long-term vision content, entrepreneurial journey'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartChat}
            leftIcon={<MessageSquare className="w-5 h-5" />}
          >
            Chat with NIL AI
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleShare}
            leftIcon={<Share2 className="w-5 h-5" />}
          >
            Share Results
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleRetake}
            leftIcon={<RefreshCw className="w-5 h-5" />}
          >
            Retake Assessment
          </Button>
        </motion.div>

        {/* Timestamp */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          Assessment completed on{' '}
          {new Date(results.calculatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </motion.p>
      </div>
    </div>
  );
}
