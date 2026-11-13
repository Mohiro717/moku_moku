import React, { useEffect, useRef, useState } from 'react';
import { KitanCredit } from './CpuCharacter';
import { FANWORKS_URL } from '../../constants/cpuCharacters';
import { TitleChainDemo } from './TitleChainDemo';
import { TitleHanafudaOdori } from './title/TitleHanafudaOdori';
import { TITLE_CSS } from './title/common';
import { isMuted, setMuted, unlockAudio } from '../../utils/gameAudio';
import './wapop.css';

// ぬばたま落としのタイトル画面。流れは
//   OP（H3 の T3・8秒・声つき）→ 見本れんさ（TitleChainDemo）→ タイトル（コードで組んだ案3b・ボタンつき）
// タイトルは動画ではなくコードで組む（オーナー 11-13「キャラは咲耶のみ。鬼火とぬばたまは出したい。フワフワ上下運動をループ」
// → 案3b「花札ポップ・踊る題字」を採用）。部品は components/game/title/。
// 2回目からは OP と見本を飛ばしてタイトルから始める（見たかどうかはブラウザに覚えさせる）。
// 「OPをみる」「あそびかた」でいつでも見直せる。
const OP_VIDEO = `${import.meta.env.BASE_URL}video/nubatama_title.mp4`;
const SEEN_KEY = 'nubatama-op-seen';

type Phase = 'op' | 'demo' | 'title';

const hasSeenOp = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const markOpSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* 保存できないブラウザでは毎回 OP から */
  }
};

/** 案3b を外枠いっぱいに敷く（外枠の角丸・影は外側の枠が持つ） */
const FILL_FRAME = { '--tt-w': '100%', borderRadius: 0, boxShadow: 'none' } as unknown as React.CSSProperties;

interface Props {
  onVsCpu: () => void;
  onSingle: () => void;
  onBack: () => void;
}

export const NubatamaTitleScreen: React.FC<Props> = ({ onVsCpu, onSingle, onBack }) => {
  const [phase, setPhase] = useState<Phase>(() => (hasSeenOp() ? 'title' : 'op'));
  const [muted, setMutedState] = useState(isMuted);
  const [showCredits, setShowCredits] = useState(false);
  const opRef = useRef<HTMLVideoElement>(null);

  // OP は声つき。カードのボタンを押した直後に開くので鳴らせる。断られたら音なしで流す。音を消す設定なら最初から消す
  useEffect(() => {
    if (phase !== 'op') return;
    const video = opRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = isMuted();
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => setPhase('demo'));
    });
  }, [phase]);

  const toTitle = () => {
    markOpSeen();
    setPhase('title');
  };

  const toggleSound = () => {
    unlockAudio();
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (opRef.current) opRef.current.muted = next;
  };

  const playing = phase !== 'title';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <style>{TITLE_CSS}</style>
      <div className="relative overflow-hidden rounded-3xl border-[3px] border-coffee-dark shadow-[0_6px_0_#3b2f2f] bg-[#e04a36]">
        {/* タイトル（案3b）。OP の下で先に動かしておき、見本の背景にもなる。
            PC はボタンを画の右下（題字の下）に重ねる。スマホは字が小さくなるので画の下に出す */}
        <TitleHanafudaOdori
          onVsCpu={onVsCpu}
          onSingle={onSingle}
          showButtons={phase === 'title'}
          buttonsClassName="hidden sm:block"
          style={FILL_FRAME}
        />

        {phase === 'op' && (
          <video
            ref={opRef}
            src={OP_VIDEO}
            width={864}
            height={480}
            playsInline
            preload="auto"
            onEnded={() => setPhase('demo')}
            onClick={toTitle}
            className="absolute inset-0 z-10 block w-full h-full cursor-pointer bg-[#efe3cf]"
            aria-label="ぬばたま落とし オープニング"
          />
        )}

        {phase === 'demo' && <TitleChainDemo onDone={toTitle} />}

        {playing && (
          <button
            type="button"
            onClick={toTitle}
            className="absolute top-3 right-3 z-30 rounded-full bg-black/25 px-3 py-1 text-xs font-serif text-white"
          >
            とばす ▶▶
          </button>
        )}

        {showCredits && <Credits onClose={() => setShowCredits(false)} />}
      </div>

      {/* スマホ：画の中のボタンは字が小さく指で押しにくいので、画の下に並べる */}
      <div className={`sm:hidden grid grid-cols-2 gap-3 mt-4 transition-opacity duration-300 ${phase === 'title' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button type="button" onClick={onVsCpu} className="wp-btn wp-btn-sakura w-full py-3 text-base">
          CPUと たいせん
        </button>
        <button type="button" onClick={onSingle} className="wp-btn wp-btn-kinari w-full py-3 text-base">
          ひとりで あそぶ
        </button>
      </div>

      {/* 設定と見直しと権利表記 */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={onBack} className="wp-btn wp-btn-kinari px-5 py-1.5 text-sm">
          もどる
        </button>
        <button type="button" onClick={toggleSound} aria-pressed={!muted} className="wp-btn wp-btn-kinari px-4 py-1.5 text-sm">
          {muted ? '🔇 おと' : '🔊 おと'}
        </button>
        <button type="button" onClick={() => setPhase('demo')} disabled={phase === 'demo'} className="wp-btn wp-btn-kinari px-4 py-1.5 text-sm">
          あそびかた
        </button>
        <button type="button" onClick={() => setPhase('op')} disabled={phase === 'op'} className="wp-btn wp-btn-kinari px-4 py-1.5 text-sm">
          OPをみる
        </button>
        <button type="button" onClick={() => setShowCredits(true)} className="wp-btn wp-btn-kinari px-4 py-1.5 text-sm">
          クレジット
        </button>
      </div>
      <div className="mt-2 flex justify-center">
        <KitanCredit url={FANWORKS_URL} />
      </div>
    </div>
  );
};

/** 権利表記。公式と誤認させない（二次創作の掟）・声が公式の音声ではないことを明記する */
const Credits: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="absolute inset-0 z-40 wp-veil flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
    <div
      className="wp-card max-h-full overflow-y-auto p-4 sm:p-5 text-left text-[11px] sm:text-sm font-serif text-coffee-dark leading-relaxed space-y-2"
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-label="クレジット"
    >
      <p className="font-bold">
        本作は『月蝕綺譚 -Luna Occulta-』（『CryptoNinja』外伝）の非公式の二次創作です。公式とは関係ありません。
      </p>
      <p>キャラクター・楽曲の権利は、原作の権利者に帰属します。</p>
      <ul className="space-y-0.5">
        <li>キャラクター画像・BGM：『月蝕綺譚』公式素材（公式サイトから表示・再生）</li>
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
        <button type="button" onClick={onClose} className="wp-btn wp-btn-kinari px-5 py-1.5 text-sm">
          とじる
        </button>
      </div>
    </div>
  </div>
);
