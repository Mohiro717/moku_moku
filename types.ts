export interface NavigationItem {
  id: string;
  label: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  accentColor: string;
}

export interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export interface HeaderProps {
  activeSection: string;
}

export interface ProjectCardProps {
  project: Project;
}