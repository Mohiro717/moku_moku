import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import { getIntroStory, getVictoryMessage } from './services/textService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { IntroScreen } from './components/IntroScreen';
import { WinScreen } from './components/WinScreen';
import { Maze } from './components/Maze';
import { GAME_TEXT, GAME_FONT } from './constants/gameConstants';

export const FrogPrincessMaze: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [introStory, setIntroStory] = useState<string>('');
  const [victoryMessage, setVictoryMessage] = useState<string>('');
  const [gameId, setGameId] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const loadIntro = async () => {
    try {
      setGameState(GameState.LOADING);
      const story = await getIntroStory();
      setIntroStory(story);
      setGameState(GameState.INTRO);
    } catch (err) {
      setError('すとーりーのよみこみにしっぱいしました');
      setGameState(GameState.ERROR);
    }
  };

  const handleWin = async () => {
    try {
      setGameState(GameState.LOADING);
      const message = await getVictoryMessage();
      setVictoryMessage(message);
      setGameState(GameState.WON);
    } catch (err) {
      setError('しょうりつめっせーじのよみこみにしっぱいしました');
      setGameState(GameState.ERROR);
    }
  };

  const handleStart = () => {
    setGameState(GameState.PLAYING);
  };

  const handleRestart = () => {
    setGameId(prev => prev + 1);
    loadIntro();
  };

  useEffect(() => {
    loadIntro();
  }, []);

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
          {gameState === GameState.LOADING && <LoadingSpinner />}
          
          {gameState === GameState.INTRO && (
            <IntroScreen story={introStory} onStart={handleStart} />
          )}
          
          {gameState === GameState.PLAYING && (
            <Maze key={gameId} onWin={handleWin} />
          )}
          
          {gameState === GameState.WON && (
            <WinScreen message={victoryMessage} onRestart={handleRestart} />
          )}
          
          {gameState === GameState.ERROR && (
            <div className="text-center text-red-600 py-8" style={{ fontFamily: GAME_FONT }}>
              <p className="text-xl mb-4">えらーがはっせいしました</p>
              <p className="mb-4">{error}</p>
              <button
                onClick={loadIntro}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                style={{ fontFamily: GAME_FONT }}
              >
                さいしこう
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};