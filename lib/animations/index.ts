// Core configuration
export {
  type AnimationVersion,
  type VersionConfig,
  VERSION_CONFIGS,
  getVersionConfig,
} from './core/animation-config';

export {
  EASING_CURVES,
  DURATION_SCALE,
  SPRING_CONFIGS,
  STAGGER_TIMING,
  TRANSFORM_DISTANCES,
} from './core/animation-tokens';

// Re-export framer-motion for convenience
export { motion, AnimatePresence, type Variants } from 'framer-motion';
