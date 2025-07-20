import React, { memo } from 'react';
import type { PuyoColor } from '../../types/game';

interface PuyoProps {
  color: PuyoColor;
  isConnected?: boolean;
  willDelete?: boolean;
  isDeleting?: boolean;
  isFalling?: boolean;
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

export const Puyo: React.FC<PuyoProps> = memo(({ 
  color, 
  isConnected = false, 
  isDeleting = false,
  isFalling = false
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
    ${isConnected ? 'ring-4 ring-yellow-300 shadow-lg scale-110 animate-pulse' : ''}
    ${isDeleting ? 'animate-ping scale-125 opacity-75' : ''}
    ${isFalling ? 'animate-bounce' : ''}
  `;

  return (
    <div className={`${baseClasses} ${animationClasses}`}>
      <span className="text-xs select-none">
        {PUYO_EYES[color]}
      </span>
    </div>
  );
});