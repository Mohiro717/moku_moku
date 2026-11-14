import React, { useEffect } from 'react';
import { CPU_CHARACTERS, characterById } from '../../constants/cpuCharacters';
import { preloadVsArt } from './VsIntro';
import './hanafuda.css';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  /** 選んだ顔の輪の色（自分＝紅、相手＝藍）。どちらを選んでいる画面か目で分かるように */
  tone?: 'me' | 'you';
  /** ほかの画面で選んだキャラに付ける小さな札（例：自分のキャラに「じぶん」） */
  markId?: string;
  markLabel?: string;
}

// 案3b の色。選んだ顔は色の輪と藍の影、名前は墨の札（金の内線）
const RING = { me: '#e04a36', you: '#2b2f6b' };

/** ぬばたま落とし：16人の顔を並べて1人を選ぶ（自分えらび・相手えらびで使う） */
export const CharacterPicker: React.FC<Props> = ({ selectedId, onSelect, tone = 'me', markId, markLabel }) => {
  // 選んだキャラの VS の絵を先に読んでおく（たいせんを押してから絵が届くまでの待ちを減らす）
  useEffect(() => {
    void preloadVsArt([characterById(selectedId)?.cutins[0]]);
  }, [selectedId]);
  return (
    <div className="hf-panel p-3 mb-5">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-x-2 gap-y-3">
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
                className="w-14 h-14 rounded-full object-cover bg-[#131320] border-[2.5px] border-[#221a1f]"
                style={selected ? { boxShadow: `0 0 0 3px ${RING[tone]}, 0 0 0 5px #221a1f, 4px 5px 0 5px #2b2f6b` } : undefined}
              />
              <span className={`mt-1.5 text-xs font-serif whitespace-nowrap px-1.5 rounded-full ${selected ? 'hf-chip-sumi' : 'text-[#221a1f]'}`}>{c.name}</span>
              {markId === c.id && markLabel && (
                <span className="absolute -top-1 -left-1 hf-chip hf-chip-beni !px-1.5 !py-0 !text-[11px]">{markLabel}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
