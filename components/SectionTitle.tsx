import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  showLines?: boolean;
  lineLength?: 'short' | 'medium' | 'long';
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ 
  children, 
  className = '', 
  showLines = true,
  lineLength = 'medium'
}) => {
  const getLineClass = () => {
    switch (lineLength) {
      case 'short':
        return 'max-w-16';
      case 'medium':
        return 'max-w-32';
      case 'long':
        return 'max-w-48';
      default:
        return 'max-w-32';
    }
  };

  if (!showLines) {
    return (
      <h2 className={`font-serif font-bold text-coffee-dark ${className.includes('text-') ? className : `text-4xl md:text-5xl ${className}`}`}>
        {children}
      </h2>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`flex-1 h-px bg-coffee-light/30 ${getLineClass()}`}></div>
      <h2 className="font-serif text-4xl md:text-5xl font-bold text-coffee-dark mx-6 md:mx-8 text-center">
        {children}
      </h2>
      <div className={`flex-1 h-px bg-coffee-light/30 ${getLineClass()}`}></div>
    </div>
  );
};