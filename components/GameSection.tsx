import React, { useState } from 'react';
import { AnimatedSection } from './AnimatedSection';
import { SectionTitle } from './SectionTitle';
import { GameControllerIcon } from './icons/GameControllerIcon';
import { PuyoPuyoGame } from './game/PuyoPuyoGame';
import { Button } from './ui/Button';
import { SITE_CONFIG } from '../constants';

export const GameSection: React.FC = () => {
  const [showGame, setShowGame] = useState(false);

  return (
    <section className="py-20 lg:py-32 bg-ivory">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection id="game" className="text-center">
          <SectionTitle showLines={true} className="mb-12 text-3xl md:text-4xl lg:text-5xl">
            {SITE_CONFIG.gameTitle}
          </SectionTitle>
          
          {!showGame ? (
            <div className="relative">
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
                    <h3 className="text-2xl font-bold text-coffee-dark mb-4 font-serif">
                      Moku Moku Puyo
                    </h3>
                    
                    <p className="text-coffee-mid mb-2 leading-relaxed">
                      ぷよぷよ風パズルゲームで
                    </p>
                    <p className="text-coffee-mid mb-2 leading-relaxed">
                      息抜きしませんか？
                    </p>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowGame(true)}
                        variant="primary"
                        size="lg"
                        className="w-full"
                      >
                        🎮 ゲームを始める
                      </Button>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-500 animate-fade-in-up">
              <PuyoPuyoGame />
              <Button
                onClick={() => setShowGame(false)}
                variant="secondary"
                size="sm"
                className="mt-6"
              >
                ← ゲームを閉じる
              </Button>
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};