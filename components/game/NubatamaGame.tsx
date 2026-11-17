import React, { useEffect, useRef, useState } from 'react';
import { PuyoPuyoGame } from './PuyoPuyoGame';
import { PuyoVsCpuGame, DIFFICULTY_LABELS } from './PuyoVsCpuGame';
import { NubatamaTitleScreen } from './NubatamaTitleScreen';
import { CharacterPicker } from './CharacterPicker';
import { HfFrame, HfTitle } from './HanafudaUi';
import './wapop.css';
import type { GameDifficulty } from '../../types/game';
import { HEADER_OFFSET } from '../../constants/layout';
import { useWideStage } from '../../hooks/useWideStage';
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
  const wide = useWideStage();

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
      <div ref={playAreaRef} className="wp-zone" data-fit="title">
        <NubatamaTitleScreen onVsCpu={() => setScreen('player-select')} onSingle={() => setScreen('solo-select')} />
      </div>
    );
  }

  if (screen === 'player-select' || screen === 'solo-select' || screen === 'difficulty-select') {
    // 自分えらび（CPU 対戦は 1/2、ひとりであそぶは これだけで はじまる）と、相手えらび（2/2。強さもここで選ぶ）
    const pickingMe = screen !== 'difficulty-select';
    const focus = pickingMe ? playerCharacter : selectedCharacter;
    const step = screen === 'player-select' ? '1 / 2' : screen === 'difficulty-select' ? '2 / 2' : null;
    const heading = pickingMe ? 'じぶんを えらぶ' : 'あいてを えらぶ';
    const lead = screen === 'player-select'
      ? 'いっしょに たたかう 御霊を ひとり よぶ（だれを えらんでも つよさは おなじ）'
      : screen === 'solo-select'
        ? 'いっしょに あそぶ 御霊を ひとり よぶ（よこで しゃべって、れんさで かけごえ）'
        : 'れんさで ぬばたまを おくって、あいての上まで うめたら かち';
    const next = () => (screen === 'player-select' ? setScreen('difficulty-select') : screen === 'solo-select' ? startPlay('playing-single') : startPlay('vs-cpu'));
    const nextLabel = screen === 'player-select' ? 'つぎへ' : screen === 'solo-select' ? 'あそぶ！' : 'たいせん する！';
    const back = () => setScreen(pickingMe ? 'title' : 'player-select');

    const title = (
      <div className="flex items-center justify-center gap-3">
        {step && <span className="hf-chip">{step}</span>}
        <HfTitle text={heading} hop className={wide ? 'text-[2rem]' : 'text-[1.75rem] sm:text-4xl'} />
      </div>
    );
    // 相手：顔を並べて選ぶ。自分と同じキャラも選べる（同キャラ戦）
    const picker = pickingMe
      ? <CharacterPicker selectedId={playerCharacterId} onSelect={setPlayerCharacterId} tone="me" compact={wide} />
      : <CharacterPicker selectedId={selectedCharacterId} onSelect={setSelectedCharacterId} tone="you" markId={playerCharacterId} markLabel="じぶん" compact={wide} />;
    const versus = (
      <>
        <span className="hf-chip hf-chip-beni">{playerCharacter.name}</span>
        <span className="hf-title text-lg">VS</span>
        <span className="hf-chip hf-chip-sumi">{selectedCharacter.name}</span>
      </>
    );
    // 強さ：相手とは別に選ぶ
    const strength = !pickingMe && (
      <div className={`grid grid-cols-3 gap-3 max-w-md mx-auto ${wide ? 'w-full' : 'mb-7'}`}>
        {(['easy', 'normal', 'hard'] as GameDifficulty[]).map(value => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedDifficulty(value)}
            aria-pressed={selectedDifficulty === value}
            className={`hf-btn hf-btn-sm ${wide ? 'py-1.5' : 'py-2'} text-sm ${selectedDifficulty === value ? 'hf-btn-main' : 'hf-btn-sub'}`}
          >
            {DIFFICULTY_LABELS[value]}
          </button>
        ))}
      </div>
    );

    if (wide) {
      // 単独サイトの横長の窓：左は選んでいるキャラを大きく、右は顔の一覧と強さ・ボタン（オーナー 11-17「余白が無いように素材やUI配置設計を見直して」）。
      // 外枠は窓の大きさ（--nb-tw × --nb-th、FitToScreen.tsx の fillFit）。右の列は幅が決まっていて、左の列が残りの幅を埋める（stage.css）
      return (
        <div ref={playAreaRef} data-fit="menu" className="wp-zone nb-sel">
          <div className="nb-sel-hero">
            <div key={focus.id} className="nb-sel-face" style={{ '--ring': pickingMe ? '#c93a2e' : '#d9a94c' } as React.CSSProperties}>
              <img src={focus.icon} alt={focus.name} />
            </div>
            <HfTitle text={focus.name} className="nb-sel-name" />
            <p className="font-serif flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              {!pickingMe && versus}
              <span className={pickingMe ? 'hf-chip hf-chip-sumi' : 'hf-ink text-sm'}>{focus.tagline}</span>
            </p>
            <p className="nb-sel-lead hf-ink text-sm font-serif leading-relaxed">{lead}</p>
          </div>
          <div className="nb-sel-side">
            {title}
            {picker}
            {strength}
            <div className="flex items-center justify-center gap-4 w-full">
              <button type="button" onClick={back} className="hf-btn hf-btn-sub hf-dot flex-1 py-2 text-sm">もどる</button>
              <button type="button" onClick={next} className="hf-btn hf-btn-main hf-dot flex-[1.6] py-2 text-lg">{nextLabel}</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={playAreaRef} data-fit="menu" className="wp-zone transition-all duration-500 animate-fade-in-up">
        <HfFrame decor="lively" className="px-4 py-5 sm:p-7 max-w-2xl mx-auto">
          <div className="mb-2">{title}</div>
          <p className="hf-ink text-xs sm:text-sm font-serif mb-4 leading-relaxed">{lead}</p>

          {picker}

          <p className={`${pickingMe ? 'mb-6' : 'mb-5'} font-serif flex flex-wrap items-center justify-center gap-x-2 gap-y-1`}>
            {pickingMe ? <span className="hf-chip hf-chip-sumi">じぶん：{playerCharacter.name}</span> : versus}
            <span className="hf-ink text-xs">{focus.tagline}</span>
          </p>

          {strength}

          <div className="flex flex-col items-center gap-4">
            <button type="button" onClick={next} className="hf-btn hf-btn-main hf-dot w-full max-w-xs py-3 text-lg">
              {nextLabel}
            </button>
            <button type="button" onClick={back} className="hf-btn hf-btn-sub hf-dot w-full max-w-xs py-2 text-sm">
              {pickingMe ? 'もどる' : 'もどる（じぶんを えらびなおす）'}
            </button>
          </div>
        </HfFrame>
      </div>
    );
  }

  // ぬばたま落としの「もどる」は枠の中の見出しにある（PuyoVsCpuGame・PuyoPuyoGame の onBack）
  // 対戦は、単独サイトの横長の窓では窓いっぱいの5列（data-fit="vs"。FitToScreen.tsx の vsFit）
  return (
    <div ref={playAreaRef} data-fit={wide && screen === 'vs-cpu' ? 'vs' : undefined} className="wp-zone transition-all duration-500 animate-fade-in-up">
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
