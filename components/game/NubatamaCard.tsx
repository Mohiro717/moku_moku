import React from 'react';
import { Puyo } from './Puyo';
import { KitanCredit } from './CpuCharacter';
import { CPU_CHARACTERS, FANWORKS_URL, characterById } from '../../constants/cpuCharacters';
import './wapop.css';

// ゲームえらびの「ぬばたま落とし」カード（オーナー 11-10 の選択「B 飛び出す咲耶」）。
// カードの上の縁から咲耶の顔が飛び出し、ふきだしで誘う。顔は公式の素材蔵から直接読む（同梱しない）
const SAKUYA = characterById('sakuya');

interface Props {
  onPlay: () => void;
}

const CARD = 'wp-seigaiha rounded-3xl border-[3px] border-coffee-dark shadow-[0_6px_0_#3b2f2f] animate-fade-in-up';

/** 題字：1文字ずつ、ぷよの色の玉に乗せて、ずらしてゆらす */
const BUBBLE_COLORS = ['#fb7a7a', '#fbd23a', '#55dc86', '#6aa9fb', '#f79ab7', '#b28ae0', '#3b2f2f'];
const BubbleTitle: React.FC = () => (
  <div className="flex justify-center gap-0.5" aria-label="ぬばたま落とし">
    {[...'ぬばたま落とし'].map((ch, i) => (
      <span
        key={i}
        aria-hidden="true"
        className="wp-bob grid place-items-center w-10 h-10 rounded-full border-[3px] border-coffee-dark font-serif text-xl text-white shadow-[0_3px_0_#3b2f2f] [text-shadow:0_2px_0_rgba(59,47,47,0.45)]"
        style={{ background: BUBBLE_COLORS[i], animationDelay: `${i * 0.12}s`, rotate: `${i % 2 ? 6 : -6}deg` }}
      >
        {ch}
      </span>
    ))}
  </div>
);

const Subtitle: React.FC = () => (
  <div className="mt-2 text-[10px] tracking-[0.35em] text-coffee-dark/50 font-serif">NUBATAMA OTOSHI</div>
);

/** 16人の顔を少し重ねて並べる */
const Roster: React.FC<{ max?: number }> = ({ max = CPU_CHARACTERS.length }) => {
  const shown = CPU_CHARACTERS.slice(0, max);
  const rest = CPU_CHARACTERS.length - shown.length;
  return (
    <div className="flex items-center justify-center -space-x-2">
      {shown.map(c => (
        <img key={c.id} src={c.icon} alt={c.name} title={c.name} loading="lazy"
          className="w-8 h-8 rounded-full object-cover bg-[#fde7ee] border-2 border-coffee-dark" />
      ))}
      {rest > 0 && (
        <span className="w-8 h-8 rounded-full grid place-items-center text-[10px] font-serif bg-[#f79ab7] text-white border-2 border-coffee-dark">
          +{rest}
        </span>
      )}
    </div>
  );
};

const Rules: React.FC = () => (
  <div className="wp-card p-3 text-xs font-serif space-y-1 text-coffee-dark text-left">
    <p>おなじ色を <span className="text-[#e5598a]">4つ</span> つなげて きえる。つづけて きえると <span className="text-[#e5598a]">れんさ</span>！</p>
    <p className="hidden sm:flex flex-wrap gap-x-3 text-coffee-dark/60">
      {['←→ うごかす', 'Z / X まわす', '↓ はやく', 'Space おとす'].map(k => <span key={k} className="whitespace-nowrap">{k}</span>)}
    </p>
    <p className="sm:hidden text-coffee-dark/60">スワイプで うごかす・タップで まわす</p>
  </div>
);

const PlayButton: React.FC<{ onPlay: () => void }> = ({ onPlay }) => (
  <button type="button" onClick={onPlay} className="wp-btn wp-btn-sakura w-full py-3 text-base mt-auto">
    あそぶ！
  </button>
);

export const NubatamaCard: React.FC<Props> = ({ onPlay }) => (
  <div className={`wp-zone relative mt-14 ${CARD} px-5 pb-5 pt-20 flex flex-col gap-4`}>
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#fde7ee] border-[3px] border-coffee-dark shadow-[0_4px_0_#3b2f2f] overflow-hidden">
      <img src={SAKUYA.icon} alt={SAKUYA.name} loading="lazy" className="w-full h-full object-cover wp-bob" />
    </div>
    <span className="absolute -top-4 right-3 wp-tag rotate-6 wp-bob" style={{ animationDelay: '0.4s' }}>
      いっしょに あそぼ！
    </span>
    <div>
      <BubbleTitle />
      <Subtitle />
    </div>
    <div className="flex justify-center gap-1" aria-hidden="true">
      {(['red', 'yellow', 'green', 'blue'] as const).map(c => <Puyo key={c} color={c} idle />)}
    </div>
    <Rules />
    <Roster max={9} />
    <PlayButton onPlay={onPlay} />
    <KitanCredit url={FANWORKS_URL} className="text-coffee-dark/50" />
  </div>
);

