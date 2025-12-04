import { EASING_CURVES, DURATION_SCALE, SPRING_CONFIGS } from './animation-tokens';

export type AnimationVersion = 'v1-clean' | 'v2-energetic' | 'v3-premium';

export interface VersionConfig {
  id: AnimationVersion;
  name: string;
  defaultDuration: number;
  defaultEasing: readonly number[];
  defaultSpring: any;
  useGPUAcceleration: boolean;
  enableParticles: boolean;
  enableGlow: boolean;
  enableParallax: boolean;
  performanceProfile: 'light' | 'medium' | 'heavy';
}

export const VERSION_CONFIGS: Record<AnimationVersion, VersionConfig> = {
  'v1-clean': {
    id: 'v1-clean',
    name: 'Clean & Modern',
    defaultDuration: DURATION_SCALE.fast,
    defaultEasing: EASING_CURVES.clean.default,
    defaultSpring: SPRING_CONFIGS.clean.default,
    useGPUAcceleration: true,
    enableParticles: false,
    enableGlow: false,
    enableParallax: false,
    performanceProfile: 'light',
  },

  'v2-energetic': {
    id: 'v2-energetic',
    name: 'Energetic & Bold',
    defaultDuration: DURATION_SCALE.normal,
    defaultEasing: EASING_CURVES.energetic.bounce,
    defaultSpring: SPRING_CONFIGS.energetic.bouncy,
    useGPUAcceleration: true,
    enableParticles: true,
    enableGlow: true,
    enableParallax: false,
    performanceProfile: 'medium',
  },

  'v3-premium': {
    id: 'v3-premium',
    name: 'Premium & Sophisticated',
    defaultDuration: DURATION_SCALE.slow,
    defaultEasing: EASING_CURVES.premium.silk,
    defaultSpring: SPRING_CONFIGS.premium.smooth,
    useGPUAcceleration: true,
    enableParticles: false,
    enableGlow: false,
    enableParallax: true,
    performanceProfile: 'heavy',
  },
};

export const getVersionConfig = (version: AnimationVersion): VersionConfig => {
  return VERSION_CONFIGS[version];
};
