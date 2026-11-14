import React, { useEffect, useRef, useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { GameControllerIcon } from './icons/GameControllerIcon';
import { PuyoPuyoGame } from './game/PuyoPuyoGame';
import { PuyoVsCpuGame, DIFFICULTY_LABELS } from './game/PuyoVsCpuGame';
import { NubatamaCard } from './game/NubatamaCard';
import { NubatamaTitleScreen } from './game/NubatamaTitleScreen';
import './game/wapop.css';
import { FrogPrincessMaze } from './frog-maze/FrogPrincessMaze';
import { CatchTheBananaGameRefactored as CatchTheBananaGame } from './banana-game/CatchTheBananaGameRefactored';
import { SITE_CONFIG } from '../constants';
import type { GameDifficulty } from '../types/game';
import { HEADER_OFFSET } from '../constants/layout';
import { DEFAULT_OPPONENT_CHARACTER_ID, DEFAULT_PLAYER_CHARACTER_ID, characterById } from '../constants/cpuCharacters';
import { CharacterPicker } from './game/CharacterPicker';
import { HfFrame, HfTitle } from './game/HanafudaUi';
import { unlockAudio } from '../utils/gameAudio';

type GameMode = 'single' | 'nubatama-title' | 'vs-cpu' | 'player-select' | 'solo-select' | 'difficulty-select' | 'frog-maze' | 'frog-detail' | 'playing-single' | 'banana-game' | null;

export const GameSection: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('normal');
  // 相手のキャラ
  const [selectedCharacterId, setSelectedCharacterId] = useState(DEFAULT_OPPONENT_CHARACTER_ID);
  const selectedCharacter = characterById(selectedCharacterId);
  // 自分のキャラ（あるじどのの味方。CPU 対戦の最初に選ぶ）
  const [playerCharacterId, setPlayerCharacterId] = useState(DEFAULT_PLAYER_CHARACTER_ID);
  const playerCharacter = characterById(playerCharacterId);
  const isPuyo =
    gameMode === 'nubatama-title' || gameMode === 'player-select' || gameMode === 'solo-select' || gameMode === 'difficulty-select' || gameMode === 'playing-single' || gameMode === 'vs-cpu';

  // タイトルやぷよを開いたら、ヘッダーに隠れないよう、その場所までスクロールする。
  // 2026-11-09 まで scrollIntoView + scroll-mt-20 で、PC では上端 0 に止まりヘッダーの下に隠れていた。原因は2つ:
  // ・CDN 版 Tailwind はクラスが DOM に出てから CSS を作るので、出た直後のスクロールに scroll-mt-20 が間に合わない
  // ・animate-fade-in-up の途中（下にずれた位置）で測るので、動きが終わると上にずれる
  // offsetTop はどちらの影響も受けないので、それで位置を出して、ヘッダーぶん引く
  const playAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isPuyo) return;
    let y = 0;
    for (let el: HTMLElement | null = playAreaRef.current; el; el = el.offsetParent as HTMLElement | null) y += el.offsetTop;
    if (playAreaRef.current) window.scrollTo({ top: Math.max(0, y - HEADER_OFFSET), behavior: 'smooth' });
  }, [gameMode]);

  return (
    <section className="py-20 lg:py-32 bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection id="game" className="text-center">
          <SectionTitle showLines={true} className="mb-32 text-3xl md:text-4xl lg:text-5xl">
            {SITE_CONFIG.gameTitle}
          </SectionTitle>
          
          {!gameMode ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* ぬばたま落とし Card（和ポップ・咲耶が飛び出す） */}
              <NubatamaCard onPlay={() => setGameMode('nubatama-title')} />

              {/* Frog Maze Card */}
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-pink-200 p-8 transform animate-fade-in-up">
                {/* Close decoration */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-pink-300 rounded-full"></div>
                </div>
                
                {/* Frog icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-purple-400 to-pink-400 p-4 rounded-full">
                    <div className="text-3xl">🐸</div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-coffee-dark mb-6">
                    カエルのお姫様の迷宮
                  </h3>

                  {/* Game Instructions */}
                  <div className="bg-pink-50/70 rounded-2xl p-5 mb-6 border border-pink-200">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center justify-center">
                          <span className="text-purple-500 mr-2">🎮</span>
                          操作方法
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          {/* PC操作方法 */}
                          <div className="hidden sm:block">
                            <div className="flex items-center justify-center">
                              <span className="bg-pink-100 px-2 py-1 rounded font-serif text-xs mr-2">WASD</span>
                              <span className="font-serif">移動</span>
                              <span className="bg-pink-100 px-2 py-1 rounded font-serif text-xs mx-2">↑↓←→</span>
                              <span className="font-serif">移動</span>
                            </div>
                          </div>
                          {/* スマホ操作方法 */}
                          <div className="block sm:hidden text-center">
                            <span className="font-serif">マップをタップして移動</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center justify-center">
                          <span className="text-pink-500 mr-2">🏰</span>
                          基本ルール
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          <div className="flex items-start justify-center">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span className="font-serif">迷宮を探索してゴールを目指そう</span>
                          </div>
                          <div className="flex items-start justify-center">
                            <span className="text-pink-500 mr-2 mt-1">•</span>
                            <span className="font-serif">カエルの王子様を助けよう</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setGameMode('frog-maze')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-purple-500 hover:to-pink-500"
                    >
                      🐸 迷宮に入る
                    </button>
                  </div>
                </div>
              </div>

              {/* Catch The Banana Card */}
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-yellow-300 p-8 transform animate-fade-in-up">
                {/* Close decoration */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
                </div>
                
                {/* Banana icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-4 rounded-full">
                    <div className="text-3xl">🍌</div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-coffee-dark mb-6">
                    CATCH THE BANANA
                  </h3>

                  {/* Game Instructions */}
                  <div className="bg-yellow-50/70 rounded-2xl p-5 mb-6 border border-yellow-200">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center justify-center">
                          <span className="text-yellow-500 mr-2">🎮</span>
                          操作方法
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          <div className="flex items-center justify-center">
                            <span className="bg-yellow-100 px-2 py-1 rounded font-serif text-xs mr-2">クリック</span>
                            <span className="font-serif">バナナをタップ</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center justify-center">
                          <span className="text-orange-500 mr-2">🍌</span>
                          基本ルール
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          <div className="flex items-start justify-center">
                            <span className="text-yellow-500 mr-2 mt-1">•</span>
                            <span className="font-serif">30秒でバナナをクリック</span>
                          </div>
                          <div className="flex items-start justify-center">
                            <span className="text-orange-500 mr-2 mt-1">•</span>
                            <span className="font-serif">高スコアを目指そう！</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setGameMode('banana-game')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-yellow-500 hover:to-orange-500"
                    >
                      🍌 ゲームスタート
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : gameMode === 'single' ? (
            <div className="transition-all duration-500 animate-fade-in-up">
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-coffee-light p-8 max-w-md mx-auto">
                {/* Close decoration */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-coffee-light rounded-full"></div>
                </div>
                
                {/* Puyo icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-vivid-pink to-vivid-green p-4 rounded-full">
                    <GameControllerIcon className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-coffee-dark mb-6 font-serif">
                    ぬばたま落とし
                  </h3>

                  {/* Game Instructions */}
                  <div className="bg-white/70 rounded-2xl p-5 mb-6 border border-coffee-light/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center">
                          <span className="text-vivid-pink mr-2">🎮</span>
                          操作方法
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          <div className="flex items-center">
                            <span className="bg-coffee-light/10 px-2 py-1 rounded font-serif text-xs mr-2">←→</span>
                            <span className="font-serif">移動</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-coffee-light/10 px-2 py-1 rounded font-serif text-xs mr-2">Z/X</span>
                            <span className="font-serif">回転</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-coffee-light/10 px-2 py-1 rounded font-serif text-xs mr-2">↓</span>
                            <span className="font-serif">高速落下</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-coffee-light/10 px-2 py-1 rounded font-serif text-xs mr-2">Space</span>
                            <span className="font-serif">ハードドロップ</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center">
                          <span className="text-vivid-green mr-2">🧩</span>
                          基本ルール
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          <div className="flex items-start">
                            <span className="text-vivid-pink mr-2 mt-1">•</span>
                            <span className="font-serif">同色4個以上つなげて消去</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-vivid-green mr-2 mt-1">•</span>
                            <span className="font-serif">連鎖でボーナス得点！</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-red-500 mr-2 mt-1">•</span>
                            <span className="font-serif">上端ラインに達するとゲームオーバー</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mode selection */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setGameMode('playing-single')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-vivid-pink to-vivid-green text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-vivid-pink/90 hover:to-vivid-green/90"
                    >
                      🎮 シングルプレイ
                    </button>
                    
                    <button
                      onClick={() => setGameMode('difficulty-select')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-coffee-dark to-vivid-pink text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-coffee-dark/90 hover:to-vivid-pink/90"
                    >
                      🤖 CPU対戦モード
                    </button>
                    
                    <button
                      onClick={() => setGameMode(null)}
                      className="w-full py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-serif shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
                    >
                      ← ゲーム選択に戻る
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : gameMode === 'frog-detail' ? (
            <div className="transition-all duration-500 animate-fade-in-up">
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-pink-200 p-8 max-w-md mx-auto">
                {/* Close decoration */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-pink-300 rounded-full"></div>
                </div>
                
                {/* Frog icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-purple-400 to-pink-400 p-4 rounded-full">
                    <div className="text-3xl">🐸</div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-coffee-dark mb-6">
                    カエルのお姫様の迷宮
                  </h3>

                  {/* Game Instructions */}
                  <div className="bg-pink-50/70 rounded-2xl p-5 mb-6 border border-pink-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center">
                          <span className="text-purple-500 mr-2">🎮</span>
                          操作方法
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          <div className="flex items-center">
                            <span className="bg-pink-100 px-2 py-1 rounded font-serif text-xs mr-2">WASD</span>
                            <span className="font-serif">移動</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-pink-100 px-2 py-1 rounded font-serif text-xs mr-2">↑↓←→</span>
                            <span className="font-serif">移動</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-pink-100 px-2 py-1 rounded font-serif text-xs mr-2">Space</span>
                            <span className="font-serif">アクション</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-coffee-dark font-serif mb-3 flex items-center">
                          <span className="text-pink-500 mr-2">🏰</span>
                          基本ルール
                        </h4>
                        <div className="space-y-2 text-sm text-coffee-mid font-serif">
                          <div className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1">•</span>
                            <span className="font-serif">迷宮を探索してゴールを目指そう</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-pink-500 mr-2 mt-1">•</span>
                            <span className="font-serif">カエルの王子様を助けよう</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-green-500 mr-2 mt-1">•</span>
                            <span className="font-serif">アイテムを集めて進もう</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setGameMode('frog-maze')}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-purple-500 hover:to-pink-500"
                    >
                      🐸 迷宮に入る
                    </button>
                    
                    <button
                      onClick={() => setGameMode(null)}
                      className="w-full py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-serif shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
                    >
                      ← ゲーム選択に戻る
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : gameMode === 'nubatama-title' ? (
            <div ref={playAreaRef} className="wp-zone">
              <NubatamaTitleScreen
                onVsCpu={() => setGameMode('player-select')}
                onSingle={() => setGameMode('solo-select')}
              />
            </div>
          ) : gameMode === 'player-select' || gameMode === 'solo-select' ? (
            // 自分のキャラえらび。CPU 対戦は 1/2（つぎに相手えらび）、ひとりであそぶは これだけで はじまる
            <div ref={playAreaRef} className="wp-zone transition-all duration-500 animate-fade-in-up">
              <HfFrame decor="lively" className="px-4 py-5 sm:p-7 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {gameMode === 'player-select' && <span className="hf-chip">1 / 2</span>}
                  <HfTitle text="じぶんを えらぶ" hop className="text-[1.75rem] sm:text-4xl" />
                </div>
                <p className="hf-ink text-xs sm:text-sm font-serif mb-4 leading-relaxed">
                  {gameMode === 'player-select'
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
                    onClick={() => setGameMode(gameMode === 'player-select' ? 'difficulty-select' : 'playing-single')}
                    className="hf-btn hf-btn-sumi hf-dot w-full max-w-xs py-3 text-lg"
                  >
                    {gameMode === 'player-select' ? 'つぎへ' : 'あそぶ！'}
                  </button>
                  <button type="button" onClick={() => setGameMode('nubatama-title')} className="hf-btn hf-btn-kinari hf-dot w-full max-w-xs py-2 text-sm">
                    もどる
                  </button>
                </div>
              </HfFrame>
            </div>
          ) : gameMode === 'difficulty-select' ? (
            <div ref={playAreaRef} className="wp-zone transition-all duration-500 animate-fade-in-up">
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
                      className={`hf-btn hf-btn-sm py-2 text-sm ${selectedDifficulty === value ? 'hf-btn-sumi' : 'hf-btn-kinari'}`}
                    >
                      {DIFFICULTY_LABELS[value]}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button type="button" onClick={() => { unlockAudio(); setGameMode('vs-cpu'); }} className="hf-btn hf-btn-sumi hf-dot w-full max-w-xs py-3 text-lg">
                    たいせん する！
                  </button>
                  <button type="button" onClick={() => setGameMode('player-select')} className="hf-btn hf-btn-kinari hf-dot w-full max-w-xs py-2 text-sm">
                    もどる（じぶんを えらびなおす）
                  </button>
                </div>
              </HfFrame>
            </div>
          ) : (
            <div ref={playAreaRef} className={`${isPuyo ? 'wp-zone ' : ''}transition-all duration-500 animate-fade-in-up`}>
              {gameMode === 'playing-single' ? (
                <PuyoPuyoGame playerCharacterId={playerCharacterId} onChangeCharacter={() => setGameMode('solo-select')} />
              ) : gameMode === 'vs-cpu' ? (
                <PuyoVsCpuGame
                  key={`vs-cpu-${selectedDifficulty}-${playerCharacterId}-${selectedCharacterId}`}
                  initialDifficulty={selectedDifficulty}
                  characterId={selectedCharacterId}
                  playerCharacterId={playerCharacterId}
                  onChangeOpponent={() => setGameMode('difficulty-select')}
                />
              ) : gameMode === 'frog-maze' ? (
                <div className="w-full">
                  <FrogPrincessMaze />
                </div>
              ) : gameMode === 'banana-game' ? (
                <CatchTheBananaGame />
              ) : null}
              
              {isPuyo ? (
                <button type="button" onClick={() => setGameMode(null)} className="hf-btn hf-btn-kinari hf-btn-sm mt-6 px-6 py-2 text-sm">
                  ← ゲームえらびに もどる
                </button>
              ) : (
                <button
                  onClick={() => setGameMode(null)}
                  className="mt-6 py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-serif shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
                >
                  ← モード選択に戻る
                </button>
              )}
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};