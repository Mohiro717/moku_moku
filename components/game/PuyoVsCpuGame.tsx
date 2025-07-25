import React from 'react';
import { GameGrid } from './GameGrid';
import { ErrorBoundary } from '../ErrorBoundary';
import { GameErrorFallback } from './GameErrorFallback';
import { TouchControls } from './TouchControls';
import { NextPiecePreview } from './NextPiecePreview';
import { useVsCpuGame } from '../../hooks/useVsCpuGame';
import type { GameDifficulty, GameResult } from '../../types/game';

// Constants
const GAME_STYLES = {
  container: 'max-w-7xl mx-auto p-6 bg-ivory rounded-3xl shadow-lg',
  title: 'text-3xl font-bold text-coffee-dark mb-2',
  fieldContainer: 'bg-white/20 rounded-2xl p-4',
  fieldTitle: 'text-xl font-bold text-coffee-dark',
  infoContainer: 'bg-white/30 rounded-xl p-4',
  infoTitle: 'text-sm font-bold text-coffee-dark',
  loadingContainer: 'max-w-7xl mx-auto p-6 bg-ivory rounded-3xl shadow-lg',
  errorContainer: 'max-w-7xl mx-auto p-6 bg-red-100 rounded-3xl shadow-lg'
} as const;

const DIFFICULTY_STYLES = {
  easy: 'bg-gradient-to-r from-green-400 to-green-500 text-white',
  normal: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
  hard: 'bg-gradient-to-r from-red-400 to-red-500 text-white'
} as const;

const DIFFICULTY_LABELS = {
  easy: 'EASY',
  normal: 'NORMAL', 
  hard: 'HARD'
} as const;

interface PuyoVsCpuGameProps {
  initialDifficulty?: GameDifficulty;
}

// Utility functions
const getGameResult = (isGameOver: boolean, winner: string | null, player: 'player' | 'cpu'): GameResult => {
  if (!isGameOver) return null;
  if (winner === player) return 'win';
  return 'lose';
};

const getDifficultyStyle = (difficulty: GameDifficulty): string => {
  return DIFFICULTY_STYLES[difficulty];
};

const getDifficultyLabel = (difficulty: GameDifficulty): string => {
  return DIFFICULTY_LABELS[difficulty];
};

export const PuyoVsCpuGame: React.FC<PuyoVsCpuGameProps> = ({ initialDifficulty = 'normal' }) => {
  try {
    const {
      gameState,
      startGame,
      pauseGame,
      restartGame,
      movePlayerPair,
      rotatePlayerPair,
      hardDropPlayerPair,
      getPlayerPairPositions,
      getCpuPairPositions
    } = useVsCpuGame(initialDifficulty);
    
    if (!gameState) {
      return (
        <div className="max-w-7xl mx-auto p-6 bg-ivory rounded-3xl shadow-lg">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-coffee-dark mb-2">
              Loading...
            </h3>
            <p className="text-sm text-coffee-mid">
              ゲームを読み込み中です...
            </p>
          </div>
        </div>
      );
    }

  const handleStart = () => {
    startGame();
  };

  const handlePause = () => {
    pauseGame();
  };

  const handleRestart = () => {
    restartGame();
  };


  // タッチ操作用のハンドラー（キーボード操作はusePuyoGameが自動処理）
  const handlePlayerMove = (direction: 'left' | 'right' | 'down') => {
    movePlayerPair(direction);
  };

  const handlePlayerRotateClockwise = () => {
    rotatePlayerPair(true);
  };

  const handlePlayerRotateCounterClockwise = () => {
    rotatePlayerPair(false);
  };

  return (
    <ErrorBoundary fallback={GameErrorFallback}>
      <div className="max-w-7xl mx-auto p-6 bg-ivory rounded-3xl shadow-lg">
        {/* Game Title */}
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-coffee-dark mb-2">
            Moku Moku Puyo - CPU対戦モード
          </h3>
        </div>

        {/* Main Game Layout - 3 Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          
          {/* Player Field - Left Side */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-white/20 rounded-2xl p-4">
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-coffee-dark">YOUR FIELD</h4>
              </div>
              
              {/* Player Game Grid */}
              <div className="flex justify-center mb-4">
                <TouchControls
                  onMove={(direction) => handlePlayerMove(direction)}
                  onRotateClockwise={handlePlayerRotateClockwise}
                  onRotateCounterClockwise={handlePlayerRotateCounterClockwise}
                  onHardDrop={hardDropPlayerPair}
                  isActive={gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver}
                >
                  <GameGrid
                    grid={gameState.player.grid}
                    currentPair={gameState.player.currentPair}
                    getPairPositions={getPlayerPairPositions}
                    isGameOver={gameState.player.isGameOver}
                    isPaused={gameState.isPaused}
                    gameResult={getGameResult(gameState.isGameOver, gameState.winner, 'player')}
                  />
                </TouchControls>
              </div>

              {/* Player Score Display */}
              <div className="text-center mt-2">
                <div className="text-xl font-bold text-vivid-pink">
                  {gameState.player.score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Central Info Area */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="space-y-4">
              

              {/* Next Puyo Preview - Both Player and CPU */}
              <div className="bg-white/30 rounded-xl p-4">
                <div className="text-center mb-3">
                  <div className="text-sm font-bold text-coffee-dark">NEXT</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-coffee-mid mb-1">YOU</div>
                    <NextPiecePreview nextPair={gameState.player.nextPair} />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-coffee-mid mb-1">CPU</div>
                    <NextPiecePreview nextPair={gameState.cpu.nextPair} />
                  </div>
                </div>
                
              </div>
              
              {/* Chain Display */}
              <div className="bg-white/30 rounded-xl p-4">
                <div className="text-center mb-3">
                  <div className="text-sm font-bold text-coffee-dark">CHAIN</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-lg p-3 text-center transition-all duration-300 ${
                    gameState.player.chainCount > gameState.cpu.chainCount && gameState.player.chainCount > 0
                      ? 'bg-yellow-100/90 border-2 border-yellow-300 shadow-lg' 
                      : 'bg-blue-100/80'
                  }`}>
                    <div className={`text-xs font-medium mb-1 ${
                      gameState.player.chainCount > gameState.cpu.chainCount && gameState.player.chainCount > 0
                        ? 'text-yellow-700' : 'text-blue-700'
                    }`}>YOU</div>
                    {gameState.player.chainCount > 0 ? (
                      <div className={`text-sm font-bold ${
                        gameState.player.chainCount > gameState.cpu.chainCount
                          ? 'text-orange-700' : 'text-orange-600'
                      }`}>
                        {gameState.player.chainCount}連鎖！
                      </div>
                    ) : (
                      <div className="text-xs text-coffee-mid">-</div>
                    )}
                  </div>
                  <div className={`rounded-lg p-3 text-center transition-all duration-300 ${
                    gameState.cpu.chainCount > gameState.player.chainCount && gameState.cpu.chainCount > 0
                      ? 'bg-yellow-100/90 border-2 border-yellow-300 shadow-lg' 
                      : 'bg-red-100/80'
                  }`}>
                    <div className={`text-xs font-medium mb-1 ${
                      gameState.cpu.chainCount > gameState.player.chainCount && gameState.cpu.chainCount > 0
                        ? 'text-yellow-700' : 'text-red-700'
                    }`}>CPU</div>
                    {gameState.cpu.chainCount > 0 ? (
                      <div className={`text-sm font-bold ${
                        gameState.cpu.chainCount > gameState.player.chainCount
                          ? 'text-orange-700' : 'text-orange-600'
                      }`}>
                        {gameState.cpu.chainCount}連鎖！
                      </div>
                    ) : (
                      <div className="text-xs text-coffee-mid">-</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Difficulty Display */}
              <div className="bg-white/30 rounded-xl p-4">
                <div className="text-sm font-bold text-coffee-dark mb-2 text-center">
                  難易度
                </div>
                <div className="text-center">
                  <div className={`inline-block py-2 px-4 rounded-lg text-sm font-medium ${getDifficultyStyle(gameState.difficulty)}`}>
                    {getDifficultyLabel(gameState.difficulty)}
                  </div>
                </div>
              </div>


              {/* Game Controls */}
              <div className="space-y-2">
                <button
                  onClick={gameState.isPlaying ? handlePause : handleStart}
                  className="w-full py-3 px-4 bg-gradient-to-r from-vivid-pink to-vivid-green text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-vivid-pink/90 hover:to-vivid-green/90"
                  disabled={gameState.isGameOver}
                >
                  {gameState.isGameOver ? 'GAME ENDED' : 
                   gameState.isPlaying ? (gameState.isPaused ? 'RESUME' : 'PAUSE') : 'START'}
                </button>
                
                <button
                  onClick={handleRestart}
                  className="w-full py-2 px-4 bg-gradient-to-r from-coffee-light to-coffee-mid text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-coffee-light/90 hover:to-coffee-mid/90"
                >
                  RESTART
                </button>
              </div>

            </div>
          </div>

          {/* CPU Field - Right Side */}
          <div className="xl:col-span-2 order-3">
            <div className="bg-white/20 rounded-2xl p-4">
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-coffee-dark">CPU FIELD</h4>
              </div>
              
              {/* CPU Game Grid */}
              <div className="flex justify-center mb-4">
                <GameGrid
                  grid={gameState.cpu.grid}
                  currentPair={gameState.cpu.currentPair}
                  getPairPositions={getCpuPairPositions}
                  isGameOver={gameState.cpu.isGameOver}
                  isPaused={gameState.isPaused}
                  gameResult={getGameResult(gameState.isGameOver, gameState.winner, 'cpu')}
                />
              </div>

              {/* CPU Score Display */}
              <div className="text-center mt-2">
                <div className="text-xl font-bold text-red-500">
                  {gameState.cpu.score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Focus Message */}
        <div className="mt-6 text-center text-xs text-coffee-dark/60">
          <p className="mt-1">
            {gameState.isPlaying && !gameState.isPaused 
              ? "CPU対戦中です！頑張って勝利を掴もう 🔥" 
              : "CPUとの熱いバトルを楽しもう ⚔️"
            }
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
  } catch (error) {
    console.error('PuyoVsCpuGame error:', error);
    return (
      <div className="max-w-7xl mx-auto p-6 bg-red-100 rounded-3xl shadow-lg">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-red-800 mb-2">
            エラーが発生しました
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ページをリロード
          </button>
        </div>
      </div>
    );
  }
};