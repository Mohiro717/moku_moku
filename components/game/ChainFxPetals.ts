import type { PopPoint } from './ChainFx';

// ========================================
// 光の柱と花びら（2026-11-11 オーナーが見比べ3案から b を採用「もっとパーティクルいっぱいで派手でもいい」）
// 消えたまとまりから光の柱が立ち、桜とぬばたま（暗紫）の花びらときらきらが舞い上がる。
// 3連鎖から画面の下から花吹雪、5連鎖からは左右からも吹き込む。
// ========================================

const SAKURA = '#ffb7cf';
const NUBATAMA = '#6b4a9a';
const GOLD = '#ffe27a';
/** 同時に出しておく粒の上限（スマホで重くならないように） */
const MAX_LIVE = 700;
let live = 0;

const spawn = (style: Partial<CSSStyleDeclaration>) => {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', pointerEvents: 'none', zIndex: '61' }, style);
  document.body.appendChild(el);
  return el;
};
const play = (el: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions, particle = false) => {
  if (particle) live++;
  el.animate(frames, { fill: 'forwards', ...options }).onfinish = () => {
    el.remove();
    if (particle) live--;
  };
};
const room = () => live < MAX_LIVE;

/** 色ごとのまとまりから、上へ光の柱が立つ（白い芯つき） */
const pillars = (points: PopPoint[], step: number) => {
  const groups = new Map<string, PopPoint[]>();
  points.forEach(p => groups.set(p.color, [...(groups.get(p.color) ?? []), p]));
  groups.forEach((group, color) => {
    const xs = group.map(p => p.x);
    const width = Math.max(...xs) - Math.min(...xs) + 40 + step * 4;
    const left = (Math.min(...xs) + Math.max(...xs)) / 2 - width / 2;
    const bottom = Math.max(...group.map(p => p.y)) + 20;
    const beam = spawn({
      left: `${left}px`, top: '0px', width: `${width}px`, height: `${bottom}px`,
      background: `linear-gradient(to top, #fff 0%, ${color} 18%, ${color}88 55%, transparent 100%)`,
      boxShadow: `0 0 ${30 + step * 6}px ${8 + step * 2}px ${color}`,
      mixBlendMode: 'screen', transformOrigin: '50% 100%',
      borderRadius: `${width / 2}px ${width / 2}px 6px 6px`
    });
    play(beam, [
      { transform: 'scaleY(0) scaleX(1.5)', opacity: 1 },
      { transform: 'scaleY(1) scaleX(1)', opacity: 1, offset: 0.25 },
      { transform: 'scaleY(1) scaleX(0.2)', opacity: 0 }
    ], { duration: 700 + step * 70, easing: 'cubic-bezier(.2,.8,.3,1)' });
    const coreWidth = Math.max(6, width * 0.25);
    const core = spawn({
      left: `${left + width / 2 - coreWidth / 2}px`, top: '0px', width: `${coreWidth}px`, height: `${bottom}px`,
      background: 'linear-gradient(to top, #fff 0%, #fff 40%, transparent 100%)',
      mixBlendMode: 'screen', transformOrigin: '50% 100%', borderRadius: `${coreWidth}px`
    });
    play(core, [
      { transform: 'scaleY(0)', opacity: 1 },
      { transform: 'scaleY(1)', opacity: 1, offset: 0.2 },
      { transform: 'scaleY(1) scaleX(0)', opacity: 0 }
    ], { duration: 500 + step * 50, easing: 'cubic-bezier(.2,.8,.3,1)' });
  });
};

/** ひらひらと舞い上がる花びら */
const petal = (x: number, y: number, color: string, rise: number, drift: number, life: number, delay = 0) => {
  if (!room()) return;
  const size = 9 + Math.random() * 11;
  const el = spawn({
    left: `${x - size / 2}px`, top: `${y - size / 2}px`, width: `${size}px`, height: `${size * 0.8}px`,
    background: `linear-gradient(135deg, #fff, ${color})`,
    borderRadius: '50% 0 50% 0', boxShadow: `0 0 6px ${color}`, opacity: '0'
  });
  const sway = 30 + Math.random() * 50;
  const dir = Math.random() < 0.5 ? -1 : 1;
  const spin = dir * (360 + Math.random() * 720);
  play(el, [
    { transform: 'translate(0,0) rotate(0deg) scale(.4)', opacity: 0 },
    { transform: `translate(${drift * 0.25 + dir * sway * 0.3}px, ${-rise * 0.25}px) rotate(${spin * 0.25}deg) scale(1)`, opacity: 1, offset: 0.12 },
    { transform: `translate(${drift * 0.6 - dir * sway * 0.6}px, ${-rise * 0.6}px) rotate(${spin * 0.6}deg) scale(1)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${drift + dir * sway}px, ${-rise}px) rotate(${spin}deg) scale(.8)`, opacity: 0 }
  ], { duration: life, delay, easing: 'cubic-bezier(.25,.6,.4,1)' }, true);
};

/** またたきながら昇る小さな光の粒 */
const glitter = (x: number, y: number, rise: number, life: number, delay = 0) => {
  if (!room()) return;
  const size = 3 + Math.random() * 4;
  const el = spawn({
    left: `${x - size / 2}px`, top: `${y - size / 2}px`, width: `${size}px`, height: `${size}px`,
    borderRadius: '50%', background: Math.random() < 0.5 ? '#fff' : GOLD,
    boxShadow: `0 0 ${size * 2}px ${GOLD}`, opacity: '0'
  });
  const dx = (Math.random() * 2 - 1) * 40;
  play(el, [
    { transform: 'translate(0,0) scale(.5)', opacity: 0 },
    { transform: `translate(${dx * 0.3}px, ${-rise * 0.3}px) scale(1.4)`, opacity: 1, offset: 0.2 },
    { transform: `translate(${dx * 0.6}px, ${-rise * 0.6}px) scale(.6)`, opacity: 0.3, offset: 0.5 },
    { transform: `translate(${dx * 0.8}px, ${-rise * 0.8}px) scale(1.2)`, opacity: 1, offset: 0.7 },
    { transform: `translate(${dx}px, ${-rise}px) scale(0)`, opacity: 0 }
  ], { duration: life, delay, easing: 'ease-out' }, true);
};

const petalColor = (i: number, own: string) => (i % 3 === 0 ? SAKURA : i % 3 === 1 ? own : NUBATAMA);

/** 消えた瞬間に、光の柱・花びら・きらきら。段が上がるほど増え、3連鎖から花吹雪 */
export const petalFx = (points: PopPoint[], step: number) => {
  pillars(points, step);
  const perPuyo = Math.min(16, 6 + step * 2);
  points.forEach(p => {
    for (let i = 0; i < perPuyo; i++) {
      petal(p.x + (Math.random() * 2 - 1) * 16, p.y, petalColor(i, p.color),
        150 + Math.random() * 180 + step * 30, 0, 1400 + Math.random() * 1000, Math.random() * 150);
    }
    for (let i = 0; i < 4 + step; i++) {
      glitter(p.x + (Math.random() * 2 - 1) * 20, p.y, 120 + Math.random() * 160 + step * 20, 900 + Math.random() * 700, Math.random() * 200);
    }
  });
  if (step >= 3) {
    // 画面の下から花吹雪
    const count = Math.min(180, 20 + (step - 2) * 30);
    for (let i = 0; i < count; i++) {
      petal(Math.random() * innerWidth, innerHeight + 10, i % 2 ? SAKURA : NUBATAMA,
        innerHeight * (0.6 + Math.random() * 0.5), (Math.random() * 2 - 1) * 80, 2000 + Math.random() * 1400, Math.random() * 600);
    }
  }
  if (step >= 5) {
    // 左右からも吹き込む
    const count = Math.min(80, (step - 4) * 25);
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      petal(fromLeft ? -10 : innerWidth + 10, innerHeight * (0.3 + Math.random() * 0.6), i % 3 ? SAKURA : NUBATAMA,
        innerHeight * (0.2 + Math.random() * 0.3), (fromLeft ? 1 : -1) * innerWidth * (0.4 + Math.random() * 0.4), 2200 + Math.random() * 1200, Math.random() * 500);
    }
  }
};
