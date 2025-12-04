'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VersionSwitcher } from '@/components/ui/VersionSwitcher';
import {
  Code,
  ArrowLeft,
  Palette,
  Box,
  Type,
  Award,
  Layers,
  Sparkles
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

const categories = [
  { id: 'cards', label: 'Cards', icon: Box },
  { id: 'buttons', label: 'Buttons', icon: Palette },
  { id: 'forms', label: 'Forms', icon: Type },
  { id: 'profiles', label: 'Profiles', icon: Award },
  { id: 'agency', label: 'Agency', icon: Layers },
  { id: 'animations', label: 'Animations', icon: Sparkles },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ShowcaseV3Page() {
  const [activeCategory, setActiveCategory] = useState('cards');

  return (
    <div className="min-h-screen bg-[#FAF6F1] relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header */}
      <header className="relative bg-gradient-to-br from-[#FFF8F0]/95 via-[#FFFBF7]/90 to-[#FAF6F1]/95 backdrop-blur-xl border-b-2 border-[#E8E4DF] sticky top-0 z-50">
        {/* Embossed effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <a href="/">
                <Button variant="ghost" className="group">
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
              </a>
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#D6D1CC] to-transparent" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] bg-clip-text text-transparent">
                  ChatNIL Premium Collection
                </h1>
                <p className="text-sm text-[#6c757d] mt-1 tracking-wide">
                  Version 3.0 • Sophisticated & Elegant Design System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="primary" className="bg-gradient-to-r from-[#ea580c] to-[#92400e] text-white shadow-lg">
                Premium Edition
              </Badge>
              <Badge variant="secondary" className="bg-[#fcd34d] text-[#92400e] shadow-md">
                Live Examples
              </Badge>
            </div>
          </div>

          {/* Version Switcher */}
          <VersionSwitcher />
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="relative bg-gradient-to-r from-[#FFFBF7]/80 via-[#FFF8F0]/80 to-[#FFFBF7]/80 backdrop-blur-lg border-b border-[#E8E4DF] sticky top-[185px] z-40">
        {/* Inner shadow for depth */}
        <div className="absolute inset-0 shadow-inner-premium pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex gap-3 py-4 overflow-x-auto no-scrollbar">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap tracking-wide",
                    "relative overflow-hidden",
                    isActive
                      ? "text-white shadow-lg"
                      : "bg-white/60 text-[#495057] hover:bg-white shadow-sm hover:shadow-md border border-[#E8E4DF]"
                  )}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #92400e 100%)',
                  } : {}}
                >
                  {/* Shimmer effect on active */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}

                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{category.label}</span>

                  {/* Embossed border */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full shadow-inner opacity-30" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94] // Premium silk easing
            }}
          >

            {activeCategory === 'cards' && (
              <ComponentSection
                title="Card Components"
                description="Exquisite cards with neumorphic depth and premium materials"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ComponentDemo
                    title="Athlete Profile Card"
                    description="Business card styling with embossed elegance"
                  >
                    <AthleteCardExample />
                  </ComponentDemo>

                  <ComponentDemo
                    title="NIL Deal Card"
                    description="Invoice aesthetic with sophisticated details"
                  >
                    <DealCardExample />
                  </ComponentDemo>

                  <ComponentDemo
                    title="Metric Card"
                    description="Luxury dashboard with raised surfaces"
                  >
                    <MetricCardExample />
                  </ComponentDemo>

                  <ComponentDemo
                    title="Opportunity Card"
                    description="Premium opportunities with wax seal styling"
                  >
                    <OpportunityCardExample />
                  </ComponentDemo>

                  <ComponentDemo
                    title="Quiz Card"
                    description="Sophisticated interface with paper texture"
                  >
                    <QuizCardExample />
                  </ComponentDemo>

                  <ComponentDemo
                    title="Badge Showcase Card"
                    description="Gold foil effects with luxury materials"
                  >
                    <BadgeCardExample />
                  </ComponentDemo>
                </div>
              </ComponentSection>
            )}

            {activeCategory === 'buttons' && (
              <ComponentSection
                title="Button Components"
                description="Pill-shaped buttons with gradient emboss and shimmer"
              >
                <ButtonExamples />
              </ComponentSection>
            )}

            {activeCategory === 'forms' && (
              <ComponentSection
                title="Form Components"
                description="Embossed paper texture with elegant focus states"
              >
                <FormExamples />
              </ComponentSection>
            )}

            {activeCategory === 'profiles' && (
              <ComponentSection
                title="Profile Components"
                description="Executive layouts with professional polish"
              >
                <ProfileExamples />
              </ComponentSection>
            )}

            {activeCategory === 'agency' && (
              <ComponentSection
                title="Agency Components"
                description="High-end agency cards with luxury branding"
              >
                <AgencyExamples />
              </ComponentSection>
            )}

            {activeCategory === 'animations' && (
              <ComponentSection
                title="Animation Examples"
                description="Parallax depth and liquid morphing transitions"
              >
                <AnimationExamples />
              </ComponentSection>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-[#FFFBF7] to-[#FFF8F0] border-t-2 border-[#E8E4DF] mt-20">
        {/* Embossed line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-12 text-center relative">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-[#495057]">
              <Award className="w-5 h-5 text-[#ea580c]" />
              <p className="font-medium tracking-wide">
                Crafted with Premium Materials
              </p>
            </div>
            <p className="text-sm text-[#6c757d] tracking-wide">
              Built with Next.js 14, Tailwind CSS, Framer Motion & Animation Tokens
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-[#adb5bd]">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#D6D1CC] to-transparent" />
              <span>ChatNIL Premium Design System v3.0</span>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#D6D1CC] to-transparent" />
            </div>
          </div>
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
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[#6c757d] max-w-2xl mx-auto tracking-wide"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-1 bg-gradient-to-r from-[#fcd34d] via-[#ea580c] to-[#92400e] rounded-full mx-auto"
        />
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
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-3xl border-2 border-[#E8E4DF] overflow-hidden relative group"
      style={{
        boxShadow: `
          0 4px 6px -1px rgba(234, 88, 12, 0.05),
          0 2px 4px -1px rgba(234, 88, 12, 0.03),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
        `
      }}
    >

      {/* Header */}
      <div className="border-b-2 border-[#E8E4DF] px-6 py-5 bg-gradient-to-br from-[#FFFBF7] via-white to-[#FFF8F0] relative">
        {/* Embossed top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        <div className="flex items-center justify-between relative">
          <div>
            <h3 className="font-bold text-[#1a1d20] tracking-wide">{title}</h3>
            <p className="text-sm text-[#6c757d] mt-1 tracking-wide">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="hover:bg-[#ea580c]/5"
          >
            <Code className="w-4 h-4 mr-2" />
            {showCode ? 'Hide' : 'Code'}
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <div
        className="p-10 bg-gradient-to-br from-[#FAF6F1] via-[#FFF8F0] to-[#FAF6F1] flex items-center justify-center min-h-[320px] relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ea580c' fill-opacity='0.01' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {children}
      </div>

      {/* Code Display */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="border-t-2 border-[#E8E4DF] bg-[#1a1d20] overflow-hidden"
          >
            <div className="p-6">
              <pre className="text-sm text-[#adb5bd] overflow-x-auto font-mono">
                <code>{`// Premium Component Code
// Built with neumorphic design principles
// Using animation tokens from core system`}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
