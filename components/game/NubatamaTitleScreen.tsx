import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KitanCredit } from './CpuCharacter';
import { FANWORKS_URL } from '../../constants/cpuCharacters';
import { TitleChainDemo } from './TitleChainDemo';
import { TitleHanafudaOdori } from './title/TitleHanafudaOdori';
import { NubatamaLoading } from './title/NubatamaLoading';
import { TITLE_CSS } from './title/common';
import { isBgmWaitingForGesture, isMuted, playMenuBgm, playWaitingBgm, primeBgm, setMuted, unlockAudio } from '../../utils/gameAudio';
import { MENU_BGM } from '../../constants/bgmTracks';
import { IS_STANDALONE } from '../../constants/layout';
import { FullscreenChip } from './FullscreenChip';
import './wapop.css';
import './hanafuda.css';

// ぬばたま落としのタイトル画面。流れは
//   OP（咲耶 OP 編集 v9・30.6秒・BGM「月祭りの夜」つき。オーナー 11-16 に H3 の T3 から差し替え）
//   → 読み込み画面（NubatamaLoading）→ タイトル（コードで組んだ案3b・ボタンつき）
// （オーナー 11-16「リロードしたら再度OP流れるように。OP→読み込み画面→タイトル画面」。
//   前は 読み込み → OP → 見本れんさ → タイトル で、2回目からは OP を飛ばしていた）
// OP はページを開く（リロードする）たびに1回流す。遊んでからタイトルに戻ったときは流さない（opPlayedThisLoad）。
// タイトルは動画ではなくコードで組む（オーナー 11-13「キャラは咲耶のみ。鬼火とぬばたまは出したい。フワフワ上下運動をループ」
// → 案3b「花札ポップ・踊る題字」を採用）。部品は components/game/title/。
// 見本れんさ（TitleChainDemo）は「あそびかた」で見る。おと・あそびかた・クレジット・権利表記は枠の外に出さない
// （オーナー 11-13「黒い枠の下に出ているのが気になる。一体にしたい。もどる、OPをみるはいらない」）。
// PC は画の上（右上の隅と左下）、スマホは枠の中の下の帯。
// OP を差し替えるときはファイル名も新しくする。同じ名前で中身だけ替えると、ブラウザやスマホが前の動画を使い回すことがある
const OP_VIDEO = `${import.meta.env.BASE_URL}video/nubatama_op_v9.mp4`;

type Phase = 'op' | 'loading' | 'demo' | 'title';

/** このページ読み込みで OP を流したか。リロードで消えるので、リロードのたびに OP から */
let opPlayedThisLoad = false;

/** 案3b を外枠いっぱいに敷く（外枠の角丸・影は外側の枠が持つ） */
const FILL_FRAME = { '--tt-w': '100%', borderRadius: 0, boxShadow: 'none' } as unknown as React.CSSProperties;

interface Props {
  onVsCpu: () => void;
  onSingle: () => void;
}

/** おと・あそびかた・クレジットの小さなボタン（月白・墨。ほかの画面と同じ hanafuda.css の .hf-chip） */
const CHIP = 'hf-chip';

/** 権利表記を絵の上に直に置くときの縁どり（墨）。金の霞や墨の丘の上でも読める */
const OUTLINE = { textShadow: '1px 1px 0 #0b0b12, -1px -1px 0 #0b0b12, 1px -1px 0 #0b0b12, -1px 1px 0 #0b0b12, 0 0 3px #0b0b12' };


export const NubatamaTitleScreen: React.FC<Props> = ({ onVsCpu, onSingle }) => {
  const [phase, setPhase] = useState<Phase>(() => (opPlayedThisLoad ? 'title' : 'op'));
  const [muted, setMutedState] = useState(isMuted);
  const [showCredits, setShowCredits] = useState(false);
  const opRef = useRef<HTMLVideoElement>(null);

  // OP は曲つき。カードのボタンを押した直後に開いたときは、そのまま音つきで流せる。
  // URL を開いた直後（まだ画面に触っていない）はブラウザが音つきの自動再生を断る。そのときは音なしで流さず、
  // 「▶ はじめる」を出して、押した操作の中で音つきで始める（オーナー 11-16「スマホ版 最初音出ない」。
  // 前は音なしに落として流していたので、スマホでは OP もその後のタイトル曲も無音だった）。音を消す設定なら最初から音なし
  const [needsTap, setNeedsTap] = useState(false);
  useEffect(() => {
    if (phase !== 'op') return;
    opPlayedThisLoad = true;
    const video = opRef.current;
    if (!video) return;
    video.currentTime = 0;
    if (isMuted()) {
      video.muted = true;
      video.play().catch(() => setPhase('loading'));
      return;
    }
    video.muted = false;
    video.play().catch(() => setNeedsTap(true));
  }, [phase]);

  const startOp = () => {
    unlockAudio();
    primeBgm(MENU_BGM.title);
    setNeedsTap(false);
    const video = opRef.current;
    if (!video) return;
    video.muted = isMuted();
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => setPhase('loading'));
    });
  };

  // タイトル曲。OP は自分の音を持っているので、OP が終わって読み込み画面・タイトルに来てから鳴らす
  useEffect(() => {
    if (phase !== 'op') playMenuBgm(MENU_BGM.title);
  }, [phase]);

  const toTitle = useCallback(() => setPhase('title'), []);
  const endOp = () => setPhase('loading');

  const toggleSound = () => {
    unlockAudio();
    // 音ありの設定なのに、ブラウザに止められて鳴っていない（URL を開いて最初の操作の前。OP は音なしに落としている）。
    // 🔊 を押した人は音を聞きたいので、消さずに鳴らす（2026-11-16 まで消音になり、もう一度押すまで無音だった）
    const op = opRef.current;
    if (!muted && (isBgmWaitingForGesture() || op?.muted)) {
      playWaitingBgm();
      if (op) op.muted = false;
      return;
    }
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (opRef.current) opRef.current.muted = next;
  };

  const playing = phase === 'op' || phase === 'demo';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <style>{TITLE_CSS}</style>
      {/* 色調 B「夜の花札」（オーナー 11-15）：外枠は墨、スマホの下の帯は宵闇の深いところ、画の下地は宵闇 */}
      <div className="overflow-hidden rounded-3xl border-[3px] border-[#0b0b12] shadow-[0_6px_0_#0b0b12] bg-[#131320]">
      <div className="relative bg-[#1b1b2e]">
        {/* タイトル（案3b）。OP の下で先に動かしておき、見本の背景にもなる。
            PC はボタンを画の右下（題字の下）に重ねる。スマホは字が小さくなるので画の下に出す */}
        <TitleHanafudaOdori
          onVsCpu={onVsCpu}
          onSingle={onSingle}
          showButtons={phase === 'title'}
          buttonsClassName="hidden sm:block"
          style={FILL_FRAME}
          paused={phase === 'op'}
        />

        {phase === 'op' && (
          <video
            ref={opRef}
            src={OP_VIDEO}
            width={864}
            height={480}
            playsInline
            preload="auto"
            onEnded={endOp}
            onClick={endOp}
            className="absolute inset-0 z-10 block w-full h-full cursor-pointer bg-[#131320]"
            aria-label="ぬばたま落とし オープニング"
          />
        )}

        {phase === 'op' && needsTap && (
          <button
            type="button"
            onClick={startOp}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-[#131320]/55 font-serif"
            aria-label="オープニングをはじめる（おとが でます）"
          >
            <span className="hf-btn hf-btn-main hf-dot px-6 py-3 text-base sm:text-lg">▶ はじめる</span>
            <span className="text-xs text-[#e8e4d8]/80">おとが でます</span>
          </button>
        )}

        {phase === 'demo' && <TitleChainDemo onDone={toTitle} />}

        {phase === 'loading' && <NubatamaLoading onComplete={toTitle} />}

        {playing && (
          <button
            type="button"
            onClick={phase === 'op' ? endOp : toTitle}
            className="absolute top-3 right-3 z-30 rounded-full bg-black/25 px-3 py-1 text-xs font-serif text-white"
          >
            とばす ▶▶
          </button>
        )}

        {/* PC：おと・あそびかた・クレジットは画の右上の隅、権利表記は左下に、画の上へ直に置く
            （オーナー 11-13 帯は「シームレスじゃない」→ 見本 A〜C から「A 右上の隅」） */}
        {phase === 'title' && (
          <>
            <div className="hidden sm:flex absolute z-20 top-[2.5%] right-[1.6%] items-center gap-1.5 whitespace-nowrap">
              <button type="button" onClick={toggleSound} aria-pressed={!muted} className={CHIP}>{muted ? '🔇 おと' : '🔊 おと'}</button>
              <button type="button" onClick={() => setPhase('demo')} className={CHIP}>あそびかた</button>
              <button type="button" onClick={() => setShowCredits(true)} className={CHIP}>クレジット</button>
              {IS_STANDALONE && <FullscreenChip className={CHIP} />}
            </div>
            <div className="hidden sm:block absolute z-20 left-[1.6%] bottom-[1.2%]" style={OUTLINE}>
              <KitanCredit url={FANWORKS_URL} className="text-[#e8e4d8]" />
            </div>
          </>
        )}

        {showCredits && <Credits onClose={() => setShowCredits(false)} />}
      </div>

      {/* スマホだけの下の帯（黒い枠の一部）。画が小さく、画の中だと字が読めず指で押しにくいので、ここに大きく並べる */}
      <div className="sm:hidden px-3 py-2.5">
        <div className={`sm:hidden grid grid-cols-2 gap-3 mb-2.5 transition-opacity duration-300 ${phase === 'title' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button type="button" onClick={onVsCpu} className="hf-btn hf-btn-main hf-dot w-full py-3 px-2 text-sm !tracking-normal">
            CPUと たいせん
          </button>
          <button type="button" onClick={onSingle} className="hf-btn hf-btn-sub hf-dot w-full py-3 px-2 text-sm !tracking-normal">
            ひとりで あそぶ
          </button>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-x-4 gap-y-2">
          <KitanCredit url={FANWORKS_URL} className="text-[#e8e4d8]/75 text-center sm:text-left leading-snug" />
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={toggleSound} aria-pressed={!muted} className={CHIP}>
              {muted ? '🔇 おと' : '🔊 おと'}
            </button>
            <button type="button" onClick={() => setPhase('demo')} disabled={phase === 'demo'} className={CHIP}>
              あそびかた
            </button>
            <button type="button" onClick={() => setShowCredits(true)} className={CHIP}>
              クレジット
            </button>
            {IS_STANDALONE && <FullscreenChip className={CHIP} />}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

/** 権利表記。公式と誤認させない（二次創作の掟）・声が公式の音声ではないことを明記する */
const Credits: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="absolute inset-0 z-40 bg-[#0b0b12]/60 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
    <div
      className="hf-panel max-h-full overflow-y-auto p-4 sm:p-5 text-left text-xs sm:text-sm font-serif leading-relaxed space-y-2"
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-label="クレジット"
    >
      <p className="font-bold">
        本作は『月蝕綺譚 -Luna Occulta-』（『CryptoNinja』外伝）の非公式の二次創作です。公式とは関係ありません。
      </p>
      <p>キャラクター・楽曲の権利は、原作の権利者に帰属します。</p>
      <ul className="space-y-0.5">
        <li>キャラクター画像・対戦のBGM：『月蝕綺譚』公式素材（公式サイトから表示・再生）</li>
        <li>タイトル・キャラえらびのBGM：自作</li>
        <li>ボイス：AI音声合成（Irodori-TTS）でつくった声です。公式の音声・声優ではありません</li>
        <li>OPの動画：AI動画生成（MiniMax H3）</li>
        <li>効果音：自作</li>
        <li>タイトル画面の咲耶の絵・ゲーム制作：Mohiro（もくもくハウス）</li>
      </ul>
      <p>
        <a href={FANWORKS_URL} target="_blank" rel="noopener noreferrer" className="underline">
          二次創作ガイドライン
        </a>
        　#月蝕綺譚
      </p>
      <div className="flex justify-center pt-1">
        <button type="button" onClick={onClose} className="hf-btn hf-btn-main hf-btn-sm px-5 py-1.5 text-sm">
          とじる
        </button>
      </div>
    </div>
  </div>
);
