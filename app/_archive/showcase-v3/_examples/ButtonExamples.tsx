'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download, Heart, Plus, Send, Star, Sparkles } from 'lucide-react';

export function ButtonExamples() {
  return (
    <div className="w-full max-w-4xl space-y-12">

      {/* Primary Buttons */}
      <Section title="Primary Buttons" description="Gradient emboss with gold shimmer effects">
        <div className="flex flex-wrap gap-4">
          <PremiumButton variant="primary" icon={<Send />}>
            Send Message
          </PremiumButton>
          <PremiumButton variant="primary" icon={<ArrowRight />} iconPosition="right">
            Continue
          </PremiumButton>
          <PremiumButton variant="primary" size="large" icon={<Sparkles />}>
            Premium Feature
          </PremiumButton>
        </div>
      </Section>

      {/* Secondary Buttons */}
      <Section title="Secondary Buttons" description="Elegant outline with neumorphic hover">
        <div className="flex flex-wrap gap-4">
          <SecondaryButton icon={<Download />}>
            Download Report
          </SecondaryButton>
          <SecondaryButton icon={<Star />}>
            Save for Later
          </SecondaryButton>
          <SecondaryButton icon={<Plus />} iconPosition="right">
            Add New
          </SecondaryButton>
        </div>
      </Section>

      {/* Icon Buttons */}
      <Section title="Icon Buttons" description="Pill-shaped with subtle depth">
        <div className="flex flex-wrap gap-4">
          <IconButton icon={<Heart />} variant="primary" />
          <IconButton icon={<Star />} variant="secondary" />
          <IconButton icon={<Download />} variant="ghost" />
          <IconButton icon={<Plus />} variant="accent" size="large" />
        </div>
      </Section>

      {/* Button States */}
      <Section title="Button States" description="Interactive feedback and transitions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StateDemo label="Default" />
          <StateDemo label="Hover" forceHover />
          <StateDemo label="Loading" loading />
        </div>
      </Section>

      {/* Size Variations */}
      <Section title="Size Variations" description="From compact to statement buttons">
        <div className="flex flex-wrap items-center gap-4">
          <PremiumButton variant="primary" size="small">Small</PremiumButton>
          <PremiumButton variant="primary" size="medium">Medium</PremiumButton>
          <PremiumButton variant="primary" size="large">Large</PremiumButton>
        </div>
      </Section>

    </div>
  );
}

// Components

function Section({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#1a1d20] tracking-tight mb-1">{title}</h3>
        <p className="text-[#6c757d]">{description}</p>
      </div>
      <div
        className="bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-2xl border-2 border-[#E8E4DF] p-8"
        style={{
          boxShadow: `
            0 4px 12px -2px rgba(234, 88, 12, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
          `
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PremiumButton({
  children,
  icon,
  iconPosition = 'left',
  size = 'medium',
  variant = 'primary'
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'accent';
}) {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const gradient = variant === 'primary'
    ? 'from-[#ea580c] via-[#c2410c] to-[#92400e]'
    : 'from-[#fcd34d] via-[#f59e0b] to-[#ea580c]';

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      className={`
        relative overflow-hidden rounded-full font-bold
        bg-gradient-to-r ${gradient} text-white
        flex items-center gap-2 group
        ${sizeClasses[size]}
      `}
      style={{
        boxShadow: `
          0 6px 20px -4px rgba(234, 88, 12, 0.4),
          inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2),
          inset 0 1px 2px 0 rgba(255, 255, 255, 0.2)
        `
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && iconPosition === 'left' && (
          <span className="transition-transform group-hover:scale-110">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="transition-transform group-hover:translate-x-1">{icon}</span>
        )}
      </span>
    </motion.button>
  );
}

function SecondaryButton({
  children,
  icon,
  iconPosition = 'left'
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      className="
        relative px-6 py-3 rounded-full font-semibold
        bg-gradient-to-br from-white to-[#FFFBF7]
        border-2 border-[#ea580c]/30
        text-[#ea580c]
        flex items-center gap-2 group
        hover:border-[#ea580c]
        transition-colors
      "
      style={{
        boxShadow: `
          0 2px 8px -2px rgba(234, 88, 12, 0.15),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
        `
      }}
    >
      {icon && iconPosition === 'left' && (
        <span className="transition-transform group-hover:scale-110">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="transition-transform group-hover:translate-x-1">{icon}</span>
      )}
    </motion.button>
  );
}

function IconButton({
  icon,
  variant = 'primary',
  size = 'medium'
}: {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'medium' | 'large';
}) {
  const sizeClasses = size === 'large' ? 'w-14 h-14' : 'w-12 h-12';

  const variantStyles = {
    primary: {
      className: 'bg-gradient-to-br from-[#ea580c] to-[#92400e] text-white',
      shadow: '0 4px 12px -2px rgba(234, 88, 12, 0.4), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)'
    },
    secondary: {
      className: 'bg-gradient-to-br from-white to-[#FFFBF7] border-2 border-[#E8E4DF] text-[#ea580c]',
      shadow: '0 2px 8px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
    },
    ghost: {
      className: 'bg-transparent hover:bg-[#ea580c]/5 text-[#ea580c]',
      shadow: 'none'
    },
    accent: {
      className: 'bg-gradient-to-br from-[#fcd34d] to-[#f59e0b] text-[#92400e]',
      shadow: '0 4px 12px -2px rgba(252, 211, 77, 0.4), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.15)'
    }
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      className={`
        ${sizeClasses} rounded-full flex items-center justify-center
        ${style.className} relative overflow-hidden group
      `}
      style={{ boxShadow: style.shadow }}
    >
      <span className="relative z-10 transition-transform group-hover:scale-110">
        {icon}
      </span>
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.button>
  );
}

function StateDemo({ label, forceHover = false, loading = false }: {
  label: string;
  forceHover?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="text-center space-y-3">
      <p className="text-sm font-medium text-[#6c757d] uppercase tracking-wide">{label}</p>
      <motion.button
        animate={forceHover ? { scale: 1.03, y: -2 } : {}}
        className={`
          px-6 py-3 rounded-full font-bold
          bg-gradient-to-r from-[#ea580c] via-[#c2410c] to-[#92400e]
          text-white flex items-center gap-2 mx-auto
          relative overflow-hidden
          ${loading ? 'opacity-80 cursor-wait' : ''}
        `}
        style={{
          boxShadow: `
            0 6px 20px -4px rgba(234, 88, 12, 0.4),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
          `
        }}
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            <span>Processing...</span>
          </>
        ) : (
          <span>Click Me</span>
        )}
      </motion.button>
    </div>
  );
}
