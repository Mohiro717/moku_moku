import React from 'react';
import type { CpuCharacter } from '../../constants/cpuCharacters';
import type { GameState } from '../../types/game';
import { topRow } from '../../utils/boardStatus';

/** 対戦のはじまり：'vs'＝2人を大きく並べる、3・2・1＝カウント、'go'＝はじめ！ */
export type IntroStep = 'vs' | 3 | 2 | 1 | 'go';

export const VS_MS = 2600;
export const COUNT_MS = 700;
export const GO_MS = 650;

/**
 * 「咲耶 VS 宇迦」：自分のキャラを左（スマホは上）、相手を右（スマホは下）に、
 * 必殺カットインの絵で斜めに切って並べる。相手の絵は左右反転して、向かい合わせにする。
 * カットインは試合中にも頭から流すので、ここでは URL を変えて別に読む（同じ URL だと試合中に頭から再生されないことがある）
 */
const VsSplash: React.FC<{ player: CpuCharacter; cpu: CpuCharacter }> = ({ player, cpu }) => (
  <div className="vs-splash absolute inset-0">
    <div className="vs-half vs-half-a">
      {player.cutins[0] && <img src={`${player.cutins[0]}?vs=1`} alt="" className="vs-art" />}
    </div>
    <div className="vs-half vs-half-b">
      {cpu.cutins[0] && <img src={`${cpu.cutins[0]}?vs=1`} alt="" className="vs-art vs-art-flip" />}
    </div>
    <div className="vs-slash" />
    <div className="vs-name vs-name-a">
      <span className="wp-tag" style={{ background: 'var(--wp-sakura)', color: '#fff' }}>じぶん</span>
      <span className="vs-name-text">{player.name}</span>
    </div>
    <div className="vs-name vs-name-b">
      <span className="wp-tag" style={{ background: 'var(--wp-washi)' }}>あいて</span>
      <span className="vs-name-text">{cpu.name}</span>
    </div>
    <div className="vs-mark">VS</div>
  </div>
);

/** 盤面まわり全体に重ねる、はじまりの演出 */
export const VsIntroOverlay: React.FC<{ step: IntroStep | null; player: CpuCharacter; cpu: CpuCharacter }> = ({ step, player, cpu }) => {
  if (step === null) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-2xl" aria-live="polite">
      {step === 'vs' ? (
        <VsSplash player={player} cpu={cpu} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(42,12,28,0.18)]">
          <div key={String(step)} className={`vs-count ${step === 'go' ? 'vs-count-go' : ''}`}>
            {step === 'go' ? 'はじめ！' : step}
          </div>
        </div>
      )}
    </div>
  );
};

/** 優勢・ふつう・劣勢・勝ち・負け */
export type Mood = 'ahead' | 'even' | 'behind' | 'win' | 'lose';

/** 見える12段のうち、下の5段までは連鎖の土台として積むので危なさに数えない */
const SAFE_ROWS = 5;
const dangerOf = (side: GameState, pending: number) =>
  Math.max(0, side.grid.length - topRow(side.grid) - SAFE_ROWS) + pending / 6;

/**
 * 盤面の高さ（下の5段より上）と、降ってくる予定のおじゃま（6個で1段）を足した「危なさ」で比べる。
 * 3段以上の差で優勢・劣勢。いったん優勢・劣勢になったら、差が2段未満になるまで戻さない（境目でちらつかないように）
 */
export const nextMood = (
  prev: Mood,
  self: GameState,
  opponent: GameState,
  selfPending: number,
  opponentPending: number,
  result: 'win' | 'lose' | null
): Mood => {
  if (result) return result;
  const diff = dangerOf(self, selfPending) - dangerOf(opponent, opponentPending);
  const keep = prev === 'ahead' || prev === 'behind';
  const enter = keep ? 2 : 3;
  if (diff <= -enter) return 'ahead';
  if (diff >= enter) return 'behind';
  return 'even';
};

const MOOD_BADGE: Partial<Record<Mood, string>> = {
  ahead: '♪',
  behind: '💦',
  win: '★',
  lose: '…'
};

/** 名前の帯・台詞の欄の顔。様子に合わせて動く（puyoAnimations.css の .mood-*） */
export const MoodIcon: React.FC<{ src: string; alt?: string; mood: Mood; className?: string; style?: React.CSSProperties }> = ({ src, alt = '', mood, className = '', style }) => (
  <span className={`mood-icon mood-${mood} relative inline-block shrink-0 ${className}`}>
    <img src={src} alt={alt} className="mood-face w-full h-full rounded-full object-cover border-[3px] border-coffee-dark bg-[#131320]" style={style} />
    {MOOD_BADGE[mood] && <span key={mood} className="mood-badge" aria-hidden="true">{MOOD_BADGE[mood]}</span>}
  </span>
);
