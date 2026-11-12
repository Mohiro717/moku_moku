import React, { useEffect } from 'react';
import { CPU_CHARACTERS, characterById } from '../../constants/cpuCharacters';
import { preloadVsArt } from './VsIntro';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  /** 顔の枠の色（自分＝桜、相手＝山吹）。どちらを選んでいる画面か目で分かるように */
  tone?: 'sakura' | 'yamabuki';
  /** ほかの画面で選んだキャラに付ける小さな札（例：自分のキャラに「じぶん」） */
  markId?: string;
  markLabel?: string;
}

const TONES = {
  sakura: { border: 'border-[#e5598a]', name: 'bg-[#f79ab7] text-white' },
  yamabuki: { border: 'border-[#d99a1e]', name: 'bg-[#f6b93b] text-coffee-dark' }
};

/** ぬばたま落とし：16人の顔を並べて1人を選ぶ（自分えらび・相手えらびで使う） */
export const CharacterPicker: React.FC<Props> = ({ selectedId, onSelect, tone = 'sakura', markId, markLabel }) => {
  // 選んだキャラの VS の絵を先に読んでおく（たいせんを押してから絵が届くまでの待ちを減らす）
  useEffect(() => {
    void preloadVsArt([characterById(selectedId)?.cutins[0]]);
  }, [selectedId]);
  const t = TONES[tone];
  return (
    <div className="wp-card p-3 mb-4">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {CPU_CHARACTERS.map(c => {
          const selected = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-pressed={selected}
              className={`relative flex flex-col items-center rounded-xl p-1 transition-transform duration-150 ${selected ? '-translate-y-1' : 'hover:-translate-y-0.5'}`}
            >
              <img
                src={c.icon}
                alt={c.name}
                width={56}
                height={56}
                loading="lazy"
                className={`w-14 h-14 rounded-full object-cover bg-[#131320] border-[3px] ${
                  selected ? `${t.border} shadow-[0_3px_0_#3b2f2f]` : 'border-coffee-dark/20'
                }`}
              />
              <span className={`mt-1 text-xs font-serif whitespace-nowrap px-1.5 rounded-full ${selected ? t.name : 'text-coffee-dark'}`}>{c.name}</span>
              {markId === c.id && markLabel && (
                <span className="absolute -top-1 -left-1 px-1 rounded-full border-2 border-coffee-dark bg-[#f79ab7] text-white text-[10px] leading-tight font-serif">
                  {markLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
