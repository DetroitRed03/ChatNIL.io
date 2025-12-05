/**
 * ChatNIL Design System - Modern Athletic Platform
 *
 * A cohesive, modern design system that flows across the entire platform.
 * Inspired by: Stripe, Linear, Vercel - Clean, professional, with athletic energy
 */

export const DESIGN_TOKENS = {
  // Smooth, professional animations
  animations: {
    entrance: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] }
    },
    hover: {
      card: {
        whileHover: { y: -4, transition: { duration: 0.2 } },
        transition: { duration: 0.2 }
      },
      button: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.15 }
      }
    },
    progress: {
      initial: { width: 0 },
      transition: { duration: 1, ease: [0.23, 1, 0.32, 1] }
    },
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.05 }
      }
    },
    item: {
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
    }
  },

  // Modern, clean shadows
  elevation: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    cardHover: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
    float: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    glow: '0 0 0 1px rgba(99, 102, 241, 0.05), 0 8px 16px -4px rgba(99, 102, 241, 0.15)'
  },

  // Consistent spacing
  spacing: {
    section: 'space-y-8',
    cardGrid: 'gap-6',
    contentBlock: 'space-y-4',
    tight: 'space-y-2'
  },

  // Professional typography
  typography: {
    display: 'text-4xl font-bold tracking-tight',
    heading: 'text-2xl font-semibold tracking-tight',
    subheading: 'text-xl font-semibold',
    cardTitle: 'text-lg font-semibold',
    body: 'text-sm text-gray-600 leading-relaxed',
    bodyEmphasis: 'text-sm text-gray-900 font-medium',
    label: 'text-xs font-medium text-gray-500 uppercase tracking-wide',
    value: 'text-2xl font-bold',
    valueLarge: 'text-3xl font-bold'
  },

  // Modern gradients - used sparingly
  gradients: {
    brand: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',           // Indigo to purple
    brandSubtle: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',    // Subtle indigo
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',        // Green
    warm: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',           // Amber
    mesh: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', // Colorful mesh
  },

  // Clean, modern color system
  colors: {
    background: {
      page: '#fafafa',      // Clean neutral
      card: '#ffffff',      // Pure white
      subtle: '#f5f5f5',    // Very light gray
      hover: '#f9fafb',     // Subtle hover
      accent: '#eef2ff'     // Indigo tint
    },
    text: {
      primary: '#0f172a',   // Slate 900
      secondary: '#475569', // Slate 600
      tertiary: '#94a3b8',  // Slate 400
      brand: '#6366f1',     // Indigo 500
    },
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',  // Primary brand color
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    accent: {
      50: '#fef3c7',
      100: '#fde68a',
      200: '#fcd34d',
      300: '#fbbf24',
      400: '#f59e0b',  // Amber accent
      500: '#d97706',
      600: '#b45309',
    }
  },

  // Subtle patterns
  patterns: {
    dots: 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.02) 1px, transparent 1px)',
    grid: 'linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)',
  }
} as const;

// Export type for TypeScript
export type DesignTokens = typeof DESIGN_TOKENS;
