// Common styling utilities and constants

export const LAYOUT_STYLES = {
  // Container styles
  container: 'max-w-6xl mx-auto px-4',
  section: 'py-20 lg:py-32',
  
  // Grid layouts
  gridTwoCol: 'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center',
  
  // Spacing
  spacingLarge: 'space-y-8',
  spacingMedium: 'space-y-4',
  spacingSmall: 'space-y-2',
  
  // Text alignment
  textCenter: 'text-center',
  textCenterLgLeft: 'text-center lg:text-left',
  
  // Common margins
  marginBottomLarge: 'mb-12',
  marginBottomMedium: 'mb-6',
  marginBottomSmall: 'mb-4'
} as const;

export const TEXT_STYLES = {
  // Headings
  heroTitle: 'text-5xl md:text-6xl',
  sectionTitle: 'text-4xl md:text-5xl',
  
  // Body text
  bodyLarge: 'text-lg text-coffee-dark/80 leading-relaxed',
  bodyMedium: 'text-base text-coffee-dark/80 leading-relaxed',
  
  // Special text
  subtitle: 'text-xl text-coffee-dark/70'
} as const;

export const BACKGROUND_STYLES = {
  ivory: 'bg-ivory',
  pastelBlue: 'bg-pastel-blue',
  coffeeDark: 'bg-coffee-dark',
  transparent: 'bg-transparent'
} as const;