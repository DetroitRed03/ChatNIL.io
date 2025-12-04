'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Target,
  Zap,
  Flame,
  Trophy,
  Award,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { VersionSwitcher } from '@/components/ui/VersionSwitcher';

// Import all examples
import { AthleteCardExample } from './_examples/AthleteCardExample';
import { DealCardExample } from './_examples/DealCardExample';
import { MetricCardExample } from './_examples/MetricCardExample';
import { OpportunityCardExample } from './_examples/OpportunityCardExample';
import { QuizCardExample } from './_examples/QuizCardExample';
import { BadgeCardExample } from './_examples/BadgeCardExample';
import { ButtonExamples } from './_examples/ButtonExamples';
import { FormExamples } from './_examples/FormExamples';
import { ProfileExamples } from './_examples/ProfileExamples';
import { AgencyExamples } from './_examples/AgencyExamples';
import { AnimationExamples } from './_examples/AnimationExamples';

const categories = [
  { id: 'cards', label: 'Cards', icon: Target },
  { id: 'buttons', label: 'Buttons', icon: Zap },
  { id: 'forms', label: 'Forms', icon: Flame },
  { id: 'profiles', label: 'Profiles', icon: Trophy },
  { id: 'agency', label: 'Agency', icon: Award },
  { id: 'animations', label: 'Animations', icon: TrendingUp },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ShowcaseV4Page() {
  const [activeCategory, setActiveCategory] = useState('cards');

  return (
    <div className="min-h-screen bg-[#FAF6F1]">

      {/* Header with Gradient */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-gray-800 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/showcase-v3">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 border-white/30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  V3 Premium
                </Button>
              </Link>
              <div className="h-8 w-px bg-white/30" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold">
                  ChatNIL Refined
                </h1>
                <p className="text-sm text-orange-100 font-medium">
                  V4 • Refined & Professional
                </p>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="success" className="bg-white text-orange-600 font-semibold">
                Production Ready
              </Badge>
              <Badge variant="secondary" className="bg-orange-400/20 text-white border-white/30 font-semibold">
                50+ Components
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-[105px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Version Switcher */}
        <div className="mb-12">
          <VersionSwitcher />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
          >

            {activeCategory === 'cards' && (
              <ComponentSection
                title="Card Components"
                description="Interactive cards with subtle 3D effects and professional polish"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ComponentDemo title="Athlete Profile Card">
                    <AthleteCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="NIL Deal Card">
                    <DealCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Performance Metrics">
                    <MetricCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Opportunity Card">
                    <OpportunityCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Quiz Card">
                    <QuizCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Achievement Badge">
                    <BadgeCardExample />
                  </ComponentDemo>
                </div>
              </ComponentSection>
            )}

            {activeCategory === 'buttons' && (
              <ComponentSection
                title="Button Components"
                description="Clean, accessible buttons with clear visual hierarchy"
              >
                <ButtonExamples />
              </ComponentSection>
            )}

            {activeCategory === 'forms' && (
              <ComponentSection
                title="Form Components"
                description="Larger, more accessible form inputs with excellent usability"
              >
                <FormExamples />
              </ComponentSection>
            )}

            {activeCategory === 'profiles' && (
              <ComponentSection
                title="Profile Components"
                description="Professional athlete profile layouts with gradient heroes"
              >
                <ProfileExamples />
              </ComponentSection>
            )}

            {activeCategory === 'agency' && (
              <ComponentSection
                title="Agency Components"
                description="Agency discovery and portfolio display components"
              >
                <AgencyExamples />
              </ComponentSection>
            )}

            {activeCategory === 'animations' && (
              <ComponentSection
                title="Animation Showcase"
                description="Subtle, professional animations and micro-interactions"
              >
                <AnimationExamples />
              </ComponentSection>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600 font-medium">
            Built with Next.js 14, Tailwind CSS, and Framer Motion
          </p>
          <p className="text-sm text-orange-600 mt-2 font-semibold">
            ChatNIL Refined Design System v4.0
          </p>
        </div>
      </footer>

    </div>
  );
}

// Helper Components

function ComponentSection({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 text-lg">{description}</p>
        <div className="h-1 w-24 bg-orange-500 rounded-full mt-4" />
      </motion.div>
      {children}
    </div>
  );
}

function ComponentDemo({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      </div>

      {/* Live Preview */}
      <div className="p-8 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center min-h-[300px]">
        {children}
      </div>
    </motion.div>
  );
}
