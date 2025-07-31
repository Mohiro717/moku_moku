import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { IntroScreen } from './components/IntroScreen';
import { WinScreen } from './components/WinScreen';
import { Maze } from './components/Maze';
import { GAME_TEXT, GAME_FONT } from './constants/gameConstants';

export const FrogPrincessMaze: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [gameId, setGameId] = useState<number>(0);

  const handleWin = () => {
    setGameState(GameState.WON);
  };

  const handleStart = () => {
    setGameState(GameState.PLAYING);
  };

  const handleRestart = () => {
    setGameId(prev => prev + 1);
    setGameState(GameState.INTRO);
  };

  return (
    <div 
      className="w-full py-4 px-2 sm:py-8 sm:px-4"
      style={{ 
        background: 'transparent',
        fontFamily: 'Yomogi, cursive'
      }}
    >
      <div className="max-w-full sm:max-w-4xl lg:max-w-6xl mx-auto">

        {/* Game Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-serif text-purple-600 font-bold"
            style={{ fontFamily: GAME_FONT }}
          >
            {GAME_TEXT.TITLE}
          </h2>
        </div>

        {/* Game Content */}
        <div 
          className="rounded-lg sm:rounded-3xl shadow-lg sm:shadow-2xl border-2 sm:border-4 border-pink-200 p-2 sm:p-4 lg:p-8 backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef7ff 30%, #e0f2fe 60%, #f3e8ff 100%)' }}
        >
          {gameState === GameState.INTRO && (
            <IntroScreen story={GAME_TEXT.INTRO_STORY} onStart={handleStart} />
          )}
          
          {gameState === GameState.PLAYING && (
            <Maze key={gameId} onWin={handleWin} />
          )}
          
          {gameState === GameState.WON && (
            <WinScreen message={GAME_TEXT.VICTORY_MESSAGE} onRestart={handleRestart} />
          )}
        </div>

      </div>
    </div>
  );
};