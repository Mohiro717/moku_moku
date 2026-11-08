import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import type { GameState } from '../../types/game';

// ========================================
// 連鎖の演出（全部盛り）
// 消える瞬間に、消えたぷよから火花を散らし、盤面を揺らす。
// 5連鎖からは白く光らせて「〇連鎖」の判子を押す。
// 消えたぷよの位置は覚えておき、攻撃の光（AttackBeams）の出発点に使う。
// 演出は DOM に直接足して終わったら消す（再描画させない）。
// ========================================

export const PUYO_HEX: Record<string, string> = {
  red: '#fb7a7a',
  blue: '#6aa9fb',
  green: '#55dc86',
  yellow: '#fbd23a',
  ojama: '#6b4a9a' // ぬばたまは祓うと暗紫の花弁
};

export interface PopPoint {
  x: number;
  y: number;
  color: string;
}

/** 直近に消えたぷよ（画面座標）と、消えた時刻 */
export interface PopRecord {
  at: number;
  points: PopPoint[];
}

/** 5連鎖から光と判子 */
const BIG_CHAIN = 5;
const KANJI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** 盤面の .grid の子は (y-1)*列数 + x の順にマスが並ぶ（y=0 は見えない行） */
const popPoints = (side: GameState, board: HTMLElement | null): PopPoint[] => {
  const grid = board?.querySelector<HTMLElement>('.grid');
  if (!grid) return [];
  const cols = side.grid[0]?.length ?? 6;
  const points: PopPoint[] = [];
  side.grid.forEach((row, y) => {
    if (y < 1) return;
    row.forEach((cell, x) => {
      if (!cell.isDeleting || !cell.color) return;
      const el = grid.children[(y - 1) * cols + x] as HTMLElement | undefined;
      if (!el) return;
      const r = el.getBoundingClientRect();
      points.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, color: PUYO_HEX[cell.color] ?? '#fff' });
    });
  });
  return points;
};

/** body 直下に固定位置の要素を足し、アニメが終わったら消す */
const spawn = (style: Partial<CSSStyleDeclaration>, text = '') => {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', pointerEvents: 'none', zIndex: '60' }, style);
  el.textContent = text;
  document.body.appendChild(el);
  return el;
};
const play = (el: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => {
  el.animate(frames, { fill: 'forwards', ...options }).onfinish = () => el.remove();
};

const sparks = (points: PopPoint[], step: number) => {
  const perPuyo = Math.min(6, 2 + Math.floor(step / 2));
  points.forEach(p => {
    for (let i = 0; i < perPuyo; i++) {
      const size = 4 + Math.random() * 5;
      const el = spawn({
        left: `${p.x - size / 2}px`,
        top: `${p.y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: i % 3 === 0 ? '#fff' : p.color,
        boxShadow: `0 0 6px ${p.color}`
      });
      const a = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * (40 + step * 10);
      play(el, [
        { transform: 'translate(0, 0) scale(1.3)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(0)`, opacity: 0 }
      ], { duration: 450 + Math.random() * 350, easing: 'cubic-bezier(.1,.8,.3,1)' });
    }
  });
};

const shake = (board: HTMLElement, step: number) => {
  const px = step >= BIG_CHAIN ? 4 + step * 2 : 2 + step;
  const frames: Keyframe[] = Array.from({ length: 7 }, (_, i) => {
    const k = px * (1 - i / 7);
    return { transform: `translate(${(Math.random() * 2 - 1) * k}px, ${(Math.random() * 2 - 1) * k}px)` };
  });
  board.animate([...frames, { transform: 'none' }], { duration: 240 + step * 25 });
};

const flashAndStamp = (board: HTMLElement, step: number) => {
  const r = board.getBoundingClientRect();
  const flash = spawn({
    left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
    background: '#fff', borderRadius: '16px', mixBlendMode: 'screen'
  });
  play(flash, [{ opacity: 0.85 }, { opacity: 0 }], { duration: 260, easing: 'ease-out' });

  const stamp = spawn({
    left: `${r.left + r.width / 2}px`,
    top: `${r.top + r.height * 0.42}px`,
    font: `900 ${Math.round(Math.min(64, r.width * 0.22))}px serif`,
    whiteSpace: 'nowrap',
    color: '#ffe066',
    webkitTextStroke: '2px #7a1030',
    textShadow: '0 4px 0 #7a1030, 0 0 18px #ff4f9a'
  }, `${KANJI[Math.min(step, KANJI.length - 1)]}連鎖`);
  play(stamp, [
    { transform: 'translate(-50%, -50%) scale(3) rotate(-14deg)', opacity: 0 },
    { transform: 'translate(-50%, -50%) scale(1) rotate(-8deg)', opacity: 1, offset: 0.15 },
    { transform: 'translate(-50%, -50%) scale(1.06) rotate(-8deg)', opacity: 1, offset: 0.8 },
    { transform: 'translate(-50%, -50%) scale(1.1) rotate(-8deg)', opacity: 0 }
  ], { duration: 950, easing: 'ease-out' });
};

/** 片側の盤面の連鎖演出。消えたぷよの位置を pops に残す */
export const useChainFx = (
  side: GameState | undefined,
  board: RefObject<HTMLElement>,
  pops: MutableRefObject<PopRecord | null>
) => {
  const step = side?.chainAnimationStep;
  const prevStep = useRef(step);

  useEffect(() => {
    if (side && step === 'deleting' && prevStep.current !== 'deleting') {
      const n = side.currentChainStep + 1;
      const points = popPoints(side, board.current);
      pops.current = { at: performance.now(), points };
      sparks(points, n);
      if (board.current && !reducedMotion()) {
        shake(board.current, n);
        if (n >= BIG_CHAIN) flashAndStamp(board.current, n);
      }
    }
    prevStep.current = step;
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
};
