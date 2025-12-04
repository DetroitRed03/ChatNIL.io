'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Code,
  ArrowLeft,
  Palette,
  Box,
  Type,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
import { VersionSwitcher } from '@/components/ui/VersionSwitcher';

const categories = [
  { id: 'cards', label: 'Cards', icon: Box },
  { id: 'buttons', label: 'Buttons', icon: Palette },
  { id: 'forms', label: 'Forms', icon: Type },
  { id: 'profiles', label: 'Profiles', icon: Sparkles },
  { id: 'agency', label: 'Agency', icon: Layers },
  { id: 'animations', label: 'Animations', icon: Sparkles },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState('cards');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50 to-accent-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/">
                <Button
                  variant="ghost"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </a>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  ChatNIL Component Library
                </h1>
                <p className="text-sm text-secondary-600">
                  V1: Clean & Modern • Interactive Design System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="success">50+ Components</Badge>
              <Badge variant="secondary">Live Examples</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="bg-white/60 backdrop-blur-md border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap",
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg"
                      : "bg-white text-secondary-700 hover:bg-primary-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
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
            transition={{ duration: 0.3 }}
          >

            {activeCategory === 'cards' && (
              <ComponentSection title="Card Components" description="Versatile cards for displaying content">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ComponentDemo title="Athlete Profile Card" description="Agency discovery athlete showcase">
                    <AthleteCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="NIL Deal Card" description="Active deal information display">
                    <DealCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Metric Card" description="Dashboard statistics with trends">
                    <MetricCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Opportunity Card" description="Matched opportunities with scoring">
                    <OpportunityCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Quiz Card" description="Educational content cards">
                    <QuizCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Badge Showcase Card" description="Achievement and rarity display">
                    <BadgeCardExample />
                  </ComponentDemo>
                </div>
              </ComponentSection>
            )}

            {activeCategory === 'buttons' && (
              <ComponentSection title="Button Components" description="Interactive buttons with states">
                <ButtonExamples />
              </ComponentSection>
            )}

            {activeCategory === 'forms' && (
              <ComponentSection title="Form Components" description="Input fields and controls">
                <FormExamples />
              </ComponentSection>
            )}

            {activeCategory === 'profiles' && (
              <ComponentSection title="Profile Components" description="User profile sections">
                <ProfileExamples />
              </ComponentSection>
            )}

            {activeCategory === 'agency' && (
              <ComponentSection title="Agency Components" description="Agency-specific UI elements">
                <AgencyExamples />
              </ComponentSection>
            )}

            {activeCategory === 'animations' && (
              <ComponentSection title="Animation Examples" description="Motion and transitions">
                <AnimationExamples />
              </ComponentSection>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600">
            Built with Next.js 14, Tailwind CSS, and Framer Motion
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ChatNIL Design System v2.0
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
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mt-3" />
      </div>
      {children}
    </div>
  );
}

function ComponentDemo({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
    >

      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            <Code className="w-4 h-4 mr-2" />
            {showCode ? 'Hide' : 'Code'}
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center min-h-[300px]">
        {children}
      </div>

      {/* Code Display */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-slate-900 overflow-hidden"
          >
            <div className="p-6">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{`// Component code will be displayed here
// This is a placeholder for the actual component code`}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
