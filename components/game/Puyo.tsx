import React, { memo } from 'react';
import type { PuyoColor } from '../../types/game';
import { ParticleEffect } from './ParticleEffect';
import { GAME_TIMINGS } from '../../constants/gameTimings';
import './puyoAnimations.css';

interface PuyoProps {
  color: PuyoColor;
  isConnected?: boolean;
  isDeleting?: boolean;
  /** true のとき、fallRows マス上から落ちてきて着地でつぶれる（マウント時に1回） */
  landed?: boolean;
  fallRows?: number;
}

export const PUYO_COLORS = {
  red: 'bg-red-400 border-red-500',
  blue: 'bg-blue-400 border-blue-500',
  green: 'bg-green-400 border-green-500',
  yellow: 'bg-yellow-400 border-yellow-500',
  ojama: 'bg-gray-500 border-gray-600',
  null: 'bg-transparent border-transparent'
};

/** つながりの橋の色（枠線なしで玉の色に合わせる） */
export const BRIDGE_COLORS: Record<string, string> = {
  red: 'bg-red-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400'
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

/** 落ちる距離に応じた落下時間（ms）。遠いほど少し長いが、連鎖のテンポを崩さないよう上限あり */
export const dropDuration = (rows: number): number => (rows > 0 ? Math.min(GAME_TIMINGS.drop, 100 + rows * 20) : 0);

const SIZE = 'w-8 h-8 sm:w-10 sm:h-10';

export const Puyo: React.FC<PuyoProps> = memo(({
  color,
  isConnected = false,
  isDeleting = false,
  landed = false,
  fallRows = 0
}) => {
  if (!color) {
    return <div className={SIZE} />;
  }

  const stateClass = isDeleting ? 'puyo-pop' : isConnected ? 'puyo-blink' : '';
  const dropStyle = landed
    ? ({ '--fall-rows': fallRows, '--drop-ms': `${dropDuration(fallRows)}ms` } as React.CSSProperties)
    : undefined;

  return (
    <div className={`${SIZE} relative z-[1]`}>
      <div className={`w-full h-full ${landed ? 'puyo-drop' : ''}`} style={dropStyle}>
        <div className={`w-full h-full ${landed ? 'puyo-squash' : ''}`} style={dropStyle}>
          <div
            className={`w-full h-full rounded-full border-2 flex items-center justify-center ${PUYO_COLORS[color]} ${stateClass}`}
          >
            <span className="text-xs select-none">{PUYO_EYES[color]}</span>
          </div>
        </div>
      </div>
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
