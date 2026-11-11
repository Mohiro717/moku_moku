import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import type { GameState } from '../../types/game';
import { endFever, fxVariant, variantFx } from './ChainFxVariants';

// ========================================
// 連鎖の演出（全部盛り）
// 消える瞬間に、消えたぷよから火花と衝撃の輪を散らし、盤面をドンと揺らしてふちを光らせる。
// 3連鎖から集中線、5連鎖からは白く光らせて「〇連鎖」の判子、7連鎖から虹色で二度光る。
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

/** 3連鎖から集中線 */
const SPEED_LINES_CHAIN = 3;
/** 5連鎖から光と判子 */
const BIG_CHAIN = 5;
/** 7連鎖から虹色・二度光る */
const RAINBOW_CHAIN = 7;
const KANJI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const STAR_CLIP = 'polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%)';

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

const centerOf = (points: PopPoint[]) => ({
  x: points.reduce((s, p) => s + p.x, 0) / points.length,
  y: points.reduce((s, p) => s + p.y, 0) / points.length
});

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
/** 盤面にぴったり重なる箱 */
const overBoard = (board: HTMLElement, style: Partial<CSSStyleDeclaration>) => {
  const r = board.getBoundingClientRect();
  return spawn({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, ...style });
};

/** 段が上がるほど増える火花。丸と四つ星が飛び散り、放物線を描いて落ちる */
const sparks = (points: PopPoint[], step: number) => {
  const perPuyo = Math.min(9, 3 + step);
  points.forEach(p => {
    for (let i = 0; i < perPuyo; i++) {
      const star = i % 3 === 1;
      const size = star ? 9 + Math.random() * 7 : 4 + Math.random() * 5;
      const el = spawn({
        left: `${p.x - size / 2}px`,
        top: `${p.y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: star ? '0' : '50%',
        clipPath: star ? STAR_CLIP : '',
        background: i % 3 === 0 ? '#fff' : star ? '#ffe27a' : p.color,
        boxShadow: star ? '' : `0 0 8px ${p.color}`
      });
      const a = Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * (40 + step * 12);
      const dx = Math.cos(a) * d;
      const dy = Math.sin(a) * d - 18;
      const fall = 40 + Math.random() * 30 + step * 4;
      const spin = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360);
      play(el, [
        { transform: 'translate(0, 0) scale(1.5) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(1) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.15}px, ${dy + fall}px) scale(0) rotate(${spin}deg)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.15,.7,.5,1)' });
    }
  });
};

/** 同じ色で消えたまとまりごとに、衝撃の輪をひとつ広げる */
const shockwaves = (points: PopPoint[], step: number) => {
  const byColor = new Map<string, PopPoint[]>();
  points.forEach(p => byColor.set(p.color, [...(byColor.get(p.color) ?? []), p]));
  byColor.forEach((group, color) => {
    const c = centerOf(group);
    const size = 120 + step * 30 + group.length * 6;
    const ring = spawn({
      left: `${c.x - size / 2}px`, top: `${c.y - size / 2}px`, width: `${size}px`, height: `${size}px`,
      borderRadius: '50%', border: `${Math.min(10, 4 + step)}px solid ${color}`,
      boxShadow: `0 0 16px ${color}, inset 0 0 16px #fff`
    });
    play(ring, [
      { transform: 'scale(0.1)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 }
    ], { duration: 420 + step * 30, easing: 'cubic-bezier(.1,.8,.3,1)' });
  });
};

/** 盤面がドンと前に出て、揺れながら戻る。段が上がるほど強い */
const punch = (board: HTMLElement, step: number) => {
  const px = step >= BIG_CHAIN ? 4 + step * 2 : 2 + step;
  const zoom = Math.min(0.09, 0.025 + step * 0.01);
  const n = 8;
  const frames: Keyframe[] = Array.from({ length: n }, (_, i) => {
    const k = 1 - i / n;
    const x = (Math.random() * 2 - 1) * px * k;
    const y = (Math.random() * 2 - 1) * px * k;
    return { transform: `translate(${x}px, ${y}px) scale(${1 + zoom * k * k})` };
  });
  board.animate([...frames, { transform: 'none' }], { duration: 280 + step * 30, easing: 'ease-out' });
};

/** 盤面のふちが消えた色で光る。連鎖が続くと前の光が残ったまま次が重なり、だんだん熱くなる */
const glow = (board: HTMLElement, step: number, color: string) => {
  const c = step >= RAINBOW_CHAIN ? '#ffd23f' : color;
  const el = overBoard(board, {
    borderRadius: '20px',
    zIndex: '55',
    boxShadow: `0 0 ${18 + step * 10}px ${4 + step * 3}px ${c}, inset 0 0 ${12 + step * 6}px ${c}`
  });
  play(el, [
    { opacity: 0 },
    { opacity: Math.min(1, 0.45 + step * 0.12), offset: 0.12 },
    { opacity: 0 }
  ], { duration: 900 + step * 150, easing: 'ease-out' });
};

/** 3連鎖から：消えた所を中心に集中線がバッと走る */
const speedLines = (board: HTMLElement, points: PopPoint[], step: number) => {
  if (points.length === 0) return;
  const r = board.getBoundingClientRect();
  const c = centerOf(points);
  const cx = c.x - r.left;
  const cy = c.y - r.top;
  const far = Math.hypot(r.width, r.height);
  const count = 26 + step * 4;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', `${r.width}`);
  svg.setAttribute('height', `${r.height}`);
  svg.setAttribute('fill', step >= BIG_CHAIN ? '#f6b93b' : '#3b2f2f');
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.2;
    const inner = 40 + Math.random() * 50;
    const w = 1.5 + Math.random() * 3.5;
    const nx = -Math.sin(a) * w;
    const ny = Math.cos(a) * w;
    const ox = cx + Math.cos(a) * far;
    const oy = cy + Math.sin(a) * far;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M${cx + Math.cos(a) * inner} ${cy + Math.sin(a) * inner} L${ox + nx} ${oy + ny} L${ox - nx} ${oy - ny} Z`);
    svg.appendChild(path);
  }
  const el = overBoard(board, { borderRadius: '16px', overflow: 'hidden', zIndex: '58' });
  el.appendChild(svg);
  play(el, [
    { opacity: 0, transform: 'scale(1.25)' },
    { opacity: step >= BIG_CHAIN ? 0.9 : 0.5, transform: 'scale(1)', offset: 0.2 },
    { opacity: 0, transform: 'scale(1)' }
  ], { duration: 520, easing: 'ease-out' });
};

const flashAndStamp = (board: HTMLElement, step: number) => {
  const r = board.getBoundingClientRect();
  const rainbow = step >= RAINBOW_CHAIN;
  const flash = overBoard(board, { background: '#fff', borderRadius: '16px', mixBlendMode: 'screen' });
  // 7連鎖からは、二度光る
  play(flash, rainbow
    ? [{ opacity: 0.95 }, { opacity: 0.1, offset: 0.35 }, { opacity: 0.8, offset: 0.5 }, { opacity: 0 }]
    : [{ opacity: 0.85 }, { opacity: 0 }],
  { duration: rainbow ? 420 : 260, easing: 'ease-out' });

  const stamp = spawn({
    left: `${r.left + r.width / 2}px`,
    top: `${r.top + r.height * 0.42}px`,
    font: `900 ${Math.round(Math.min(64 + (step - BIG_CHAIN) * 6, r.width * 0.26))}px serif`,
    whiteSpace: 'nowrap',
    color: '#ffe066',
    webkitTextStroke: '2px #7a1030',
    textShadow: '0 4px 0 #7a1030, 0 0 18px #ff4f9a'
  }, `${KANJI[Math.min(step, KANJI.length - 1)]}連鎖`);
  // 大きく叩きつけて、少し沈んでから落ち着く
  play(stamp, [
    { transform: 'translate(-50%, -50%) scale(3.4) rotate(-16deg)', opacity: 0 },
    { transform: 'translate(-50%, -50%) scale(0.92) rotate(-8deg)', opacity: 1, offset: 0.13 },
    { transform: 'translate(-50%, -50%) scale(1.04) rotate(-8deg)', opacity: 1, offset: 0.2 },
    { transform: 'translate(-50%, -50%) scale(1.08) rotate(-8deg)', opacity: 1, offset: 0.8 },
    { transform: 'translate(-50%, -50%) scale(1.12) rotate(-8deg)', opacity: 0 }
  ], { duration: 1000, easing: 'ease-out' });
  if (rainbow) {
    stamp.animate([{ filter: 'hue-rotate(0deg)' }, { filter: 'hue-rotate(360deg)' }], { duration: 500, iterations: 2 });
  }
};

/** 片側の盤面の連鎖演出。pops を渡すと、消えたぷよの位置を残す（対戦の攻撃の光用） */
export const useChainFx = (
  side: GameState | undefined,
  board: RefObject<HTMLElement>,
  pops?: MutableRefObject<PopRecord | null>
) => {
  const step = side?.chainAnimationStep;
  const prevStep = useRef(step);
  const variant = useRef(fxVariant());
  const lastStep = useRef(0);

  useEffect(() => {
    if (side && step === 'deleting' && prevStep.current !== 'deleting') {
      const n = side.currentChainStep + 1;
      const points = popPoints(side, board.current);
      if (pops) pops.current = { at: performance.now(), points };
      sparks(points, n);
      if (board.current && !reducedMotion()) {
        shockwaves(points, n);
        punch(board.current, n);
        glow(board.current, n, points[0]?.color ?? '#fff');
        if (n >= SPEED_LINES_CHAIN) speedLines(board.current, points, n);
        if (n >= BIG_CHAIN) flashAndStamp(board.current, n);
        if (variant.current) variantFx(variant.current, board.current, points, n);
      }
      lastStep.current = n;
    }
    prevStep.current = step;
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // 見比べ用の案 c は、連鎖が終わったときに締めの演出を出す
  const chaining = !!side?.isChaining;
  useEffect(() => {
    if (chaining || variant.current !== 'c') return;
    endFever(board.current, lastStep.current);
    lastStep.current = 0;
  }, [chaining]); // eslint-disable-line react-hooks/exhaustive-deps
};
