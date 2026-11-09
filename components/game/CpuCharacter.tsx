import React from 'react';
import type { CpuCharacter } from '../../constants/cpuCharacters';
import type { CpuCutin } from '../../hooks/game/useCpuCharacterReactions';

interface PanelProps {
  character: CpuCharacter;
  line: string;
}

// 相手の台詞＝絵巻（左右に木の軸、和紙の地。wapop.css の .wp-emaki）
const PANEL_CLASS = 'wp-emaki flex items-center gap-3 px-3 py-2';

/** CPU 盤面の上に置く、相手キャラの顔・名前・台詞 */
export const CpuCharacterPanel = React.forwardRef<HTMLDivElement, PanelProps>(({ character, line }, ref) => (
  <div ref={ref} className={PANEL_CLASS}>
    <img
      src={character.icon}
      alt={character.name}
      width={64}
      height={64}
      className="w-16 h-16 shrink-0 rounded-full object-cover border-[3px] border-coffee-dark"
      style={{ boxShadow: '0 0 0 3px var(--wp-sakura)' }}
    />
    <div className="min-w-0 flex-1 text-left">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-lg text-coffee-dark">{character.name}</span>
        <span className="text-xs text-coffee-dark/60">{character.tagline}</span>
      </div>
      <p key={line} className="mt-1 text-sm leading-snug font-serif text-coffee-dark animate-fade-in-up">
        「{line}」
      </p>
    </div>
  </div>
));
CpuCharacterPanel.displayName = 'CpuCharacterPanel';

/** スマホ・タブレット用：自分の側（あるじどのの味方）の顔と台詞。相手の絵巻より小さく、桜色の地 */
export const AllyCharacterPanel: React.FC<PanelProps> = ({ character, line }) => (
  <div className="flex items-center gap-2 px-2 py-1 rounded-2xl border-[3px] border-coffee-dark bg-[#fde7ee] shadow-[0_3px_0_#3b2f2f]">
    <img
      src={character.icon}
      alt={character.name}
      width={40}
      height={40}
      className="w-10 h-10 shrink-0 rounded-full object-cover border-[3px] border-coffee-dark bg-[#131320]"
    />
    <p key={line} className="min-w-0 flex-1 text-left text-xs leading-snug font-serif text-coffee-dark animate-fade-in-up">
      <span className="mr-1 text-coffee-dark/70">{character.name}</span>「{line}」
    </p>
  </div>
);

/** 大連鎖で盤面に重ねる必殺カットイン。盤面の枠（.wp-board）をぴったり覆うので、角の丸みも枠と同じにする。side を渡すと、どちらの側のカットインか札を出す（同キャラ戦で見分けるため） */
export const CpuCutinOverlay: React.FC<{ cutin: CpuCutin | null; name: string; side?: 'player' | 'cpu' }> = ({ cutin, name, side }) => {
  if (!cutin) return null;
  return (
    <div key={cutin.id} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-[1.25rem]">
      {/* 暗転と流れる線の上に、斜めに切り込んで入る */}
      <div className="cutin-dim absolute inset-0" />
      <div className="cutin-lines absolute inset-0" />
      <img
        src={cutin.src}
        alt={`${name}の必殺カットイン`}
        className="cutin-slash relative w-[125%] max-w-none"
      />
      {side && (
        <span
          className={`cutin-dim wp-tag absolute top-2 ${side === 'player' ? 'left-2' : 'right-2'}`}
          style={{ background: side === 'player' ? 'var(--wp-sakura)' : 'var(--wp-washi)', color: side === 'player' ? '#fff' : undefined }}
        >
          {side === 'player' ? 'じぶん' : 'あいて'}
        </span>
      )}
    </div>
  );
};

/** 二次創作であることの表示（掟: 公式と誤認させない） */
export const KitanCredit: React.FC<{ url: string }> = ({ url }) => (
  <p className="mt-2 text-[11px] text-coffee-dark/60">
    キャラクター：
    <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
      『月蝕綺譚 -Luna Occulta-』
    </a>
    （非公式の二次創作です）#月蝕綺譚
  </p>
);
