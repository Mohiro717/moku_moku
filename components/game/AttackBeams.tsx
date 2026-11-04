import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './puyoAnimations.css';

// ========================================
// 攻撃の光
// 予告の増減から「誰が撃ったか」を読み、撃った側の盤面から当たる予告欄へ光を飛ばす。
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
}

export const useAttackBeams = ({ pending, chaining, boards, notices }: BeamInput) => {
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
      setBeams(list => [...list, {
        id, from,
        x1: a.left + a.width / 2, y1: a.top + a.height * 0.45,
        x2: b.left + b.width / 2, y2: b.top + b.height / 2
      }]);
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
