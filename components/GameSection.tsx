import React, { useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { GameControllerIcon } from './icons/GameControllerIcon';
import { PuyoPuyoGame } from './game/PuyoPuyoGame';
import { PuyoVsCpuGame } from './game/PuyoVsCpuGame';
import { Button } from './ui/Button';
import { SITE_CONFIG } from '../constants';
import type { GameDifficulty } from '../types/game';

type GameMode = 'single' | 'vs-cpu' | 'vs-cpu-rules' | 'difficulty-select' | null;

export const GameSection: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('normal');

  return (
    <section className="py-20 lg:py-32 bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection id="game" className="text-center">
          <SectionTitle showLines={true} className="mb-32 text-3xl md:text-4xl lg:text-5xl">
            {SITE_CONFIG.gameTitle}
          </SectionTitle>
          
          {!gameMode ? (
            <div className="relative mt-8">
              {/* Game Preview Card */}
              <div className="border-2 border-dashed border-coffee-light rounded-3xl p-12 lg:p-16 transition-all duration-500 hover:border-vivid-pink hover:shadow-lg opacity-50 blur-sm">
                <GameControllerIcon className="w-16 h-16 lg:w-20 lg:h-20 mx-auto text-coffee-light mb-8" />
                <div className="h-8 bg-coffee-light/20 rounded mb-4"></div>
                <div className="h-6 bg-coffee-light/20 rounded mb-2"></div>
                <div className="h-6 bg-coffee-light/20 rounded mb-8"></div>
                <div className="h-12 bg-coffee-light/20 rounded-full"></div>
              </div>

              {/* Popup Modal */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pt-16 md:pt-0">
                <div className="bg-white rounded-3xl shadow-2xl border-4 border-coffee-light p-8 max-w-md mx-4 transform animate-fade-in-up">
                  {/* Close decoration */}
                  <div className="flex justify-center mb-6">
                    <div className="w-12 h-1 bg-coffee-light rounded-full"></div>
                  </div>
                  
                  {/* Game icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-vivid-pink to-vivid-green p-4 rounded-full">
                      <GameControllerIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-2xl font-serif text-coffee-dark mb-6 font-serif">
                      Moku Moku Puyo
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

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setGameMode('single')}
                        className="w-full py-3 px-6 bg-gradient-to-r from-vivid-pink to-vivid-green text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-vivid-pink/90 hover:to-vivid-green/90"
                      >
                        🎮 シングルプレイ
                      </button>
                      
                      <button
                        onClick={() => setGameMode('vs-cpu-rules')}
                        className="w-full py-3 px-6 bg-gradient-to-r from-coffee-dark to-vivid-pink text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-coffee-dark/90 hover:to-vivid-pink/90"
                      >
                        🤖 CPU対戦モード
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : gameMode === 'vs-cpu-rules' ? (
            <div className="transition-all duration-500 animate-fade-in-up">
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-coffee-light p-8 max-w-md mx-auto">
                {/* Close decoration */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-coffee-light rounded-full"></div>
                </div>
                
                {/* Battle icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-coffee-dark to-vivid-pink p-4 rounded-full">
                    <div className="text-2xl">⚔️</div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-coffee-dark mb-6 font-serif">
                    対戦ルール
                  </h3>
                  
                  {/* Battle Rules */}
                  <div className="text-left bg-coffee-light/10 rounded-xl p-4 mb-6">
                    <div className="space-y-2 text-sm text-coffee-mid font-serif">
                      <div className="flex items-start">
                        <span className="text-vivid-green mr-2 mt-1">•</span>
                        <span>4個以上同時消去でおじゃまぷよを送信</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-yellow-500 mr-2 mt-1">•</span>
                        <span>グレーのおじゃまぷよは隣接消去</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        <span>相手をゲームオーバーにさせると勝利！</span>
                      </div>
                    </div>
                  </div>

                  {/* Continue button */}
                  <button
                    onClick={() => setGameMode('difficulty-select')}
                    className="w-full py-3 px-6 bg-gradient-to-r from-vivid-pink to-vivid-green text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-vivid-pink/90 hover:to-vivid-green/90 mb-3"
                  >
                    🎯 難易度を選択
                  </button>
                  
                  <button
                    onClick={() => setGameMode(null)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-serif shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
                  >
                    ← モード選択に戻る
                  </button>
                </div>
              </div>
            </div>
          ) : gameMode === 'difficulty-select' ? (
            <div className="transition-all duration-500 animate-fade-in-up">
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-coffee-light p-8 max-w-md mx-auto">
                {/* Close decoration */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-coffee-light rounded-full"></div>
                </div>
                
                {/* Difficulty icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-coffee-dark to-vivid-pink p-4 rounded-full">
                    <div className="text-2xl">🤖</div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-coffee-dark mb-4 font-serif">
                    難易度を選択
                  </h3>
                  
                  <p className="text-coffee-mid mb-6 leading-relaxed">
                    CPUの強さを選んでください
                  </p>

                  {/* Difficulty buttons */}
                  <div className="space-y-3 mb-6">
                    {[
                      { value: 'easy', label: '😊 EASY', desc: '初心者向け', gradient: 'from-green-400 to-green-500' },
                      { value: 'normal', label: '😐 NORMAL', desc: 'バランス良い', gradient: 'from-yellow-400 to-orange-400' },
                      { value: 'hard', label: '😤 HARD', desc: '上級者向け', gradient: 'from-red-400 to-red-500' }
                    ].map(({ value, label, desc, gradient }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedDifficulty(value as GameDifficulty)}
                        className={`w-full p-4 rounded-xl font-serif transition-all transform hover:scale-105 duration-200 text-left ${
                          selectedDifficulty === value 
                            ? `bg-gradient-to-r ${gradient} text-white shadow-lg border-2 border-white` 
                            : 'bg-white/50 text-coffee-dark hover:bg-white/70 border-2 border-transparent'
                        }`}
                      >
                        <div className="font-serif">{label}</div>
                        <div className="text-sm opacity-80">{desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Start button */}
                  <button
                    onClick={() => setGameMode('vs-cpu')}
                    className="w-full py-3 px-6 bg-gradient-to-r from-vivid-pink to-vivid-green text-white font-serif rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-vivid-pink/90 hover:to-vivid-green/90 mb-3"
                  >
                    🎮 対戦スタート
                  </button>
                  
                  <button
                    onClick={() => setGameMode(null)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-serif shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
                  >
                    ← モード選択に戻る
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-500 animate-fade-in-up">
              {gameMode === 'single' ? (
                <PuyoPuyoGame />
              ) : gameMode === 'vs-cpu' ? (
                <PuyoVsCpuGame key={`vs-cpu-${selectedDifficulty}`} initialDifficulty={selectedDifficulty} />
              ) : null}
              
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