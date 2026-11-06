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

const PANEL_CLASS = 'flex items-center gap-3 rounded-xl p-3 mb-4';
const PANEL_STYLE: React.CSSProperties = { backgroundColor: YOIYAMI, boxShadow: '0 4px 14px rgba(19,19,32,0.35)' };

/**
 * 自分の盤面の上に置く札。相手の札と同じ形にして、左右の盤面の上端をそろえる。
 * 相手の札は台詞の長さで高さが変わるので、minHeight に相手の札の高さを渡す
 */
export const PlayerPanel: React.FC<{ minHeight?: number }> = ({ minHeight }) => (
  <div className={PANEL_CLASS} style={{ ...PANEL_STYLE, minHeight }}>
    <div
      className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center font-serif text-lg"
      style={{ boxShadow: `0 0 0 2px ${KINDEI}`, color: KINDEI }}
    >
      YOU
    </div>
    <div className="min-w-0 flex-1 text-left">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-lg" style={{ color: KINDEI }}>あなた</span>
        <span className="text-xs" style={{ color: SUBLABEL }}>YOUR FIELD</span>
      </div>
      <p className="mt-1 rounded-lg px-3 py-2 text-xs leading-snug" style={{ backgroundColor: BUBBLE, color: SUBLABEL }}>
        ← → 移動　Z / X 回転　↓ 速く　Space 落とす
      </p>
    </div>
  </div>
);

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
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-2xl">
      <img
        key={cutin.id}
        src={cutin.src}
        alt={`${name}の必殺カットイン`}
        className="w-[125%] max-w-none"
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
