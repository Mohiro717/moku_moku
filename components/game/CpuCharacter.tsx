import React from 'react';
import type { CpuCharacter } from '../../constants/cpuCharacters';
import type { CpuCutin } from '../../hooks/game/useCpuCharacterReactions';
import { MoodIcon, type Mood } from './VsIntro';

interface PanelProps {
  character: CpuCharacter;
  line: string;
  /** 顔の様子（対戦のときだけ。無ければ止まった顔） */
  mood?: Mood;
}

interface SmallPanelProps extends PanelProps {
  /** 自分の側（名前を紅に）。既定は自分の側 */
  accent?: boolean;
  /** 台詞を2行ぶんの高さに固定する（自分と相手の欄の大きさを、台詞の長さによらずそろえる） */
  even?: boolean;
}

// 相手の台詞＝生成りの面に墨の縁・藍の影（案3b。hanafuda.css の .hf-bubble）
const PANEL_CLASS = 'hf-bubble flex items-center gap-3 px-3 py-2';

/** CPU 盤面の上に置く、相手キャラの顔・名前・台詞 */
export const CpuCharacterPanel = React.forwardRef<HTMLDivElement, PanelProps>(({ character, line, mood }, ref) => (
  <div ref={ref} className={PANEL_CLASS}>
    {mood ? (
      <MoodIcon src={character.icon} alt={character.name} mood={mood} className="w-16 h-16" />
    ) : (
      <img
        src={character.icon}
        alt={character.name}
        width={64}
        height={64}
        className="w-16 h-16 shrink-0 rounded-full object-cover border-[3px] border-[#0b0b12]"
        style={{ boxShadow: '0 0 0 3px #d9a94c' }}
      />
    )}
    <div className="min-w-0 flex-1 text-left">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-lg">{character.name}</span>
        <span className="text-xs opacity-75">{character.tagline}</span>
      </div>
      <p key={line} className="mt-1 text-sm leading-snug font-serif animate-fade-in-up">
        「{line}」
      </p>
    </div>
  </div>
));
CpuCharacterPanel.displayName = 'CpuCharacterPanel';

/** スマホ・タブレット用：自分の側（あるじどのの味方）の顔と台詞。相手より小さく、名前は紅。
 *  単独サイトのスマホは、相手の欄もこの小さい形にして2つをそろえる（accent=false・even。オーナー 11-18
 *  「大きさの違いがもやもや」→「メッセージらんを小さくしたい。盤面を小さくするとUXの不満がたまりそう」） */
export const AllyCharacterPanel: React.FC<SmallPanelProps> = ({ character, line, mood, accent = true, even = false }) => (
  <div className="hf-bubble flex items-center gap-2 px-2 py-1">
    {mood ? (
      <MoodIcon src={character.icon} alt={character.name} mood={mood} className={even ? 'w-11 h-11' : 'w-12 h-12'} />
    ) : (
      <img
        src={character.icon}
        alt={character.name}
        width={40}
        height={40}
        className="w-10 h-10 shrink-0 rounded-full object-cover border-[3px] border-[#0b0b12] bg-[#131320]"
      />
    )}
    <p key={line} className={`min-w-0 flex-1 text-left text-xs leading-snug font-serif animate-fade-in-up ${even ? 'min-h-[2.75em]' : ''}`}>
      <span className={`mr-1 ${accent ? 'text-[#c93a2e]' : 'font-bold'}`}>{character.name}</span>「{line}」
    </p>
  </div>
);

/** 大連鎖で盤面に重ねる必殺カットイン。盤面の枠（.hf-board）をぴったり覆うので、角の丸みも枠と同じにする。side を渡すと、どちらの側のカットインか札を出す（同キャラ戦で見分けるため） */
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
          className={`cutin-dim hf-chip absolute top-2 ${side === 'player' ? 'hf-chip-beni left-2' : 'right-2'}`}
        >
          {side === 'player' ? 'じぶん' : 'あいて'}
        </span>
      )}
    </div>
  );
};

/** 二次創作であることの表示（掟: 公式と誤認させない） */
export const KitanCredit: React.FC<{ url: string; className?: string }> = ({ url, className = 'mt-2 hf-ink' }) => (
  <p className={`text-xs ${className}`}>
    キャラクター：
    <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
      『月蝕綺譚 -Luna Occulta-』
    </a>
    （非公式の二次創作です）#月蝕綺譚
  </p>
);
