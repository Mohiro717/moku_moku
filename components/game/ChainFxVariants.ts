import type { PopPoint } from './ChainFx';

// ========================================
// 連鎖の演出の見比べ用（開発サーバーだけ）。URL に &fx=a / b / c を付けると、今の演出の上に足す
//   a: 画面ごと動く（ヒットストップ・寄り・画面全体の光と揺れ）
//   b: 光の柱と花びら（消えた所から光が立ち、桜とぬばたまの花びらが舞い上がる）
//   c: 盤面が色づく（連鎖のあいだ後光が回り、段ごとに色が濃くなる。終わりに大きくはじける）
// 選ばれた案だけを本採用し、このファイルは消す
// ========================================

export type FxVariant = 'a' | 'b' | 'c';

export const fxVariant = (): FxVariant | null => {
  if (!import.meta.env.DEV || typeof location === 'undefined') return null;
  const v = new URLSearchParams(location.search).get('fx');
  return v === 'a' || v === 'b' || v === 'c' ? v : null;
};

const SAKURA = '#ffb7cf';
const NUBATAMA = '#6b4a9a';

const spawn = (style: Partial<CSSStyleDeclaration>, parent: HTMLElement = document.body) => {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', pointerEvents: 'none', zIndex: '61' }, style);
  parent.appendChild(el);
  return el;
};
const play = (el: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) => {
  const anim = el.animate(frames, { fill: 'forwards', ...options });
  anim.onfinish = () => el.remove();
  return anim;
};
const centerOf = (points: PopPoint[]) => ({
  x: points.reduce((s, p) => s + p.x, 0) / points.length,
  y: points.reduce((s, p) => s + p.y, 0) / points.length
});
const groupsByColor = (points: PopPoint[]) => {
  const m = new Map<string, PopPoint[]>();
  points.forEach(p => m.set(p.color, [...(m.get(p.color) ?? []), p]));
  return m;
};

// ---------- a: 画面ごと動く ----------

/** 消えた所へグッと寄って一瞬止まり（ヒットストップ）、はね返る。画面全体も揺れて、消えた色で光る */
const fxScreen = (board: HTMLElement, points: PopPoint[], step: number) => {
  const r = board.getBoundingClientRect();
  const c = points.length ? centerOf(points) : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  const ox = ((c.x - r.left) / r.width) * 100;
  const oy = ((c.y - r.top) / r.height) * 100;
  const zoom = Math.min(1.3, 1.1 + step * 0.03);
  // 盤面は ChainFx の punch も動かすので、包んでいる親を動かす
  const target = board.parentElement ?? board;
  target.style.transformOrigin = `${ox}% ${oy}%`;
  target.animate([
    { transform: 'scale(1)' },
    { transform: `scale(${zoom})`, offset: 0.12 },
    { transform: `scale(${zoom})`, offset: 0.42 }, // 止まる
    { transform: 'scale(0.97)', offset: 0.7 },
    { transform: 'scale(1)' }
  ], { duration: 380 + step * 20, easing: 'cubic-bezier(.2,.9,.3,1)' });

  // 画面全体の揺れ（盤面の外も）
  const page = document.getElementById('root') ?? document.body;
  const amp = Math.min(22, 4 + step * 3);
  const n = 10;
  page.animate([
    ...Array.from({ length: n }, (_, i) => {
      const k = 1 - i / n;
      return { transform: `translate(${(Math.random() * 2 - 1) * amp * k}px, ${(Math.random() * 2 - 1) * amp * k}px)` };
    }),
    { transform: 'none' }
  ], { duration: 360 + step * 30, easing: 'ease-out' });

  // 画面全体が消えた色で光る
  const color = points[0]?.color ?? '#fff';
  const flash = spawn({ inset: '0', background: `radial-gradient(circle at ${c.x}px ${c.y}px, #fff 0, ${color} 18%, transparent 70%)`, mixBlendMode: 'screen', zIndex: '62' });
  play(flash, [{ opacity: Math.min(0.95, 0.4 + step * 0.08) }, { opacity: 0 }], { duration: 300 + step * 40, easing: 'ease-out' });

  // 3連鎖から：画面のふちが暗く締まる（光が際立つ）
  if (step >= 3) {
    const vignette = spawn({ inset: '0', background: 'radial-gradient(ellipse at center, transparent 45%, rgba(20,8,30,.75) 100%)', zIndex: '59' });
    play(vignette, [{ opacity: 0 }, { opacity: Math.min(1, 0.4 + step * 0.1), offset: 0.15 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' });
  }
};

// ---------- b: 光の柱と花びら ----------

/** 色ごとのまとまりから、上へ光の柱が立つ */
const pillars = (points: PopPoint[], step: number) => {
  groupsByColor(points).forEach((group, color) => {
    const xs = group.map(p => p.x);
    const left = Math.min(...xs) - 18;
    const width = Math.max(...xs) - Math.min(...xs) + 36;
    const bottom = Math.max(...group.map(p => p.y)) + 18;
    const el = spawn({
      left: `${left}px`,
      top: '0px',
      width: `${width}px`,
      height: `${bottom}px`,
      background: `linear-gradient(to top, #fff 0%, ${color} 18%, ${color}88 55%, transparent 100%)`,
      boxShadow: `0 0 30px 8px ${color}`,
      mixBlendMode: 'screen',
      transformOrigin: '50% 100%',
      borderRadius: `${width / 2}px ${width / 2}px 6px 6px`
    });
    play(el, [
      { transform: 'scaleY(0) scaleX(1.4)', opacity: 1 },
      { transform: 'scaleY(1) scaleX(1)', opacity: 1, offset: 0.25 },
      { transform: 'scaleY(1) scaleX(0.2)', opacity: 0 }
    ], { duration: 650 + step * 60, easing: 'cubic-bezier(.2,.8,.3,1)' });
  });
};

const PETAL_SHAPE = '50% 0 50% 0';

const petal = (x: number, y: number, color: string, rise: number, life: number, delay = 0) => {
  const size = 9 + Math.random() * 9;
  const el = spawn({
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    width: `${size}px`,
    height: `${size * 0.8}px`,
    background: `linear-gradient(135deg, #fff, ${color})`,
    borderRadius: PETAL_SHAPE,
    boxShadow: `0 0 6px ${color}`,
    opacity: '0'
  });
  const sway = 30 + Math.random() * 50;
  const dir = Math.random() < 0.5 ? -1 : 1;
  const spin = dir * (360 + Math.random() * 540);
  play(el, [
    { transform: 'translate(0,0) rotate(0deg) scale(.4)', opacity: 0 },
    { transform: `translate(${dir * sway * 0.3}px, ${-rise * 0.25}px) rotate(${spin * 0.25}deg) scale(1)`, opacity: 1, offset: 0.12 },
    { transform: `translate(${-dir * sway * 0.6}px, ${-rise * 0.6}px) rotate(${spin * 0.6}deg) scale(1)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dir * sway}px, ${-rise}px) rotate(${spin}deg) scale(.8)`, opacity: 0 }
  ], { duration: life, delay, easing: 'cubic-bezier(.25,.6,.4,1)' });
};

/** 消えたぷよから、桜とぬばたまの花びらが舞い上がる。5連鎖からは画面の下から花吹雪 */
const fxPetals = (points: PopPoint[], step: number) => {
  pillars(points, step);
  const perPuyo = Math.min(10, 3 + step);
  points.forEach(p => {
    for (let i = 0; i < perPuyo; i++) {
      const color = i % 3 === 0 ? SAKURA : i % 3 === 1 ? p.color : NUBATAMA;
      petal(p.x + (Math.random() * 2 - 1) * 14, p.y, color, 140 + Math.random() * 160 + step * 25, 1400 + Math.random() * 900, Math.random() * 120);
    }
  });
  if (step >= 5) {
    const count = Math.min(120, 30 + step * 10);
    for (let i = 0; i < count; i++) {
      const color = i % 2 ? SAKURA : NUBATAMA;
      petal(Math.random() * innerWidth, innerHeight + 10, color, innerHeight * (0.6 + Math.random() * 0.5), 2000 + Math.random() * 1200, Math.random() * 500);
    }
  }
};

// ---------- c: 盤面が色づく ----------

interface Fever {
  rays: HTMLElement;
  tint: HTMLElement;
  spin: Animation;
}
/** 盤面ごと（対戦では2枚） */
const fevers = new WeakMap<HTMLElement, Fever>();

/** 連鎖のあいだ、盤面の後ろで後光が回り、盤面に色がかかる。段ごとに濃く・速く・大きく */
const fxFever = (board: HTMLElement, points: PopPoint[], step: number) => {
  const r = board.getBoundingClientRect();
  const color = points[0]?.color ?? '#ffd23f';
  let fever = fevers.get(board);
  if (!fever) {
    // 後光は盤面の中に入れて、ぷよの後ろに描く（盤面を重ねの基準にし、後光はその一番奥）
    board.style.position = 'relative';
    board.style.zIndex = '1';
    const size = Math.max(r.width, r.height) * 1.7;
    const rays = spawn({
      position: 'absolute',
      left: `${r.width / 2 - size / 2}px`,
      top: `${r.height / 2 - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      zIndex: '-1',
      transition: 'opacity .25s, filter .25s',
      opacity: '0',
      maskImage: 'radial-gradient(circle, #000 30%, transparent 70%)',
      webkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 70%)'
    } as Partial<CSSStyleDeclaration>, board);
    const spin = rays.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 9000, iterations: Infinity });
    const tint = spawn({
      left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`,
      borderRadius: '16px', mixBlendMode: 'soft-light', zIndex: '57', transition: 'background .2s, opacity .2s', opacity: '0'
    });
    fever = { rays, tint, spin };
    fevers.set(board, fever);
  }
  const { rays, tint, spin } = fever;
  const ray = step >= 7 ? '#ffd23f' : color;
  rays.style.background = `repeating-conic-gradient(from 0deg, ${ray} 0deg 7deg, transparent 7deg 18deg)`;
  rays.style.opacity = `${Math.min(0.95, 0.3 + step * 0.12)}`;
  rays.style.filter = step >= 7 ? 'hue-rotate(0deg) saturate(1.6)' : '';
  if (step >= 7) rays.animate([{ filter: 'hue-rotate(0deg) saturate(1.6)' }, { filter: 'hue-rotate(360deg) saturate(1.6)' }], { duration: 900, iterations: 2 });
  spin.playbackRate = 1 + step * 0.8;
  tint.style.background = `radial-gradient(circle, ${color} 0%, ${color}aa 60%, ${color}55 100%)`;
  tint.style.opacity = `${Math.min(0.85, 0.25 + step * 0.1)}`;
  // 段が上がるたびに後光がドクンと脈打つ
  rays.animate([{ scale: '1.25' }, { scale: '1' }], { duration: 300, easing: 'ease-out' });
};

/** 連鎖が終わった：大きくはじけて後光を消す */
export const endFever = (board: HTMLElement | null, lastStep: number) => {
  const fever = board && fevers.get(board);
  if (!board || !fever) return;
  const { rays, tint, spin } = fever;
  fevers.delete(board);
  if (lastStep >= 2) {
    const r = board.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 3; i++) {
      const size = Math.max(r.width, r.height) * (1.2 + i * 0.5);
      const ring = spawn({
        left: `${cx - size / 2}px`, top: `${cy - size / 2}px`, width: `${size}px`, height: `${size}px`,
        borderRadius: '50%', border: `${10 - i * 3}px solid #fff`, boxShadow: '0 0 30px #ffd23f, inset 0 0 30px #ffd23f'
      });
      play(ring, [{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 600 + i * 150, delay: i * 70, easing: 'cubic-bezier(.1,.8,.3,1)' });
    }
    const flash = spawn({ inset: '0', background: '#fff', mixBlendMode: 'screen', zIndex: '62' });
    play(flash, [{ opacity: Math.min(0.9, 0.3 + lastStep * 0.08) }, { opacity: 0 }], { duration: 450, easing: 'ease-out' });
  }
  play(rays, [{ opacity: rays.style.opacity, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.4)' }], { duration: 600, easing: 'ease-out' });
  play(tint, [{ opacity: tint.style.opacity }, { opacity: 0 }], { duration: 500, easing: 'ease-out' });
  setTimeout(() => spin.cancel(), 700);
  board.style.zIndex = '';
};

/** 消えた瞬間に、選ばれた案の演出を足す */
export const variantFx = (variant: FxVariant, board: HTMLElement, points: PopPoint[], step: number) => {
  if (variant === 'a') fxScreen(board, points, step);
  else if (variant === 'b') fxPetals(points, step);
  else fxFever(board, points, step);
};
