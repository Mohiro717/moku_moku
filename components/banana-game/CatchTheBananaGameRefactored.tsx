import React, { useState } from 'react';
import { GameHeader } from './GameHeader';
import { GameStats } from './GameStats';
import { GameArea } from './GameArea';
import { GameInstructions } from './GameInstructions';
import { NameInputModal, useNameInputModal } from './NameInputModal';
import { RankingDisplay } from './RankingDisplay';
import { useBananaGameRefactored } from '../../hooks/useBananaGameRefactored';
import { useResponsive } from '../../hooks/useResponsive';
import { getGameDimensions } from '../../utils/bananaGameUtils';
import { getGameStateType, GAME_STATES } from '../../types/bananaGame';

// ゲームのメイン領域を担当するコンポーネント
const GameMainArea: React.FC<{
  gameState: ReturnType<typeof useBananaGameRefactored>['gameState'];
  dimensions: ReturnType<typeof getGameDimensions>;
  onBananaClick: () => void;
  onStartGame: () => void;
  onResetGame: () => void;
}> = ({ gameState, dimensions, onBananaClick, onStartGame, onResetGame }) => {
  const showInstructions = getGameStateType(gameState) === GAME_STATES.IDLE;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border-4 border-yellow-300 p-4 sm:p-8">
      <GameHeader />
      <GameStats score={gameState.score} timeLeft={gameState.timeLeft} />
      <GameArea
        gameState={gameState}
        dimensions={dimensions}
        onBananaClick={onBananaClick}
        onStartGame={onStartGame}
        onResetGame={onResetGame}
      />
      <GameInstructions show={showInstructions} />
    </div>
  );
};

// ランキング領域を担当するコンポーネント
const GameRankingArea: React.FC<{
  rankingService: ReturnType<typeof useBananaGameRefactored>['rankingService'];
  refreshTrigger: number;
}> = ({ rankingService, refreshTrigger }) => {
  // refreshTriggerが変わったときにランキングを再取得
  const rankings = React.useMemo(() => {
    return rankingService.getRankings();
  }, [rankingService, refreshTrigger]);

  return (
    <RankingDisplay
      rankings={rankings}
      isLoading={rankingService.isLoading}
      isGlobal={rankingService.isGlobal}
    />
  );
};

// 名前入力モーダル領域を担当するコンポーネント
const GameModalArea: React.FC<{
  gameState: ReturnType<typeof useBananaGameRefactored>['gameState'];
  onSubmitScore: (name: string) => void;
  onSkipNameInput: () => void;
}> = ({ gameState, onSubmitScore, onSkipNameInput }) => {
  const isNameInputOpen = getGameStateType(gameState) === GAME_STATES.HIGH_SCORE_INPUT;

  // キーボードショートカット処理
  useNameInputModal(
    isNameInputOpen,
    () => onSubmitScore(''),
    onSkipNameInput
  );

  return (
    <NameInputModal
      isOpen={isNameInputOpen}
      score={gameState.score}
      onSubmit={onSubmitScore}
      onSkip={onSkipNameInput}
    />
  );
};

// メインのゲームコンポーネント
export const CatchTheBananaGameRefactored: React.FC = () => {
  const { isMobile } = useResponsive();
  const dimensions = getGameDimensions(isMobile);
  const gameHook = useBananaGameRefactored({ dimensions });
  
  const [rankingRefresh, setRankingRefresh] = useState(0);

  // スコア送信時にランキングを更新
  const handleSubmitScore = async (name: string) => {
    await gameHook.submitScore(name);
    setRankingRefresh(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* ゲームメイン領域 */}
      <GameMainArea
        gameState={gameHook.gameState}
        dimensions={dimensions}
        onBananaClick={gameHook.handleBananaClick}
        onStartGame={gameHook.startGame}
        onResetGame={gameHook.resetGame}
      />
      
      {/* ランキング領域 */}
      <GameRankingArea
        rankingService={gameHook.rankingService}
        refreshTrigger={rankingRefresh}
      />

      {/* モーダル領域 */}
      <GameModalArea
        gameState={gameHook.gameState}
        onSubmitScore={handleSubmitScore}
        onSkipNameInput={gameHook.skipNameInput}
      />
    </div>
  );
};