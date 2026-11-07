import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './puyoAnimations.css';
import type { PopPoint, PopRecord } from './ChainFx';

// ========================================
// 攻撃の光
// 予告の増減から「誰が撃ったか」を読み、撃った側で消えたぷよから当たる予告欄へ光を飛ばす。
// 消えたぷよ1つごとにその色の玉が飛び、真ん中を光の帯が通る。
//   相手の予告が増えた → 相手の予告欄へ
//   自分が連鎖中に自分の予告が減った（相殺） → 自分の予告欄へ
// 連鎖していないときの減少は、おじゃまが降っただけなので光は出さない。
// ========================================

type Side = 'player' | 'cpu';

export const BEAM_MS = 550;

const BEAM_COLORS: Record<Side, string> = { player: '#ff4f9a', cpu: '#ef4444' };

interface Beam {
  id: number;
  from: Side;
  x1: number; y1: number; x2: number; y2: number;
}

interface BeamInput {
  pending: Record<Side, number>;
  chaining: Record<Side, boolean>;
  boards: Record<Side, React.RefObject<HTMLElement>>;
  notices: Record<Side, React.RefObject<HTMLElement>>;
  /** 直近に消えたぷよ。あれば光の玉はそこから飛ぶ */
  pops?: Record<Side, React.MutableRefObject<PopRecord | null>>;
}

/** 消えてからこの時間内の予告の増減なら、その連鎖の攻撃とみなす */
const POP_FRESH_MS = 1500;
const MAX_ORBS = 12;

/** 消えたぷよの色の光の玉を、それぞれの位置から予告欄へ弧を描いて飛ばす */
const flyOrbs = (points: PopPoint[], x2: number, y2: number) => {
  if (typeof document === 'undefined') return;
  points.slice(0, MAX_ORBS).forEach((p, i) => {
    const lift = Math.max(50, Math.hypot(x2 - p.x, y2 - p.y) * 0.35) + Math.random() * 40;
    const cx = (p.x + x2) / 2 + (Math.random() * 2 - 1) * 60;
    const cy = Math.min(p.y, y2) - lift;
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', left: '0', top: '0', width: '16px', height: '16px', borderRadius: '50%',
      pointerEvents: 'none', zIndex: '60',
      background: `radial-gradient(circle, #fff 0 30%, ${p.color} 55%, transparent 72%)`,
      boxShadow: `0 0 14px 5px ${p.color}`
    });
    el.style.setProperty('offset-path', `path('M ${p.x} ${p.y} Q ${cx} ${cy} ${x2} ${y2}')`);
    el.style.setProperty('offset-rotate', '0deg');
    document.body.appendChild(el);
    // 最後の玉も BEAM_MS で着くように、遅れて出る玉ほど速く飛ぶ
    const delay = i * 18;
    el.animate(
      [
        { offsetDistance: '0%', transform: 'scale(1.5)', opacity: 1 },
        { offsetDistance: '100%', transform: 'scale(0.7)', opacity: 0.9 }
      ] as Keyframe[],
      { duration: BEAM_MS - delay, delay, easing: 'cubic-bezier(.45,0,.8,.55)', fill: 'both' }
    ).onfinish = () => el.remove();
  });
};

export const useAttackBeams = ({ pending, chaining, boards, notices, pops }: BeamInput) => {
  const [beams, setBeams] = useState<Beam[]>([]);
  const [hits, setHits] = useState<Record<Side, number>>({ player: 0, cpu: 0 });
  const prev = useRef({ ...pending });
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const fire = (from: Side, to: Side) => {
      const a = boards[from].current?.getBoundingClientRect();
      const b = notices[to].current?.getBoundingClientRect();
      if (!a || !b) return;
      const id = ++nextId.current;
      const x2 = b.left + b.width / 2;
      const y2 = b.top + b.height / 2;
      const rec = pops?.[from].current;
      const points = rec && performance.now() - rec.at < POP_FRESH_MS ? rec.points : [];
      // 光の帯は消えたぷよの真ん中から（なければ盤面の真ん中から）
      const x1 = points.length ? points.reduce((s, p) => s + p.x, 0) / points.length : a.left + a.width / 2;
      const y1 = points.length ? points.reduce((s, p) => s + p.y, 0) / points.length : a.top + a.height * 0.45;
      flyOrbs(points, x2, y2);
      setBeams(list => [...list, { id, from, x1, y1, x2, y2 }]);
      const t = setTimeout(() => {
        timers.current.delete(t);
        setBeams(list => list.filter(beam => beam.id !== id));
        setHits(h => ({ ...h, [to]: h[to] + 1 }));
      }, BEAM_MS);
      timers.current.add(t);
    };

    const before = prev.current;
    if (pending.cpu > before.cpu) fire('player', 'cpu');
    if (pending.player > before.player) fire('cpu', 'player');
    if (pending.player < before.player && chaining.player) fire('player', 'player');
    if (pending.cpu < before.cpu && chaining.cpu) fire('cpu', 'cpu');
    prev.current = { ...pending };
  }, [pending.player, pending.cpu]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  return { beams, hits };
};

/** 画面全体に重ねる光の層（クリックは素通し） */
export const AttackBeamLayer: React.FC<{ beams: Beam[] }> = ({ beams }) => {
  if (beams.length === 0 || typeof document === "undefined") return null;
  // 親に transform があると fixed がずれるので body 直下に出す
  return createPortal(
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-50" aria-hidden="true">
      {beams.map(({ id, from, x1, y1, x2, y2 }) => {
        // 真ん中を少し持ち上げた弧にする
        const lift = Math.max(40, Math.hypot(x2 - x1, y2 - y1) * 0.3);
        const cx = (x1 + x2) / 2;
        const cy = Math.min(y1, y2) - lift;
        const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        const style = { '--beam-ms': `${BEAM_MS}ms` } as React.CSSProperties;
        return (
          <g key={id}>
            <path className="attack-beam" d={d} pathLength={100} stroke={BEAM_COLORS[from]} strokeOpacity={0.55} strokeWidth={10} style={style} />
            <path className="attack-beam" d={d} pathLength={100} stroke="#fff" strokeWidth={3} style={style} />
          </g>
        );
      })}
    </svg>,
    document.body
  );
};
