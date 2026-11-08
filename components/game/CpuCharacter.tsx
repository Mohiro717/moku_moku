import React from 'react';
import type { CpuCharacter } from '../../constants/cpuCharacters';
import type { CpuCutin } from '../../hooks/game/useCpuCharacterReactions';

// 月蝕綺譚のトンマナ「宵闇に金」に寄せた色。対戦相手の札の中だけで使う
const YOIYAMI = '#131320';
const KINDEI = '#D9A94C';
const GEPPAKU = '#E8E4D8';
const BUBBLE = '#181626';
const SUBLABEL = '#9D93B5';

interface PanelProps {
  character: CpuCharacter;
  line: string;
}

// 相手の札：墨の太線とずらした影（和ポップ）に、月蝕綺譚の宵闇に金
const PANEL_CLASS = 'flex items-center gap-3 rounded-2xl p-3 border-[3px] border-coffee-dark shadow-[0_4px_0_#3b2f2f]';
const PANEL_STYLE: React.CSSProperties = { backgroundColor: YOIYAMI };

/** CPU 盤面の上に置く、相手キャラの顔・名前・台詞 */
export const CpuCharacterPanel = React.forwardRef<HTMLDivElement, PanelProps>(({ character, line }, ref) => (
  <div ref={ref} className={PANEL_CLASS} style={PANEL_STYLE}>
    <img
      src={character.icon}
      alt={character.name}
      width={64}
      height={64}
      className="w-16 h-16 shrink-0 rounded-full object-cover"
      style={{ boxShadow: `0 0 0 2px ${KINDEI}` }}
    />
    <div className="min-w-0 flex-1 text-left">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-lg" style={{ color: KINDEI }}>{character.name}</span>
        <span className="text-xs" style={{ color: SUBLABEL }}>{character.tagline}</span>
      </div>
      <p
        key={line}
        className="mt-1 rounded-lg px-3 py-2 text-sm leading-snug font-serif animate-fade-in-up"
        style={{ backgroundColor: BUBBLE, color: GEPPAKU }}
      >
        「{line}」
      </p>
    </div>
  </div>
));
CpuCharacterPanel.displayName = 'CpuCharacterPanel';

/** CPU の大連鎖で盤面に重ねる必殺カットイン */
export const CpuCutinOverlay: React.FC<{ cutin: CpuCutin | null; name: string }> = ({ cutin, name }) => {
  if (!cutin) return null;
  return (
    <div key={cutin.id} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-2xl">
      {/* 暗転と流れる線の上に、斜めに切り込んで入る */}
      <div className="cutin-dim absolute inset-0" />
      <div className="cutin-lines absolute inset-0" />
      <img
        src={cutin.src}
        alt={`${name}の必殺カットイン`}
        className="cutin-slash relative w-[125%] max-w-none"
      />
    </div>
  );
};

/** 二次創作であることの表示（掟: 公式と誤認させない） */
export const KitanCredit: React.FC<{ url: string }> = ({ url }) => (
  <p className="mt-2 text-[11px] text-coffee-dark/60">
    CPU のキャラクター：
    <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
      『月蝕綺譚 -Luna Occulta-』
    </a>
    （非公式の二次創作です）#月蝕綺譚
  </p>
);
