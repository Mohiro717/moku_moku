import React from 'react';
import { Puyo } from './Puyo';
import { KitanCredit } from './CpuCharacter';
import { CPU_CHARACTERS, FANWORKS_URL, characterById } from '../../constants/cpuCharacters';
import './wapop.css';
import { HfFrame, HfTitle } from './HanafudaUi';

// ゲームえらびの「ぬばたま落とし」カード（オーナー 11-10 の選択「B 飛び出す咲耶」）。
// カードの上の縁から咲耶の顔が飛び出し、ふきだしで誘う。顔は公式の素材蔵から直接読む（同梱しない）。
// 見た目は案3b（題字・傾いた花札。オーナー 11-14「他の画面全てを統一したい」）。色は 11-15 から色調 B「夜の花札」（宵闇の地）
const SAKUYA = characterById('sakuya');

interface Props {
  onPlay: () => void;
}

/** タイトルと同じ英字の副題（金の点線で挟む） */
const Subtitle: React.FC = () => (
  <div className="mt-1 flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-['Potta_One'] hf-ink">
    <span className="w-8 border-t-2 border-dotted border-[#d9a94c]" />NUBATAMA OTOSHI<span className="w-8 border-t-2 border-dotted border-[#d9a94c]" />
  </div>
);

/** 16人の顔を少し重ねて並べる */
const Roster: React.FC<{ max?: number }> = ({ max = CPU_CHARACTERS.length }) => {
  const shown = CPU_CHARACTERS.slice(0, max);
  const rest = CPU_CHARACTERS.length - shown.length;
  return (
    <div className="flex items-center justify-center -space-x-2">
      {shown.map(c => (
        <img key={c.id} src={c.icon} alt={c.name} title={c.name} loading="lazy"
          className="w-8 h-8 rounded-full object-cover bg-[#e8e4d8] border-2 border-[#0b0b12]" />
      ))}
      {rest > 0 && (
        <span className="w-8 h-8 rounded-full grid place-items-center text-xs font-serif bg-[#0b0b12] text-[#e8e4d8] border-2 border-[#0b0b12]">
          +{rest}
        </span>
      )}
    </div>
  );
};

const Rules: React.FC = () => (
  <div className="hf-panel p-3 text-xs font-serif space-y-1 text-left">
    <p>おなじ色を <span className="text-[#c93a2e]">4つ</span> つなげて きえる。つづけて きえると <span className="text-[#c93a2e]">れんさ</span>！</p>
    <p className="hidden sm:flex flex-wrap gap-x-3 opacity-75">
      {['←→ うごかす', 'Z / X まわす', '↓ はやく', 'Space おとす'].map(k => <span key={k} className="whitespace-nowrap">{k}</span>)}
    </p>
    <p className="sm:hidden opacity-75">スワイプで うごかす・タップで まわす</p>
  </div>
);

const PlayButton: React.FC<{ onPlay: () => void }> = ({ onPlay }) => (
  <button type="button" onClick={onPlay} className="hf-btn hf-btn-main hf-dot w-full py-3 text-base mt-auto">
    あそぶ！
  </button>
);

export const NubatamaCard: React.FC<Props> = ({ onPlay }) => (
  <HfFrame decor="lively" className="wp-zone mt-14 animate-fade-in-up px-5 pb-5 pt-20 flex flex-col gap-4">
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#e8e4d8] border-[3px] border-[#0b0b12] shadow-[5px_5px_0_#c93a2e] overflow-hidden">
      <img src={SAKUYA.icon} alt={SAKUYA.name} loading="lazy" className="w-full h-full object-cover wp-bob" />
    </div>
    <span className="absolute -top-4 right-3 hf-chip rotate-6 wp-bob" style={{ animationDelay: '0.4s' }}>
      いっしょに あそぼ！
    </span>
    <div>
      <HfTitle text="ぬばたま落とし" hop gold={[4]} as="h3" className="text-[2rem] text-center" />
      <Subtitle />
    </div>
    <div className="flex justify-center gap-1" aria-hidden="true">
      {(['red', 'yellow', 'green', 'blue'] as const).map(c => <Puyo key={c} color={c} idle />)}
    </div>
    <Rules />
    <Roster max={9} />
    <PlayButton onPlay={onPlay} />
    <KitanCredit url={FANWORKS_URL} className="hf-ink" />
  </HfFrame>
);

