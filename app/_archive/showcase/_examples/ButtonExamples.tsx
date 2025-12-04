'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import {
  Send,
  Download,
  Trash2,
  Heart,
  Share2,
  Plus,
  Check,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

export function ButtonExamples() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="w-full space-y-12">
      {/* Primary Buttons */}
      <Section title="Primary Buttons" description="Main call-to-action buttons">
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">
            Primary Button
          </Button>
          <Button variant="primary">
            <Send className="w-4 h-4 mr-2" />
            With Icon
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" onClick={handleLoadingDemo}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Loading State'
            )}
          </Button>
        </div>
      </Section>

      {/* Secondary Buttons */}
      <Section title="Secondary Buttons" description="Alternative actions">
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">
            Secondary Button
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="lg">
            Large
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      {/* Destructive Buttons */}
      <Section title="Destructive Buttons" description="Dangerous or irreversible actions">
        <div className="flex flex-wrap gap-4">
          <Button variant="danger">
            Delete
          </Button>
          <Button variant="danger">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
          <Button variant="danger" size="sm">
            Remove
          </Button>
          <Button variant="danger" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      {/* Success Buttons */}
      <Section title="Success Buttons" description="Confirmation and success actions">
        <div className="flex flex-wrap gap-4">
          <Button variant="success">
            Success
          </Button>
          <Button variant="success">
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button variant="success">
            <Check className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        </div>
      </Section>

      {/* Ghost Buttons */}
      <Section title="Ghost Buttons" description="Subtle, minimal style buttons">
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost">
            Ghost Button
          </Button>
          <Button variant="ghost">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            Small
          </Button>
          <Button variant="ghost" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      {/* Gradient Buttons */}
      <Section title="Gradient Buttons" description="Eye-catching gradient styles">
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Sparkle className="w-4 h-4 mr-2" />
            Gradient Blue
          </Button>
          <Button
            variant="primary"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            Gradient Green
          </Button>
          <Button
            variant="primary"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Gradient Orange
          </Button>
          <Button
            variant="primary"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            Gradient Pink
          </Button>
        </div>
      </Section>

      {/* Icon-Only Buttons */}
      <Section title="Icon Buttons" description="Compact icon-only buttons">
        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isLiked
                ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </Section>

      {/* Button Groups */}
      <Section title="Button Groups" description="Connected button sets">
        <div className="space-y-4">
          <div className="inline-flex rounded-lg border-2 border-gray-200 overflow-hidden">
            <button className="px-4 py-2 bg-primary-500 text-white font-medium">
              Day
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50 border-l border-gray-200">
              Week
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-medium hover:bg-gray-50 border-l border-gray-200">
              Month
            </button>
          </div>

          <div className="inline-flex gap-2">
            <Button variant="secondary">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="primary">
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </div>
        </div>
      </Section>

      {/* Animated Buttons */}
      <Section title="Animated Buttons" description="Buttons with special effects">
        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
            <span className="relative flex items-center gap-2">
              Hover Effect
              <ArrowRight className="w-4 h-4" />
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-xl shadow-lg relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <span className="relative">Shimmer Effect</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg"
          >
            Wiggle on Hover
          </motion.button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
        {children}
      </div>
    </motion.div>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
