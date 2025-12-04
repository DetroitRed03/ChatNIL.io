// Animation Tokens - Foundation for all animation values

export const EASING_CURVES = {
  // Version 1: Clean & Modern
  clean: {
    default: [0.4, 0.0, 0.2, 1],        // Material Design standard
    decelerate: [0.0, 0.0, 0.2, 1],     // Ease-out
    accelerate: [0.4, 0.0, 1, 1],       // Ease-in
    sharp: [0.4, 0.0, 0.6, 1],          // Snappy
  },

  // Version 2: Energetic & Bold
  energetic: {
    bounce: [0.68, -0.55, 0.265, 1.55], // Overshoot bounce
    elastic: [0.5, 1.5, 0.5, 1],        // Elastic feel
    punch: [0.6, -0.28, 0.735, 0.045],  // Anticipation + snap
    zippy: [0.35, 0.91, 0.33, 0.97],    // Fast start
  },

  // Version 3: Premium & Sophisticated
  premium: {
    silk: [0.25, 0.46, 0.45, 0.94],     // Smooth luxury
    fluid: [0.23, 1, 0.32, 1],          // Liquid motion
    elegant: [0.77, 0, 0.175, 1],       // Controlled ease
    linger: [0.33, 0, 0.2, 1],          // Gentle deceleration
  },
} as const;

export const DURATION_SCALE = {
  instant: 100,
  fast: 200,
  normal: 300,
  medium: 400,
  slow: 600,
  slower: 800,
  slowest: 1000,
} as const;

export const SPRING_CONFIGS = {
  // Version 1: Subtle springs
  clean: {
    gentle: { type: "spring" as const, stiffness: 300, damping: 30 },
    default: { type: "spring" as const, stiffness: 400, damping: 28 },
    snappy: { type: "spring" as const, stiffness: 500, damping: 25 },
  },

  // Version 2: Bouncy springs
  energetic: {
    bouncy: { type: "spring" as const, stiffness: 500, damping: 15 },
    hyper: { type: "spring" as const, stiffness: 700, damping: 12 },
    wobbly: { type: "spring" as const, stiffness: 300, damping: 8 },
  },

  // Version 3: Slow, smooth springs
  premium: {
    smooth: { type: "spring" as const, stiffness: 200, damping: 35 },
    luxe: { type: "spring" as const, stiffness: 150, damping: 40 },
    silk: { type: "spring" as const, stiffness: 180, damping: 38 },
  },
} as const;

export const STAGGER_TIMING = {
  tight: 0.03,
  normal: 0.05,
  relaxed: 0.08,
  lazy: 0.12,
} as const;

export const TRANSFORM_DISTANCES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
