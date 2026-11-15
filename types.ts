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
  /** 読み込み画面に出す名前。省けば Moku Moku House */
  title?: string;
}

export interface FortniteCreator {
  id: number;
  name: string;
  fortniteUrl: string;
  category: string;
  description: string;
  color: string;
}