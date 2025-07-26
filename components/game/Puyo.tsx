import React, { memo } from 'react';
import type { PuyoColor } from '../../types/game';
import { ParticleEffect } from './ParticleEffect';

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
  ojama: 'bg-gray-500 border-gray-600',
  null: 'bg-transparent border-transparent'
};

const PARTICLE_COLORS = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  ojama: '#6b7280',
  null: '#ffffff'
};

const PUYO_EYES = {
  red: '😊',
  blue: '😌',
  green: '😄',
  yellow: '😆',
  ojama: '😈',
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
    ${isConnected ? 'ring-4 ring-yellow-300 shadow-lg scale-110 animate-pulse z-10' : ''}
    ${isDeleting ? 'animate-spin scale-150 opacity-30 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 shadow-2xl' : ''}
    ${isFalling ? 'animate-bounce scale-105' : ''}
  `;

  return (
    <div className={`${baseClasses} ${animationClasses} relative`}>
      <span className="text-xs select-none">
        {PUYO_EYES[color]}
      </span>
      {isDeleting && (
        <ParticleEffect
          isActive={isDeleting}
          color={PARTICLE_COLORS[color]}
          x={16}
          y={16}
          particleCount={12}
        />
      )}
    </div>
  );
});