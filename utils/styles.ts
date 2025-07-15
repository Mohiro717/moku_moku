// Common style utilities
export const GRADIENTS = {
  brandGradient: 'bg-gradient-to-r from-vivid-pink to-vivid-green',
  backgroundGradient: 'bg-gradient-to-br from-ivory/70 via-pastel-blue/50 to-coffee-light/60',
  glowGradientActive: 'bg-gradient-to-br from-vivid-pink/40 to-vivid-green/40 blur-xl scale-110',
  glowGradientInactive: 'bg-gradient-to-br from-vivid-pink/20 to-vivid-green/20 blur-lg scale-105',
  characterBackground: 'bg-gradient-to-br from-vivid-pink/10 to-vivid-green/10'
} as const;

export const ANIMATIONS = {
  fadeInUp: 'opacity-0 animate-fade-in-up',
  bounce: 'animate-bounce',
  bounceSlow: 'animate-bounce-slow',
  pulse: 'animate-pulse'
} as const;

export const SHADOWS = {
  text: 'drop-shadow-2xl',
  textMedium: 'drop-shadow-lg',
  card: 'shadow-lg'
} as const;

export const SPACING = {
  sectionPadding: 'py-20 lg:py-32',
  containerPadding: 'px-4',
  maxWidth: 'max-w-6xl mx-auto'
} as const;

// Utility function to combine class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};