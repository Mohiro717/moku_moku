import React, { useState } from 'react';
import { GameHeader } from './GameHeader';
import { GameStats } from './GameStats';
import { GameArea } from './GameArea';
import { GameInstructions } from './GameInstructions';
import { NameInputModal, useNameInputModal } from './NameInputModal';
import { HybridBananaRanking } from './HybridBananaRanking';
import { useBananaGame } from '../../hooks/useBananaGame';
import { useResponsive } from '../../hooks/useResponsive';
import { getGameDimensions } from '../../utils/bananaGameUtils';

export const CatchTheBananaGame: React.FC = () => {
  const { isMobile } = useResponsive();
  const dimensions = getGameDimensions(isMobile);
  const { gameState, handleBananaClick, startGame, resetGame, submitScore, skipNameInput } = useBananaGame({ dimensions });
  const [rankingRefresh, setRankingRefresh] = useState(0);

  const showInstructions = !gameState.isPlaying && !gameState.isGameOver;

  const handleSubmitScore = (name: string) => {
    submitScore(name);
    setRankingRefresh(prev => prev + 1);
  };

  const handleSkipNameInput = () => {
    skipNameInput();
  };

  // キーボードショートカット処理
  useNameInputModal(
    gameState.showNameInput,
    () => handleSubmitScore(''),
    handleSkipNameInput
  );

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-yellow-300 p-8">
        <GameHeader />
        
        <GameStats score={gameState.score} timeLeft={gameState.timeLeft} />
        
        <GameArea
          gameState={gameState}
          dimensions={dimensions}
          onBananaClick={handleBananaClick}
          onStartGame={startGame}
          onResetGame={resetGame}
        />
        
        <GameInstructions show={showInstructions} />
      </div>
      
      <HybridBananaRanking 
        gameType="catch-the-banana" 
        refreshTrigger={rankingRefresh}
      />

      <NameInputModal
        isOpen={gameState.showNameInput}
        score={gameState.score}
        onSubmit={handleSubmitScore}
        onSkip={handleSkipNameInput}
      />
    </div>
  );
};