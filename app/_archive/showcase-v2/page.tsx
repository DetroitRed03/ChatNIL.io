'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Code,
  ArrowLeft,
  Zap,
  Trophy,
  Target,
  Flame,
  Award,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { EASING_CURVES, SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';

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

// Particle background component
function ParticleBackground() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.id % 3 === 0
              ? 'rgba(249, 115, 22, 0.6)'
              : particle.id % 3 === 1
              ? 'rgba(251, 191, 36, 0.6)'
              : 'rgba(234, 88, 12, 0.6)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function ShowcaseV2Page() {
  const [activeCategory, setActiveCategory] = useState('cards');

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950 text-white relative overflow-hidden">

      {/* Particle Background */}
      <ParticleBackground />

      {/* Glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="bg-secondary-900/80 backdrop-blur-xl border-b border-primary-500/30 sticky top-0 z-50 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/showcase">
                <Button
                  variant="ghost"
                  className="hover:bg-primary-500/20 hover:text-primary-400 border-primary-500/50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  V1 Clean
                </Button>
              </Link>
              <div className="h-8 w-px bg-primary-500/30" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={SPRING_CONFIGS.energetic.bouncy}
              >
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 via-primary-500 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                  ChatNIL ENERGETIC
                </h1>
                <p className="text-sm text-primary-300 font-bold tracking-wide">
                  V2.0 • BOLD & POWERFUL
                </p>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant="success"
                  className="bg-accent-500 text-secondary-900 font-bold shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                >
                  50+ Components
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-primary-500/20 text-primary-300 border-primary-500/50 font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                >
                  Live Demo
                </Badge>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="bg-secondary-900/60 backdrop-blur-md border-b border-primary-500/20 sticky top-[89px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-3 py-4 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-extrabold transition-all whitespace-nowrap relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-accent-500 text-secondary-900 shadow-[0_0_25px_rgba(249,115,22,0.6)]"
                      : "bg-secondary-800/50 text-gray-300 hover:bg-secondary-700/70 border border-primary-500/30 hover:border-primary-500/50"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_CONFIGS.energetic.bouncy}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-400/30 to-accent-400/30"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10", isActive && "drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]")} />
                  <span className="relative z-10">{category.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{
              ...SPRING_CONFIGS.energetic.hyper,
            }}
          >

            {activeCategory === 'cards' && (
              <ComponentSection title="CARD COMPONENTS" description="HIGH-ENERGY CONTENT DISPLAYS">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ComponentDemo title="Athlete Profile Card" description="ELITE ATHLETE SHOWCASE">
                    <AthleteCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="NIL Deal Card" description="ACTIVE PARTNERSHIP DISPLAY">
                    <DealCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Metric Card" description="PERFORMANCE STATISTICS">
                    <MetricCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Opportunity Card" description="MATCHED OPPORTUNITIES">
                    <OpportunityCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Quiz Card" description="GAMIFIED LEARNING">
                    <QuizCardExample />
                  </ComponentDemo>

                  <ComponentDemo title="Badge Showcase" description="TROPHY ACHIEVEMENTS">
                    <BadgeCardExample />
                  </ComponentDemo>
                </div>
              </ComponentSection>
            )}

            {activeCategory === 'buttons' && (
              <ComponentSection title="BUTTON COMPONENTS" description="POWERFUL INTERACTIVE CONTROLS">
                <ButtonExamples />
              </ComponentSection>
            )}

            {activeCategory === 'forms' && (
              <ComponentSection title="FORM COMPONENTS" description="FUTURISTIC INPUT FIELDS">
                <FormExamples />
              </ComponentSection>
            )}

            {activeCategory === 'profiles' && (
              <ComponentSection title="PROFILE COMPONENTS" description="ATHLETIC PROFILE DISPLAYS">
                <ProfileExamples />
              </ComponentSection>
            )}

            {activeCategory === 'agency' && (
              <ComponentSection title="AGENCY COMPONENTS" description="TEAM ROSTER INTERFACES">
                <AgencyExamples />
              </ComponentSection>
            )}

            {activeCategory === 'animations' && (
              <ComponentSection title="ANIMATION SHOWCASE" description="MOTION & POWER EFFECTS">
                <AnimationExamples />
              </ComponentSection>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-900/80 border-t border-primary-500/30 mt-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <motion.p
            className="text-gray-400 font-bold"
            whileHover={{ scale: 1.05 }}
          >
            Built with Next.js 14, Tailwind CSS, and Framer Motion
          </motion.p>
          <p className="text-sm text-primary-400 mt-2 font-extrabold tracking-wider">
            ChatNIL ENERGETIC DESIGN SYSTEM v2.0
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
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={SPRING_CONFIGS.energetic.bouncy}
      >
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
          {title}
        </h2>
        <p className="text-primary-300 font-bold tracking-wider">{description}</p>
        <motion.div
          className="h-2 w-32 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-full mt-4"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 100%',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)',
          }}
        />
      </motion.div>
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={SPRING_CONFIGS.energetic.bouncy}
      className="bg-secondary-800/40 backdrop-blur-lg rounded-3xl border-2 border-primary-500/30 overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.2)] hover:shadow-[0_0_60px_rgba(249,115,22,0.4)] transition-all"
    >

      {/* Header */}
      <div className="border-b border-primary-500/30 px-6 py-4 bg-gradient-to-r from-secondary-900/80 to-secondary-800/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xl text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">{title}</h3>
            <p className="text-sm text-primary-400 mt-0.5 font-bold tracking-wide">{description}</p>
          </div>
          <motion.button
            onClick={() => setShowCode(!showCode)}
            className="px-4 py-2 rounded-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 font-bold border border-primary-500/50 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Code className="w-4 h-4" />
            {showCode ? 'Hide' : 'Code'}
          </motion.button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="p-8 bg-gradient-to-br from-secondary-900/50 to-secondary-800/50 flex items-center justify-center min-h-[300px]">
        {children}
      </div>

      {/* Code Display */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING_CONFIGS.energetic.hyper}
            className="border-t border-primary-500/30 bg-secondary-950/90 overflow-hidden"
          >
            <div className="p-6">
              <pre className="text-sm text-primary-300 overflow-x-auto font-mono">
                <code>{`// Component code - Energetic & Bold Design
// Using orange #f97316 with glow effects
// Framer Motion animations with bounce & pulse`}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
