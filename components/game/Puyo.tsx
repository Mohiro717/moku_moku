import React from 'react';
import type { PuyoColor } from '../../types/game';

interface PuyoProps {
  color: PuyoColor;
  isConnected?: boolean;
  willDelete?: boolean;
  isAnimating?: boolean;
}

const PUYO_COLORS = {
  red: 'bg-red-400 border-red-500',
  blue: 'bg-blue-400 border-blue-500',
  green: 'bg-green-400 border-green-500',
  yellow: 'bg-yellow-400 border-yellow-500',
  null: 'bg-transparent border-transparent'
};

const PUYO_EYES = {
  red: '😊',
  blue: '😌',
  green: '😄',
  yellow: '😆',
  null: ''
};

export const Puyo: React.FC<PuyoProps> = ({ 
  color, 
  isConnected = false, 
  willDelete = false,
  isAnimating = false
}) => {
  if (!color) {
    return <div className="w-8 h-8 sm:w-10 sm:h-10" />;
  }

  const baseClasses = `
    w-8 h-8 sm:w-10 sm:h-10 
    rounded-full 
    border-2 
    flex items-center justify-center
    transition-all duration-300
    ${PUYO_COLORS[color]}
  `;

  const animationClasses = `
    ${isConnected ? 'ring-2 ring-white shadow-lg scale-110' : ''}
    ${willDelete ? 'animate-pulse scale-125' : ''}
    ${isAnimating ? 'animate-bounce' : ''}
  `;

  return (
    <div className={`${baseClasses} ${animationClasses}`}>
      <span className="text-xs select-none">
        {PUYO_EYES[color]}
      </span>
    </div>
  );
};