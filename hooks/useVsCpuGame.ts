import { useState, useCallback, useEffect, useRef } from 'react';
import { usePuyoGame } from './usePuyoGame';
import { usePuyoGameWithoutInput } from './usePuyoGameWithoutInput';
import { useCpuPlayer } from './game/useCpuPlayer';
import type { GameDifficulty, VsGameState } from '../types/game';
import { getPairPositions } from '../utils/puyoGameLogic';
import { cpuOperationManager } from '../utils/cpuOperations';
import { calculateOjamaFromChain, dropOjamaPuyos } from '../utils/ojamaSystem';
import { 
  getGameConditions, 
  canOperateCpu, 
  createInitialVsGameState,
  resetVsGameState 
} from '../utils/gameStateHelpers';


export const useVsCpuGame = (initialDifficulty: GameDifficulty = 'normal') => {
  const [vsGameState, setVsGameState] = useState<VsGameState>(() => 
    createInitialVsGameState(initialDifficulty)
  );
  
  // プレイヤー用のゲーム（キーボード操作あり）
  const playerGame = usePuyoGame();
  
  // CPU用のゲーム（キーボード操作なし）
  const cpuGame = usePuyoGameWithoutInput();
  
  const cpuPlayer = useCpuPlayer();

  // 前回の状態を追跡
  const prevPlayerChainCount = useRef(0);
  const prevPlayerScore = useRef(0);
  const prevCpuChainCount = useRef(0);  
  const prevCpuScore = useRef(0);

  // プレイヤーの連鎖/大量消去によるおじゃまぷよ送信
  useEffect(() => {
    const currentScore = playerGame.gameState.score;
    const currentChainCount = playerGame.gameState.chainCount;
    const scoreDiff = currentScore - prevPlayerScore.current;
    
    // スコアが増加した場合
    if (scoreDiff > 0) {
      const deletedPuyos = Math.floor(scoreDiff / 10);
      const ojamaResult = calculateOjamaFromChain(currentChainCount, deletedPuyos);
      
      if (ojamaResult.ojamaCount > 0) {
        setTimeout(() => {
          if (cpuGame.gameState) {
            const newGrid = dropOjamaPuyos(cpuGame.gameState.grid, ojamaResult.ojamaCount);
            for (let row = 0; row < newGrid.length; row++) {
              for (let col = 0; col < newGrid[row].length; col++) {
                cpuGame.gameState.grid[row][col] = { ...newGrid[row][col] };
              }
            }
          }
        }, 100);
      }
    }
    
    prevPlayerChainCount.current = currentChainCount;
    prevPlayerScore.current = currentScore;
  }, [playerGame.gameState.chainCount, playerGame.gameState.isChaining, playerGame.gameState.score, cpuGame]);

  // CPUの連鎖/大量消去によるおじゃまぷよ送信
  useEffect(() => {
    const currentScore = cpuGame.gameState.score;
    const currentChainCount = cpuGame.gameState.chainCount;
    const scoreDiff = currentScore - prevCpuScore.current;
    
    // スコアが増加した場合
    if (scoreDiff > 0) {
      const limitedChainCount = Math.min(Math.max(currentChainCount, 1), 10);
      const baseDeletedPuyos = 4;
      const estimatedDeletedPuyos = Math.min(baseDeletedPuyos + Math.floor(limitedChainCount / 2), 20);
      
      const ojamaResult = calculateOjamaFromChain(limitedChainCount, estimatedDeletedPuyos);
      
      if (ojamaResult.ojamaCount > 0) {
        setTimeout(() => {
          if (playerGame.gameState) {
            const newGrid = dropOjamaPuyos(playerGame.gameState.grid, ojamaResult.ojamaCount);
            for (let row = 0; row < newGrid.length; row++) {
              for (let col = 0; col < newGrid[row].length; col++) {
                playerGame.gameState.grid[row][col] = { ...newGrid[row][col] };
              }
            }
          }
        }, 100);
      }
    }
    
    prevCpuChainCount.current = currentChainCount;
    prevCpuScore.current = currentScore;
  }, [cpuGame.gameState.chainCount, cpuGame.gameState.isChaining, cpuGame.gameState.score, playerGame]);

  // ゲーム制御関数
  const startGame = useCallback(() => {
    playerGame.startGame();
    cpuGame.startGame();
    setVsGameState(prev => ({ ...prev, isPlaying: true, isPaused: false, isGameOver: false, winner: null }));
  }, [playerGame, cpuGame]);

  const pauseGame = useCallback(() => {
    playerGame.pauseGame();
    cpuGame.pauseGame();
    setVsGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    cpuPlayer.stopCpuThinking();
  }, [playerGame, cpuGame, cpuPlayer]);

  const restartGame = useCallback(() => {
    playerGame.restartGame();
    cpuGame.restartGame();
    setVsGameState(prev => resetVsGameState(prev.difficulty));
    cpuPlayer.stopCpuThinking();
    cpuOperationManager.cleanup();
  }, [playerGame, cpuGame, cpuPlayer]);

  const setDifficulty = useCallback((difficulty: GameDifficulty) => {
    setVsGameState(prev => ({ ...prev, difficulty }));
  }, []);

  // CPU自動操作（リファクタリング版）
  useEffect(() => {
    const cpuConditions = getGameConditions(cpuGame.gameState);
    const vsConditions = { isGameOver: vsGameState.isGameOver, isPlaying: vsGameState.isPlaying };

    if (canOperateCpu(cpuConditions, vsConditions)) {
      cpuOperationManager.executeCpuTurn(cpuGame.gameState, vsGameState.difficulty, cpuGame);
    }
  }, [!!cpuGame.gameState.currentPair, cpuGame.gameState.isPlaying, vsGameState.isPlaying, vsGameState.isGameOver, vsGameState.difficulty]);

  // CPUペアがnullになった（ロックされた）時にリセット
  useEffect(() => {
    if (!cpuGame.gameState.currentPair && !cpuGame.gameState.isChaining && cpuGame.gameState.isPlaying) {
      cpuOperationManager.resetForNewPair();
    }
  }, [cpuGame.gameState.currentPair, cpuGame.gameState.isChaining, cpuGame.gameState.isPlaying]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      cpuOperationManager.cleanup();
    };
  }, []);

  // 勝敗判定（どちらかがゲームオーバーで全体終了）
  useEffect(() => {
    if (!vsGameState.isGameOver) {
      if (playerGame.gameState.isGameOver) {
        // プレイヤーがゲームオーバー → CPUの勝利
        setVsGameState(prev => ({ ...prev, isGameOver: true, winner: 'cpu', isPlaying: false }));
        // CPU側も強制停止
        cpuGame.pauseGame();
      } else if (cpuGame.gameState.isGameOver) {
        // CPUがゲームオーバー → プレイヤーの勝利
        setVsGameState(prev => ({ ...prev, isGameOver: true, winner: 'player', isPlaying: false }));
        // プレイヤー側も強制停止
        playerGame.pauseGame();
      }
    }
  }, [playerGame.gameState.isGameOver, cpuGame.gameState.isGameOver, vsGameState.isGameOver, playerGame, cpuGame]);

  // 統合されたゲーム状態
  const gameState = {
    player: playerGame.gameState,
    cpu: cpuGame.gameState,
    gameMode: vsGameState.gameMode,
    difficulty: vsGameState.difficulty,
    isPlaying: vsGameState.isPlaying,
    isPaused: vsGameState.isPaused,
    isGameOver: vsGameState.isGameOver,
    winner: vsGameState.winner,
    pendingOjamaPlayer: vsGameState.pendingOjamaPlayer,
    pendingOjamaCpu: vsGameState.pendingOjamaCpu
  };

  return {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    setDifficulty,
    // プレイヤー操作は既存のusePuyoGameから直接使用
    movePlayerPair: playerGame.movePair,
    rotatePlayerPair: (clockwise: boolean = true) => clockwise ? playerGame.rotateClockwise() : playerGame.rotateCounterClockwise(),
    hardDropPlayerPair: playerGame.hardDropPair,
    getPlayerPairPositions: playerGame.getPairPositions,
    getCpuPairPositions: () => {
      if (!cpuGame.gameState.currentPair) return { main: { x: 0, y: 0 }, sub: { x: 0, y: 0 } };
      return getPairPositions(cpuGame.gameState.currentPair);
    }
  };
};