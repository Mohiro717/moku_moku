import React from 'react';

interface GameControllerIconProps {
  className?: string;
}

export const GameControllerIcon: React.FC<GameControllerIconProps> = ({ className = "w-8 h-8" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4v1m4-1v1m-4-8a9 9 0 019 9v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1a9 9 0 019-9z" />
  </svg>
);