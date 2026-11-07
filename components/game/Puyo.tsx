import React, { memo, useMemo } from 'react';
import type { PuyoColor } from '../../types/game';
import { GAME_TIMINGS } from '../../constants/gameTimings';
import './puyoAnimations.css';

interface PuyoProps {
  color: PuyoColor;
  isConnected?: boolean;
  isDeleting?: boolean;
  /** true のとき、fallRows マス上から落ちてきて着地でつぶれる（マウント時に1回） */
  landed?: boolean;
  fallRows?: number;
  /** 盤面に積もって止まっているぷよ。ゆっくり息をする */
  idle?: boolean;
}

/** つながりの橋の色（玉の中間色に合わせる） */
export const BRIDGE_COLORS: Record<string, string> = {
  red: 'bg-[#fb7a7a]',
  blue: 'bg-[#6aa9fb]',
  green: 'bg-[#55dc86]',
  yellow: 'bg-[#fbd23a]'
};

/** はじけたときの輪・しずくの色 */
const BURST_COLORS: Record<string, string> = {
  red: '#fb7a7a',
  blue: '#6aa9fb',
  green: '#55dc86',
  yellow: '#fbd23a',
  ojama: '#8a919c'
};

// ========================================
// SVG の部品（グラデーションと体の形）は document に1回だけ置き、各ぷよは <use> で参照する
// ========================================

const GRADIENTS: Record<string, [string, string, string]> = {
  red: ['#ffd0d0', '#fb7a7a', '#d93838'],
  blue: ['#d6e9ff', '#6aa9fb', '#2f6fd6'],
  green: ['#d4fbe0', '#55dc86', '#1f9d50'],
  yellow: ['#fff6c8', '#fbd23a', '#d49b06'],
  ojama: ['#d9dde3', '#8a919c', '#4b525c']
};

const DEFS_ID = 'puyo-svg-defs';

const ensureDefs = () => {
  if (typeof document === 'undefined' || !document.body || document.getElementById(DEFS_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = DEFS_ID;
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `<defs>
    ${Object.entries(GRADIENTS).map(([name, [light, mid, dark]]) => `
      <radialGradient id="puyo-g-${name}" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="${light}"/><stop offset="${name === 'ojama' ? '.4' : '.35'}" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
      </radialGradient>`).join('')}
    <path id="puyo-body" d="M20 3 C31 3 37 11 37 21 C37 31 30 37 20 37 C10 37 3 31 3 21 C3 11 9 3 20 3 Z"/>
    <path id="puyo-star" d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"/>
  </defs>`;
  document.body.appendChild(svg);
};

/** 落ちる距離に応じた落下時間（ms）。遠いほど少し長いが、連鎖のテンポを崩さないよう上限あり */
export const dropDuration = (rows: number): number => (rows > 0 ? Math.min(GAME_TIMINGS.drop, 100 + rows * 20) : 0);

const SIZE = 'puyo-cell';

/** ぷよの顔 SVG（おじゃまは怒り顔）。予告アイコンでも使う */
export const PuyoFace: React.FC<{ ojama: boolean; squint?: boolean; blinkDelay?: string }> = ({ ojama, squint = false, blinkDelay }) => {
  if (ojama) {
    return (
      <g>
        <path d="M11 15 L17 18 M29 15 L23 18" stroke="#2b2b2b" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="14.5" cy="21" r="2.6" fill="#2b2b2b" />
        <circle cx="25.5" cy="21" r="2.6" fill="#2b2b2b" />
      </g>
    );
  }
  return (
    <g className={squint ? 'puyo-eye-squint' : undefined}>
      <g className="puyo-eye" style={blinkDelay ? { animationDelay: blinkDelay } : undefined}>
        <ellipse cx="14" cy="19" rx="3.6" ry="5" fill="#fff" />
        <ellipse cx="26" cy="19" rx="3.6" ry="5" fill="#fff" />
        <ellipse cx="14.8" cy="20" rx="2" ry="3" fill="#2b2b2b" />
        <ellipse cx="26.8" cy="20" rx="2" ry="3" fill="#2b2b2b" />
      </g>
    </g>
  );
};

/** 消えるときの輪・しずく・星。マスからはみ出して飛ぶ */
const Burst: React.FC<{ color: string }> = ({ color }) => {
  const drops = useMemo(() => Array.from({ length: 5 }, (_, k) => {
    const angle = (-90 + (k - 2) * 38 + (Math.random() * 16 - 8)) * Math.PI / 180;
    const dist = 26 + Math.random() * 18;
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist + 6 };
  }), []);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-[2]" viewBox="0 0 40 40">
      <circle className="puyo-ring" cx="20" cy="20" r="16" stroke={color} />
      {drops.map((d, i) => (
        <ellipse
          key={i}
          className="puyo-droplet"
          cx="20" cy="20" rx="3.4" ry="4.2"
          fill={color}
          style={{ '--dx': `${d.dx.toFixed(1)}px`, '--dy': `${d.dy.toFixed(1)}px` } as React.CSSProperties}
        />
      ))}
      <use className="puyo-star" href="#puyo-star" x="31" y="6" fill="#ffe27a" />
    </svg>
  );
};

export const Puyo: React.FC<PuyoProps> = memo(({
  color,
  isConnected = false,
  isDeleting = false,
  landed = false,
  fallRows = 0,
  idle = false
}) => {
  ensureDefs();
  // まばたき・呼吸がそろわないよう、ぷよごとにずらす
  const phase = useMemo(() => Math.random(), []);

  if (!color) {
    return <div className={SIZE} />;
  }

  const stateClass = isDeleting ? 'puyo-pop' : isConnected ? 'puyo-blink' : idle ? 'puyo-idle' : '';
  const dropStyle = landed
    ? ({ '--fall-rows': fallRows, '--drop-ms': `${dropDuration(fallRows)}ms` } as React.CSSProperties)
    : undefined;
  const bodyStyle = stateClass === 'puyo-idle' ? { animationDelay: `${(-phase * 2.4).toFixed(2)}s` } : undefined;

  return (
    <div className={`${SIZE} relative z-[1]`}>
      <div className={`w-full h-full ${landed ? 'puyo-drop' : ''}`} style={dropStyle}>
        <div className={`w-full h-full ${landed ? 'puyo-squash' : ''}`} style={dropStyle}>
          <svg className={`puyo-svg w-full h-full overflow-visible ${stateClass}`} style={bodyStyle} viewBox="0 0 40 40">
            <use href="#puyo-body" fill={`url(#puyo-g-${color})`} />
            <ellipse cx="13" cy="10" rx="6" ry="3.4" fill="#fff" opacity=".65" transform="rotate(-25 13 10)" />
            <PuyoFace ojama={color === 'ojama'} squint={landed} blinkDelay={`${(-phase * 3.6).toFixed(2)}s`} />
          </svg>
        </div>
      </div>
      {isDeleting && <Burst color={BURST_COLORS[color] ?? '#fff'} />}
    </div>
  );
});
