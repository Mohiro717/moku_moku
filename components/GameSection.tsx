import React, { useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { NubatamaCard } from './game/NubatamaCard';
import { NubatamaGame } from './game/NubatamaGame';
import { FrogPrincessMaze } from './frog-maze/FrogPrincessMaze';
import { CatchTheBananaGameRefactored as CatchTheBananaGame } from './banana-game/CatchTheBananaGameRefactored';
import { SITE_CONFIG } from '../constants';

// ぬばたま落としの画面の流れは components/game/NubatamaGame.tsx（単独サイト nubatama/ と共用）
type GameMode = 'nubatama' | 'frog-maze' | 'frog-detail' | 'banana-game' | null;

export const GameSection: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);

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
              <NubatamaCard onPlay={() => setGameMode('nubatama')} />

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
          ) : gameMode === 'nubatama' ? (
            <NubatamaGame onExit={() => setGameMode(null)} />
          ) : (
            <div className="transition-all duration-500 animate-fade-in-up">
              {gameMode === 'frog-maze' ? (
                <div className="w-full">
                  <FrogPrincessMaze />
                </div>
              ) : gameMode === 'banana-game' ? (
                <CatchTheBananaGame />
              ) : null}
              
              {/* ぬばたま落としの「もどる」は枠の中の見出しにある（NubatamaGame の onExit）。ここはカエル・バナナだけ */}
              <button
                onClick={() => setGameMode(null)}
                className="mt-6 py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-serif shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
              >
                ← モード選択に戻る
              </button>
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};