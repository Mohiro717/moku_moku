import React, { useEffect, useRef, useState } from 'react';
import { PuyoPuyoGame } from './PuyoPuyoGame';
import { PuyoVsCpuGame, DIFFICULTY_LABELS } from './PuyoVsCpuGame';
import { NubatamaTitleScreen } from './NubatamaTitleScreen';
import { CharacterPicker } from './CharacterPicker';
import { HfFrame, HfTitle } from './HanafudaUi';
import './wapop.css';
import type { GameDifficulty } from '../../types/game';
import { HEADER_OFFSET } from '../../constants/layout';
import { DEFAULT_OPPONENT_CHARACTER_ID, DEFAULT_PLAYER_CHARACTER_ID, characterById } from '../../constants/cpuCharacters';
import { playMenuBgm, stopBgm, unlockAudio } from '../../utils/gameAudio';
import { MENU_BGM } from '../../constants/bgmTracks';

// ぬばたま落としの画面の流れ（タイトル → キャラえらび → 対戦／ひとりであそぶ）。
// もくもくハウスのゲームセクションと、ぬばたま落とし単独サイト（nubatama/）の両方がこれを使う。
// 2026-11-15 に GameSection.tsx から切り出した。中身は切り出す前と同じ。
type Screen = 'title' | 'player-select' | 'solo-select' | 'difficulty-select' | 'playing-single' | 'vs-cpu';

interface NubatamaGameProps {
  /** 対戦・ひとりであそぶ の「もどる」の行き先。渡さなければタイトルへ戻る */
  onExit?: () => void;
}

export const NubatamaGame: React.FC<NubatamaGameProps> = ({ onExit }) => {
  const [screen, setScreen] = useState<Screen>('title');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('normal');
  // 相手のキャラ
  const [selectedCharacterId, setSelectedCharacterId] = useState(DEFAULT_OPPONENT_CHARACTER_ID);
  const selectedCharacter = characterById(selectedCharacterId);
  // 自分のキャラ（あるじどのの味方。CPU 対戦の最初に選ぶ）
  const [playerCharacterId, setPlayerCharacterId] = useState(DEFAULT_PLAYER_CHARACTER_ID);
  const playerCharacter = characterById(playerCharacterId);
  const exit = onExit ?? (() => setScreen('title'));

  // 画面が替わったら、ヘッダーに隠れないよう、その場所までスクロールする。
  // 2026-11-09 まで scrollIntoView + scroll-mt-20 で、PC では上端 0 に止まりヘッダーの下に隠れていた。原因は2つ:
  // ・CDN 版 Tailwind はクラスが DOM に出てから CSS を作るので、出た直後のスクロールに scroll-mt-20 が間に合わない
  // ・animate-fade-in-up の途中（下にずれた位置）で測るので、動きが終わると上にずれる
  // offsetTop はどちらの影響も受けないので、それで位置を出して、ヘッダーぶん引く
  const playAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let y = 0;
    for (let el: HTMLElement | null = playAreaRef.current; el; el = el.offsetParent as HTMLElement | null) y += el.offsetTop;
    if (playAreaRef.current) window.scrollTo({ top: Math.max(0, y - HEADER_OFFSET), behavior: 'smooth' });
  }, [screen]);

  // キャラえらびの BGM（自分えらび → 相手えらび は同じ曲のまま続ける）。タイトル曲は NubatamaTitleScreen が鳴らし、
  // 対戦・ひとりであそぶ は始まるときにキャラのテーマ曲へ替わる。ぬばたま落としを出たら止める（もくもくハウスのカード一覧へ戻るとき）
  useEffect(() => {
    if (screen === 'player-select' || screen === 'solo-select' || screen === 'difficulty-select') playMenuBgm(MENU_BGM.select);
  }, [screen]);
  useEffect(() => () => stopBgm(), []);

  /** 試合に入る。キャラえらびの曲を止めてから（試合の曲は はじまりの演出のあとに鳴る） */
  const startPlay = (next: 'playing-single' | 'vs-cpu') => {
    unlockAudio();
    stopBgm();
    setScreen(next);
  };

  if (screen === 'title') {
    return (
      <div ref={playAreaRef} className="wp-zone" data-fit="menu">
        <NubatamaTitleScreen onVsCpu={() => setScreen('player-select')} onSingle={() => setScreen('solo-select')} />
      </div>
    );
  }

  if (screen === 'player-select' || screen === 'solo-select') {
    // 自分のキャラえらび。CPU 対戦は 1/2（つぎに相手えらび）、ひとりであそぶは これだけで はじまる
    return (
      <div ref={playAreaRef} data-fit="menu" className="wp-zone transition-all duration-500 animate-fade-in-up">
        <HfFrame decor="lively" className="px-4 py-5 sm:p-7 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            {screen === 'player-select' && <span className="hf-chip">1 / 2</span>}
            <HfTitle text="じぶんを えらぶ" hop className="text-[1.75rem] sm:text-4xl" />
          </div>
          <p className="hf-ink text-xs sm:text-sm font-serif mb-4 leading-relaxed">
            {screen === 'player-select'
              ? 'いっしょに たたかう 御霊を ひとり よぶ（だれを えらんでも つよさは おなじ）'
              : 'いっしょに あそぶ 御霊を ひとり よぶ（よこで しゃべって、れんさで かけごえ）'}
          </p>

          <CharacterPicker selectedId={playerCharacterId} onSelect={setPlayerCharacterId} tone="me" />

          <p className="mb-6 font-serif flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="hf-chip hf-chip-sumi">じぶん：{playerCharacter.name}</span>
            <span className="hf-ink text-xs">{playerCharacter.tagline}</span>
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => (screen === 'player-select' ? setScreen('difficulty-select') : startPlay('playing-single'))}
              className="hf-btn hf-btn-main hf-dot w-full max-w-xs py-3 text-lg"
            >
              {screen === 'player-select' ? 'つぎへ' : 'あそぶ！'}
            </button>
            <button type="button" onClick={() => setScreen('title')} className="hf-btn hf-btn-sub hf-dot w-full max-w-xs py-2 text-sm">
              もどる
            </button>
          </div>
        </HfFrame>
      </div>
    );
  }

  if (screen === 'difficulty-select') {
    return (
      <div ref={playAreaRef} data-fit="menu" className="wp-zone transition-all duration-500 animate-fade-in-up">
        <HfFrame decor="lively" className="px-4 py-5 sm:p-7 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="hf-chip">2 / 2</span>
            <HfTitle text="あいてを えらぶ" hop className="text-[1.75rem] sm:text-4xl" />
          </div>
          <p className="hf-ink text-xs sm:text-sm font-serif mb-4 leading-relaxed">れんさで ぬばたまを おくって、あいての上まで うめたら かち</p>

          {/* 相手：顔を並べて選ぶ。自分と同じキャラも選べる（同キャラ戦） */}
          <CharacterPicker
            selectedId={selectedCharacterId}
            onSelect={setSelectedCharacterId}
            tone="you"
            markId={playerCharacterId}
            markLabel="じぶん"
          />

          <p className="mb-5 font-serif flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="hf-chip hf-chip-beni">{playerCharacter.name}</span>
            <span className="hf-title text-lg">VS</span>
            <span className="hf-chip hf-chip-sumi">{selectedCharacter.name}</span>
            <span className="hf-ink text-xs">{selectedCharacter.tagline}</span>
          </p>

          {/* 強さ：相手とは別に選ぶ */}
          <div className="grid grid-cols-3 gap-3 mb-7 max-w-md mx-auto">
            {(['easy', 'normal', 'hard'] as GameDifficulty[]).map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedDifficulty(value)}
                aria-pressed={selectedDifficulty === value}
                className={`hf-btn hf-btn-sm py-2 text-sm ${selectedDifficulty === value ? 'hf-btn-main' : 'hf-btn-sub'}`}
              >
                {DIFFICULTY_LABELS[value]}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button type="button" onClick={() => startPlay('vs-cpu')} className="hf-btn hf-btn-main hf-dot w-full max-w-xs py-3 text-lg">
              たいせん する！
            </button>
            <button type="button" onClick={() => setScreen('player-select')} className="hf-btn hf-btn-sub hf-dot w-full max-w-xs py-2 text-sm">
              もどる（じぶんを えらびなおす）
            </button>
          </div>
        </HfFrame>
      </div>
    );
  }

  // ぬばたま落としの「もどる」は枠の中の見出しにある（PuyoVsCpuGame・PuyoPuyoGame の onBack）
  return (
    <div ref={playAreaRef} className="wp-zone transition-all duration-500 animate-fade-in-up">
      {screen === 'playing-single' ? (
        <PuyoPuyoGame playerCharacterId={playerCharacterId} onChangeCharacter={() => setScreen('solo-select')} onBack={exit} />
      ) : (
        <PuyoVsCpuGame
          key={`vs-cpu-${selectedDifficulty}-${playerCharacterId}-${selectedCharacterId}`}
          initialDifficulty={selectedDifficulty}
          characterId={selectedCharacterId}
          playerCharacterId={playerCharacterId}
          onChangeOpponent={() => setScreen('difficulty-select')}
          onBack={exit}
        />
      )}
    </div>
  );
};
