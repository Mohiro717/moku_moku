import React from 'react';
import { HEADER_OFFSET } from '../../constants/layout';
import type { CpuCharacter } from '../../constants/cpuCharacters';
import type { GameState } from '../../types/game';
import { topRow } from '../../utils/boardStatus';

/** 対戦のはじまりのカウント：3・2・1、'go'＝はじめ！（VS の絵は 3〜1 のあいだ重ねて出す） */
export type IntroStep = 'vs' | 3 | 2 | 1 | 'go';

/** 1つの数字を出す長さ。VS の絵は VS_LEAD_MS + 3 × COUNT_MS（CSS の --vs-ms）出す */
export const COUNT_MS = 800;
export const GO_MS = 900;

/**
 * VS の絵だけを先に見せる時間。そのあと 3・2・1 を重ねる（オーナー 11-12「じっくり見る間もなく始まる」→ 1人ずつ出す案 c を選択）。
 * VS の絵が出てから はじめ！ が消えるまでで 5 秒（1700 + 3 × 800 + 900。オーナー 11-12「イントロはカウントダウン含めて５秒で良い」）
 */
export const VS_LEAD_MS = 1700;

/** VS で使う絵の URL。試合中のカットインと別に頭から流すため、URL を変えて別に読む */
const vsArtUrl = (src: string) => `${src}?vs=1`;

/**
 * VS の絵を先に読み込む。絵は外のサーバーから読むので、届く順は毎回違う。
 * 自分の絵が遅れると自分の側が空のまま入り、相手が先に出たように見える（11-12 オーナー「稀に cpu から先に入る」）ので、
 * 2人とも届いてから始める。届かないときも timeoutMs で始める
 */
export const preloadVsArt = (srcs: (string | undefined)[], timeoutMs = 2500): Promise<void> =>
  Promise.race([
    Promise.all(srcs.filter((src): src is string => !!src).map(src => new Promise<void>(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = vsArtUrl(src);
    }))).then(() => undefined),
    new Promise<void>(resolve => window.setTimeout(resolve, timeoutMs))
  ]);

/**
 * 「咲耶 VS 宇迦」：自分のキャラを左（スマホは上）、相手を右（スマホは下）に、名前の文字は出さず絵だけで
 * 必殺カットインの絵で斜めに切って並べる。相手の絵は左右反転して、向かい合わせにする。
 * カットインは試合中にも頭から流すので、ここでは URL を変えて別に読む（同じ URL だと試合中に頭から再生されないことがある）
 */
const VsSplash: React.FC<{ player: CpuCharacter; cpu: CpuCharacter }> = ({ player, cpu }) => (
  <div
    className="vs-splash absolute inset-0"
    style={{ '--vs-ms': `${VS_LEAD_MS + 3 * COUNT_MS}ms` } as React.CSSProperties}
  >
    <div className="vs-half vs-half-a">
      {player.cutins[0] && <img src={vsArtUrl(player.cutins[0])} alt="" className="vs-art" />}
    </div>
    <div className="vs-half vs-half-b">
      {cpu.cutins[0] && <img src={vsArtUrl(cpu.cutins[0])} alt="" className="vs-art vs-art-flip" />}
    </div>
    <div className="vs-slash" />
    <div className="vs-mark">VS</div>
  </div>
);

/**
 * はじまりの演出。ゲームの黒い枠（.puyo-vs）いっぱいに重ねる（オーナー 11-13「黒い枠までいっぱいに」）。
 * スマホでは枠が画面より縦に長いので、絵とカウントは .vs-stage に入れて画面に見えている高さに収める（puyoAnimations.css）。
 * showVs のときは VS の絵の上にカウントを重ねる
 */
export const VsIntroOverlay: React.FC<{ step: IntroStep | null; showVs: boolean; player: CpuCharacter; cpu: CpuCharacter }> = ({ step, showVs, player, cpu }) => {
  if (step === null) return null;
  return (
    <div
      className={`vs-intro ${showVs ? 'vs-intro-dark' : ''}`}
      style={{ '--header-offset': `${HEADER_OFFSET}px` } as React.CSSProperties}
      aria-live="polite"
    >
      <div className="vs-stage">
        {showVs && <VsSplash player={player} cpu={cpu} />}
        <div className="absolute inset-0 flex items-center justify-center">
          {step !== 'vs' && (
            <div key={String(step)} className={`vs-count ${showVs ? 'vs-count-on-vs' : ''} ${step === 'go' ? 'vs-count-go' : ''}`}>
              {step === 'go' ? 'はじめ！' : step}
            </div>
          )}
        </div>
      </div>
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
