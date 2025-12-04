'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Avatar,
  Badge,
  Card,
  CreativeSlider,
  NumberStepper,
  ToggleGroup,
} from '@/components/ui';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { GradientInput } from '@/components/ui/GradientInput';
import { NeumorphicButton } from '@/components/ui/NeumorphicButton';
import { TiltCard } from '@/components/ui/TiltCard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  Mail,
  User,
  Phone,
  CreditCard,
  Search,
  Sparkles,
  Rocket,
  Zap,
  Heart,
  Star,
  TrendingUp,
  ArrowRight,
  Instagram,
  Send,
  CheckCircle,
  Award,
  Target,
  Trophy,
  Flame,
  DollarSign,
  Users,
} from 'lucide-react';

export default function DesignSystemV2Page() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // New creative component states
  const [budgetRange, setBudgetRange] = useState<[number, number]>([10000, 50000]);
  const [dealValue, setDealValue] = useState(25000);
  const [followers, setFollowers] = useState(50000);
  const [viewMode, setViewMode] = useState('grid');

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      setEmailSuccess(false);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email');
      setEmailSuccess(false);
    } else {
      setEmailError('');
      setEmailSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 space-y-32">
        {/* Hero Section with Parallax */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="text-center space-y-8 py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-full backdrop-blur-sm mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Design System V2 - Reimagined
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-7xl md:text-8xl font-extrabold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent bg-[length:200%_100%]">
              Beyond
            </span>
            <br />
            <span className="text-text-primary">The Ordinary</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Experience UI components that break conventions.
            <br />
            Glass morphism. Neumorphism. Micro-interactions. Pure creativity.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <NeumorphicButton
              variant="glow"
              size="lg"
              rightIcon={<Rocket className="h-5 w-5" />}
            >
              Explore Components
            </NeumorphicButton>
            <NeumorphicButton
              variant="raised"
              size="lg"
              leftIcon={<Zap className="h-5 w-5" />}
            >
              View Code
            </NeumorphicButton>
          </motion.div>
        </motion.section>

        {/* Creative Input Showcase */}
        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Reimagined Input Fields
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Not your average text boxes. These inputs have personality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Floating Label Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="flat" className="p-8 space-y-6 bg-background-card/50 backdrop-blur-sm">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary-500" />
                    Floating Labels with Glass Morphism
                  </h3>
                  <p className="text-text-tertiary">Labels float on focus with smooth animations</p>
                </div>
                <div className="space-y-4">
                  <FloatingInput
                    label="Full Name"
                    icon={<User className="h-5 w-5" />}
                    placeholder="Enter your name"
                  />
                  <FloatingInput
                    label="Email Address"
                    type="email"
                    icon={<Mail className="h-5 w-5" />}
                    placeholder="you@example.com"
                  />
                  <FloatingInput
                    label="Phone Number"
                    type="tel"
                    icon={<Phone className="h-5 w-5" />}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Gradient Inputs */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card variant="flat" className="p-8 space-y-6 bg-background-card/50 backdrop-blur-sm">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <Flame className="h-6 w-6 text-accent-500" />
                    Animated Gradient Borders
                  </h3>
                  <p className="text-text-tertiary">Living borders that react to your focus</p>
                </div>
                <div className="space-y-4">
                  <GradientInput
                    label="Search Athletes"
                    icon={<Search className="h-5 w-5" />}
                    placeholder="Start typing..."
                  />
                  <GradientInput
                    label="Email Validation"
                    type="email"
                    icon={<Mail className="h-5 w-5" />}
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    error={emailError}
                    success={emailSuccess}
                  />
                  <GradientInput
                    label="Card Number"
                    icon={<CreditCard className="h-5 w-5" />}
                    placeholder="1234 5678 9012 3456"
                    success
                  />
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Button Variations */}
        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Buttons with Soul
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Every button tells a story. Neumorphism meets modern gradients.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Raised Neumorphic',
                desc: 'Soft 3D elevation effect',
                variant: 'raised' as const,
                icon: <Trophy className="h-5 w-5" />,
              },
              {
                title: 'Pressed State',
                desc: 'Inset shadow design',
                variant: 'pressed' as const,
                icon: <Target className="h-5 w-5" />,
              },
              {
                title: 'Flat Gradient',
                desc: 'Modern gradient design',
                variant: 'flat' as const,
                icon: <Star className="h-5 w-5" />,
              },
              {
                title: 'Animated Glow',
                desc: 'Pulsing gradient effect',
                variant: 'glow' as const,
                icon: <Zap className="h-5 w-5" />,
              },
              {
                title: 'Outlined',
                desc: 'Minimal border style',
                variant: 'outline' as const,
                icon: <CheckCircle className="h-5 w-5" />,
              },
            ].map((button, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="p-6 space-y-4 hover:shadow-2xl transition-shadow duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{button.title}</h3>
                    <p className="text-sm text-text-tertiary">{button.desc}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <NeumorphicButton variant={button.variant} size="md" leftIcon={button.icon}>
                      Click Me
                    </NeumorphicButton>
                    <NeumorphicButton variant={button.variant} size="sm">
                      Small Size
                    </NeumorphicButton>
                    <NeumorphicButton variant={button.variant} size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                      Large Size
                    </NeumorphicButton>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3D Tilt Cards */}
        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Interactive 3D Cards
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Move your mouse over these cards and feel the magic. They respond to your every move.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Athlete Card */}
            <TiltCard className="group">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar size="xl" fallback="Sarah Martinez" />
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-background-card">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Sarah Martinez</h3>
                    <p className="text-sm text-text-tertiary">Division I Basketball</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="primary" leftIcon={<Star className="h-3 w-3" />}>
                    4.9 Rating
                  </Badge>
                  <Badge variant="success" leftIcon={<TrendingUp className="h-3 w-3" />}>
                    Top 5%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div>
                    <p className="text-2xl font-bold text-text-primary">{formatNumber(250000)}</p>
                    <p className="text-xs text-text-tertiary">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{formatCurrency(25000)}</p>
                    <p className="text-xs text-text-tertiary">FMV</p>
                  </div>
                </div>
                <NeumorphicButton variant="flat" size="md" leftIcon={<Heart className="h-4 w-4" />}>
                  Connect
                </NeumorphicButton>
              </div>
            </TiltCard>

            {/* Deal Card */}
            <TiltCard className="group">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    N
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Nike Campaign</h3>
                    <p className="text-sm text-text-tertiary">Brand Partnership</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
                  <p className="text-3xl font-bold text-primary-700">{formatCurrency(50000)}</p>
                  <p className="text-sm text-text-tertiary mt-1">Campaign Value</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">Match Score</span>
                  <span className="font-bold text-success-600">94%</span>
                </div>
                <NeumorphicButton variant="glow" size="md" rightIcon={<Send className="h-4 w-4" />}>
                  Apply Now
                </NeumorphicButton>
              </div>
            </TiltCard>

            {/* Stats Card */}
            <TiltCard className="group">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">Performance</h3>
                  <Badge variant="success" leftIcon={<TrendingUp className="h-3 w-3" />}>
                    +32%
                  </Badge>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Engagement', value: '12.5%', color: 'primary' },
                    { label: 'Reach', value: '2.4M', color: 'accent' },
                    { label: 'Conversions', value: '1,234', color: 'success' },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-text-tertiary">{stat.label}</span>
                      <span className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span className="text-sm text-text-secondary">Instagram Analytics</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* Creative Interactive Controls */}
        <section className="space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Interactive Value Selectors
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Forget boring dropdowns. Slide, spin, and interact with your values.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Range Slider */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-primary-500" />
                    Budget Range Slider
                  </h3>
                  <p className="text-text-tertiary">Dual-thumb slider with snap points and animated gradients</p>
                </div>
                <CreativeSlider
                  label="NIL Deal Budget"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={budgetRange}
                  onChange={(val) => setBudgetRange(val as [number, number])}
                  formatValue={(val) => formatCurrency(val)}
                  range
                  snapPoints={[5000, 10000, 25000, 50000, 75000]}
                  showValue
                />
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="text-sm text-primary-700">
                    <strong>Selected Range:</strong> {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    Try dragging the thumbs! They snap to common values.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Single Value Slider */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <Users className="h-6 w-6 text-accent-500" />
                    Follower Count Selector
                  </h3>
                  <p className="text-text-tertiary">Single slider with smooth animations</p>
                </div>
                <CreativeSlider
                  label="Minimum Followers"
                  min={0}
                  max={1000000}
                  step={5000}
                  value={followers}
                  onChange={(val) => setFollowers(val as number)}
                  formatValue={(val) => formatNumber(val)}
                  showValue
                />
                <div className="p-4 bg-accent-50 rounded-lg border border-accent-200">
                  <p className="text-sm text-accent-700">
                    <strong>Current Value:</strong> {formatNumber(followers)} followers
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Circular Number Stepper */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <Target className="h-6 w-6 text-success-500" />
                    Circular Number Control
                  </h3>
                  <p className="text-text-tertiary">iPod-style circular progress with increment buttons</p>
                </div>
                <div className="flex justify-center">
                  <NumberStepper
                    label="Deal Value"
                    value={dealValue}
                    onChange={setDealValue}
                    min={500}
                    max={100000}
                    step={500}
                    unit="currency"
                    variant="circular"
                  />
                </div>
                <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                  <p className="text-sm text-success-700">
                    <strong>Selected:</strong> {formatCurrency(dealValue)}
                  </p>
                  <p className="text-xs text-success-600 mt-1">
                    Hold the +/- buttons to increment faster!
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Toggle Group */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary-500" />
                    Segmented Control
                  </h3>
                  <p className="text-text-tertiary">Sliding indicator that morphs between options</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-text-tertiary mb-2">Default Style:</p>
                    <ToggleGroup
                      options={[
                        { value: 'grid', label: 'Grid' },
                        { value: 'list', label: 'List' },
                        { value: 'kanban', label: 'Kanban' },
                      ]}
                      value={viewMode}
                      onChange={setViewMode}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-tertiary mb-2">Pills Style:</p>
                    <ToggleGroup
                      options={[
                        { value: 'all', label: 'All' },
                        { value: 'active', label: 'Active' },
                        { value: 'completed', label: 'Completed' },
                      ]}
                      value="active"
                      onChange={() => {}}
                      variant="pills"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-tertiary mb-2">Buttons Style:</p>
                    <ToggleGroup
                      options={[
                        { value: 'athletes', label: 'Athletes' },
                        { value: 'brands', label: 'Brands' },
                        { value: 'deals', label: 'Deals' },
                      ]}
                      value="athletes"
                      onChange={() => {}}
                      variant="buttons"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-20 space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary">
            Ready to build something{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              extraordinary
            </span>
            ?
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <NeumorphicButton variant="glow" size="lg" rightIcon={<Rocket className="h-5 w-5" />}>
              Get Started
            </NeumorphicButton>
            <NeumorphicButton variant="outline" size="lg" leftIcon={<Award className="h-5 w-5" />}>
              View Documentation
            </NeumorphicButton>
          </div>
          <div className="flex items-center justify-center gap-3 pt-8">
            <Badge variant="primary">Creative</Badge>
            <Badge variant="accent">Innovative</Badge>
            <Badge variant="success">Production Ready</Badge>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
