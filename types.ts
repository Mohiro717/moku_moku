export interface NavigationItem {
  id: string;
  label: string;
}

export interface Work {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  image: string;
  color: string;
}

export interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export interface ProjectCardProps {
  work: Work;
  index: number;
}

export interface HeroSectionProps {
  onScrollToNext: () => void;
}

export interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}