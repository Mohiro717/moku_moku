import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { usePuyoGame } from './usePuyoGame';
import { usePuyoGameWithoutInput } from './usePuyoGameWithoutInput';
import { useCpuPlayer } from './game/useCpuPlayer';
import type { GameDifficulty, VsGameState, OjamaLink } from '../types/game';
import { getPairPositions } from '../utils/puyoGameLogic';
import { cpuOperationManager } from '../utils/cpuOperations';
import { ojamaForStep, MAX_OJAMA_PER_DROP } from '../utils/ojamaSystem';
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
  
  // おじゃまのやりとり。連鎖の途中や着地のタイマーから触るので ref が正本で、
  // 予告の表示用に vsGameState へ写す。
  //   pending: その側に降る予定の数 / carry: その側が送る量の端数
  const pending = useRef({ player: 0, cpu: 0 });
  const carry = useRef({ player: 0, cpu: 0 });
  const chaining = useRef({ player: false, cpu: false });

  const showPending = useCallback(() => {
    const { player, cpu } = pending.current;
    setVsGameState(prev => ({ ...prev, pendingOjamaPlayer: player, pendingOjamaCpu: cpu }));
  }, []);

  const resetOjama = useCallback(() => {
    pending.current = { player: 0, cpu: 0 };
    carry.current = { player: 0, cpu: 0 };
  }, []);

  const ojamaLinks = useMemo(() => {
    const link = (self: 'player' | 'cpu', rival: 'player' | 'cpu'): OjamaLink => ({
      onChainStep: (step, deleted) => {
        carry.current[self] += ojamaForStep(step, deleted);
        let attack = Math.floor(carry.current[self]);
        carry.current[self] -= attack;
        // 相殺：自分に来ている分を先に打ち消し、残りを相手へ
        const offset = Math.min(attack, pending.current[self]);
        pending.current[self] -= offset;
        attack -= offset;
        pending.current[rival] += attack;
        showPending();
      },
      takeOjama: () => {
        // 相手の連鎖が終わるまでは降らせない（まだ増えるかもしれない）
        if (chaining.current[rival] || pending.current[self] === 0) return 0;
        const count = Math.min(pending.current[self], MAX_OJAMA_PER_DROP);
        pending.current[self] -= count;
        showPending();
        return count;
      }
    });
    return { player: link('player', 'cpu'), cpu: link('cpu', 'player') };
  }, [showPending]);

  // プレイヤー用のゲーム（キーボード操作あり）
  const playerGame = usePuyoGame(ojamaLinks.player);

  // CPU用のゲーム（キーボード操作なし）
  const cpuGame = usePuyoGameWithoutInput(ojamaLinks.cpu);

  const cpuPlayer = useCpuPlayer();

  chaining.current = { player: playerGame.gameState.isChaining, cpu: cpuGame.gameState.isChaining };

  // ゲーム制御関数
  const startGame = useCallback(() => {
    if (vsGameState.isGameOver) {
      console.log('[VS CPU] Starting from game over state - restarting game');
      playerGame.restartGame();
      cpuGame.restartGame();
      resetOjama();
      setVsGameState(prev => resetVsGameState(prev.difficulty));
      cpuPlayer.stopCpuThinking();
      cpuOperationManager.cleanup();
      return;
    }
    console.log('[VS CPU] Starting normal game');
    playerGame.startGame();
    cpuGame.startGame();
    setVsGameState(prev => ({ ...prev, isPlaying: true, isPaused: false, isGameOver: false, winner: null }));
  }, [playerGame, cpuGame, cpuPlayer, vsGameState.isGameOver, resetOjama]);

  const pauseGame = useCallback(() => {
    playerGame.pauseGame();
    cpuGame.pauseGame();
    setVsGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    cpuPlayer.stopCpuThinking();
  }, [playerGame, cpuGame, cpuPlayer]);

  const restartGame = useCallback(() => {
    playerGame.restartGame();
    cpuGame.restartGame();
    resetOjama();
    setVsGameState(prev => resetVsGameState(prev.difficulty));
    cpuPlayer.stopCpuThinking();
    cpuOperationManager.cleanup();
  }, [playerGame, cpuGame, cpuPlayer, resetOjama]);

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

  // ゲーム終了処理の共通化
  const handleGameEnd = useCallback((winner: 'player' | 'cpu') => {
    console.log(`[VS CPU] Game ended - ${winner} wins`);
    
    setVsGameState(prev => ({ 
      ...prev, 
      isGameOver: true, 
      winner, 
      isPlaying: false 
    }));
    
    // 両方のゲームを完全停止
    setTimeout(() => {
      playerGame.pauseGame();
      cpuGame.pauseGame();
    }, 100);
    
    cpuPlayer.stopCpuThinking();
    cpuOperationManager.cleanup();
  }, [playerGame, cpuGame, cpuPlayer]);

  // 勝敗判定とゲーム終了処理
  useEffect(() => {
    if (!vsGameState.isGameOver) {
      if (playerGame.gameState.isGameOver) {
        handleGameEnd('cpu');
      } else if (cpuGame.gameState.isGameOver) {
        handleGameEnd('player');
      }
    }
  }, [playerGame.gameState.isGameOver, cpuGame.gameState.isGameOver, vsGameState.isGameOver, handleGameEnd]);

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