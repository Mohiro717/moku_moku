// Type definitions for Moku Moku House

export interface Work {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  image: string;
  color: string;
}

export interface NavigationItem {
  id: string;
  label: string;
}

export interface MascotConfig {
  name: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
}

export interface SectionStyles {
  readonly [key: string]: string;
}

// Color theme types
export type ColorKey = 'ivory' | 'coffeeDark' | 'coffeeMid' | 'coffeeLight' | 'pastelBlue' | 'vividPink' | 'vividGreen';

// Navigation types
export type NavigationId = 'about' | 'mokopi' | 'works' | 'game';