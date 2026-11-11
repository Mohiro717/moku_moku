import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, PuyoPair, PuyoCell, ChainResult, ChainProcessingState, OjamaLink } from '../types/game';
import {
  GAME_CONFIG,
  createEmptyGrid,
  createRandomPair,
  getPairPositions,
  isValidPosition,
  canPlacePair,
  processChains,
  findChainsToHighlight,
  markPuyosForDeletion,
  removeDeletedPuyos,
  applyGravity,
  lockPairToGrid,
  calculateChainScore
} from '../utils/puyoGameLogic';
import { removeAdjacentOjama, dropOjamaPuyos } from '../utils/ojamaSystem';
import { attemptRotationWithKick } from '../utils/puyoKickSystem';
import { GAME_TIMINGS } from '../constants/gameTimings';

/**
 * 開発用：URL に ?chaintest を付けて開いた開発サーバーでだけ、6連鎖の階段を置いて始める。
 * 最初のペア（赤の上に青）をそのまま左端へ落とすと、赤→青→緑→黄→赤→青と6連鎖して全部消える。
 * 本番のビルドでは import.meta.env.DEV が false になり、この中身ごと消える。
 */
const chainTestStart = (): Pick<GameState, 'grid' | 'currentPair'> | null => {
  if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('chaintest')) return null;
  const grid = createEmptyGrid();
  const colors = ['red', 'blue', 'green', 'yellow', 'red', 'blue'] as const;
  const bottom = GAME_CONFIG.gridHeight - 1;
  colors.forEach((color, x) => {
    for (let r = 0; r < 3; r++) grid[bottom - r][x].color = color;
    // 上に乗せた鍵：下の3つが消えると落ちて、右の列の3つとつながる
    if (x >= 1 && x <= 4) grid[bottom - 3][x].color = colors[x + 1];
  });
  return { grid, currentPair: { main: 'red', sub: 'blue', x: 0, y: 1, rotation: 0 } };
};

/**
 * 開発用：URL に ?ojamatest を付けて開いた開発サーバーの「ひとりで」でだけ、ペアを置くたびに
 * おじゃまを 1→3→6→12→18→30 個の順に降らせる（量で変わる音の聞き比べ用）。
 * 降らせる前に盤面を空にするので、どの回も数どおりに積もる。
 */
const OJAMA_TEST = import.meta.env.DEV && new URLSearchParams(location.search).has('ojamatest') ? [1, 3, 6, 12, 18, 30] : null;
let ojamaTestTurn = 0;

const createInitialGameState = (): GameState => ({
  grid: createEmptyGrid(),
  currentPair: null,
  nextPair: createRandomPair(),
  nextNextPair: createRandomPair(),
  score: 0,
  chainCount: 0,
  isGameOver: false,
  isPaused: false,
  isPlaying: false,
  isChaining: false,
  lastFallTime: 0,
  chainAnimationStep: 'idle',
  currentChainStep: 0
});

export const usePuyoGame = (ojamaLink?: OjamaLink) => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  // 連鎖の途中や着地のタイマーから呼ぶので、毎回最新の口を見る
  const ojamaLinkRef = useRef(ojamaLink);
  ojamaLinkRef.current = ojamaLink;
  // おじゃまを降らせた直後の着地判定ではもう取らない（1回の着地で降るのは1回まで）
  const ojamaDropped = useRef(false);
  // 連鎖の処理は await をまたぐので、ポーズで止める・始め直しで打ち切るための目印
  const pausedRef = useRef(false);
  pausedRef.current = gameState.isPaused;
  const gameIdRef = useRef(0);

  /** ms 待つ。ポーズ中は再開まで待つ。その間に試合が始め直されていたら false */
  const wait = useCallback(async (ms: number, gameId: number): Promise<boolean> => {
    await new Promise<void>(resolve => setTimeout(resolve, ms));
    while (pausedRef.current && gameIdRef.current === gameId) {
      await new Promise<void>(resolve => setTimeout(resolve, 100));
    }
    return gameIdRef.current === gameId;
  }, []);
  const gameLoopRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  // Pair movement handlers
  const movePair = useCallback((direction: 'left' | 'right' | 'down') => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      let newPair = { ...prev.currentPair };
      
      switch (direction) {
        case 'left':
          newPair.x = Math.max(0, newPair.x - 1);
          break;
        case 'right':
          newPair.x = Math.min(GAME_CONFIG.gridWidth - 1, newPair.x + 1);
          break;
        case 'down':
          newPair.y = newPair.y + 1;
          break;
      }

      return canPlacePair(prev.grid, newPair) 
        ? { ...prev, currentPair: newPair }
        : prev;
    });
  }, []);

  const rotatePair = useCallback((clockwise: boolean = true) => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      // Use kick system for rotation
      const kickResult = attemptRotationWithKick(prev.currentPair, prev.grid, clockwise);
      
      if (kickResult.success && kickResult.kickedPair) {
        return {
          ...prev,
          currentPair: kickResult.kickedPair
        };
      }

      // If kick system fails, no rotation occurs
      return prev;
    });
  }, []);

  // Hard drop - instantly drop pair to bottom
  const hardDropPair = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      let newPair = { ...prev.currentPair };
      
      // Keep moving down until we can't place the pair
      while (canPlacePair(prev.grid, { ...newPair, y: newPair.y + 1 })) {
        newPair.y++;
      }
      
      
      // Lock the pair immediately after hard drop
      const { newGrid, isGameOver } = lockPairToGrid(newPair, prev.grid);
      
      return {
        ...prev,
        grid: newGrid,
        currentPair: null,
        isGameOver,
        isPlaying: !isGameOver
      };
    });
  }, []);

  // Pair locking
  const lockPair = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPair) return prev;

      const { newGrid, isGameOver } = lockPairToGrid(prev.currentPair, prev.grid);

      return {
        ...prev,
        grid: newGrid,
        currentPair: null,
        isGameOver,
        isPlaying: !isGameOver
      };
    });
  }, []);

  // Helper functions for chain processing
  const showHighlightedPuyos = useCallback(async (grid: PuyoCell[][], actualChains: number): Promise<void> => {
    setGameState(prev => ({ 
      ...prev, 
      grid,
      chainAnimationStep: 'highlighting',
      currentChainStep: actualChains,
      isChaining: true
    }));
  }, []);

  const showDeletingPuyos = useCallback(async (grid: PuyoCell[][]): Promise<PuyoCell[][]> => {
    const deletingGrid = markPuyosForDeletion(grid);
    setGameState(prev => ({ 
      ...prev, 
      grid: deletingGrid,
      chainAnimationStep: 'deleting',
      isChaining: true
    }));
    return deletingGrid;
  }, []);

  const removePuyosFromGrid = useCallback((sourceGrid: PuyoCell[][], targetGrid: PuyoCell[][]): void => {
    // 削除されるぷよの位置を収集
    const deletedPositions: Array<{ x: number; y: number }> = [];
    
    for (let row = 0; row < sourceGrid.length; row++) {
      for (let col = 0; col < sourceGrid[row].length; col++) {
        if (sourceGrid[row][col].isConnected) {
          // 色つきぷよを削除
          targetGrid[row][col] = {
            color: null,
            id: Math.random().toString(36)
          };
          // 削除位置を記録（お邪魔ぷよ削除用）
          deletedPositions.push({ x: col, y: row });
        }
      }
    }
    
    // お邪魔ぷよの隣接削除処理
    if (deletedPositions.length > 0) {
      const { newGrid } = removeAdjacentOjama(targetGrid, deletedPositions);
      
      // 削除されたお邪魔ぷよを反映
      for (let row = 0; row < targetGrid.length; row++) {
        for (let col = 0; col < targetGrid[row].length; col++) {
          targetGrid[row][col] = newGrid[row][col];
        }
      }
    }
  }, []);

  const showFallingAnimation = useCallback(async (grid: PuyoCell[][]): Promise<void> => {
    setGameState(prev => ({ 
      ...prev, 
      grid,
      chainAnimationStep: 'falling',
      isChaining: true
    }));
  }, []);


  const updateFinalState = useCallback(async (
    grid: PuyoCell[][], 
    score: number, 
    actualChains: number
  ): Promise<void> => {
    setGameState(prev => ({ 
      ...prev, 
      grid,
      score,
      chainCount: Math.max(actualChains, prev.chainCount),
      chainAnimationStep: 'complete'
    }));
  }, []);

  // Main chain processing function
  const processChainReaction = useCallback(async () => {
    const gameId = gameIdRef.current;
    setGameState(prev => ({ 
      ...prev, 
      isChaining: true,
      chainAnimationStep: 'highlighting',
      currentChainStep: 0
    }));

    let currentGrid = [...gameState.grid.map(row => [...row])];
    let deletionRounds = 0;
    let totalScore = gameState.score;
    const MAX_CHAIN_ROUNDS = 20; // 無限ループ防止
    let consecutiveNoChains = 0; // 連続で連鎖が発生しない回数


    while (deletionRounds < MAX_CHAIN_ROUNDS) {
      const { newGrid, chainOccurred, deletedCount } = processChains(currentGrid);
      
      if (!chainOccurred || deletedCount === 0) {
        consecutiveNoChains++;
        
        // 連続で2回連鎖が発生しなければ終了
        if (consecutiveNoChains >= 2) {
          break;
        }
        
        // 重力だけ適用して再チェック
        currentGrid = applyGravity(currentGrid);
        continue;
      }

      // 連鎖が発生した場合
      consecutiveNoChains = 0;
      deletionRounds++;
      const actualChains = Math.max(0, deletionRounds - 1);
      
      
      // 異常検知: 同じ削除数が10回以上続いた場合は強制終了
      if (deletionRounds > 10 && deletedCount === 4) {
        console.error(`[PUYO CHAIN] EMERGENCY STOP: Same chain pattern detected ${deletionRounds} times - forcing end`);
        break;
      }
      
      // 消えた瞬間に相手へのおじゃまを積む（相殺もここで効く）
      ojamaLinkRef.current?.onChainStep(deletionRounds, deletedCount);

      // Step 1: Show highlighted puyos (before deletion)
      const highlightGrid = findChainsToHighlight(currentGrid);
      await showHighlightedPuyos(highlightGrid.newGrid, actualChains);
      if (!(await wait(GAME_TIMINGS.highlight, gameId))) return;
      
      // Step 2: Show deleting animation
      await showDeletingPuyos(highlightGrid.newGrid);
      if (!(await wait(GAME_TIMINGS.deletion, gameId))) return;
      
      // Step 3: Apply deletion (use processChains result which includes ojama removal)
      currentGrid = newGrid.map(row => row.map(cell => ({ ...cell })));
      
      // デバッグ: グリッド状態を確認
      const remainingPuyos = currentGrid.flat().filter(cell => cell.color && cell.color !== null).length;
      
      await showFallingAnimation(currentGrid);
      if (!(await wait(GAME_TIMINGS.falling, gameId))) return;
      
      // 重力適用
      currentGrid = applyGravity(currentGrid);
      totalScore += calculateChainScore(deletedCount, Math.max(1, actualChains + 1));
      
      await updateFinalState(currentGrid, totalScore, actualChains);
      if (!(await wait(GAME_TIMINGS.complete, gameId))) return;
    }

    if (deletionRounds >= MAX_CHAIN_ROUNDS) {
      console.warn(`[PUYO CHAIN] Hit maximum chain limit of ${MAX_CHAIN_ROUNDS}! Stopping to prevent infinite loop.`);
    }


    setGameState(prev => ({ 
      ...prev, 
      isChaining: false,
      chainAnimationStep: 'idle',
      currentChainStep: 0
    }));
  }, [
    gameState.grid, 
    gameState.score, 
    showHighlightedPuyos, 
    showDeletingPuyos, 
    showFallingAnimation, 
    updateFinalState,
    wait
  ]);

  // Simple auto-fall mechanism
  const handleAutoFall = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPair || prev.isGameOver || prev.isPaused || prev.isChaining) {
        return prev;
      }

      const newPair = { ...prev.currentPair, y: prev.currentPair.y + 1 };
      
      if (canPlacePair(prev.grid, newPair)) {
        return { 
          ...prev, 
          currentPair: newPair
        };
      } else {
        // Can't fall further, lock the pair
        const lockResult = lockPairToGrid(prev.currentPair, prev.grid);
        
        return {
          ...prev,
          grid: lockResult.newGrid,
          currentPair: null,
          isGameOver: lockResult.isGameOver,
          isPlaying: !lockResult.isGameOver
        };
      }
    });
  }, []);

  // Auto-fall timer
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPair) {
      return;
    }

    const fallTimer = setInterval(() => {
      handleAutoFall();
    }, GAME_CONFIG.fallSpeed);

    return () => clearInterval(fallTimer);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPair, handleAutoFall]);

  // Chain processing trigger - should happen BEFORE spawning new pair
  useEffect(() => {
    if (!gameState.currentPair && !gameState.isChaining && gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      // First check for chains, then spawn new pair
      const timer = setTimeout(async () => {
        // Check if there are any chains to process
        const { chainOccurred } = findChainsToHighlight(gameState.grid);
        
        if (chainOccurred) {
          // Process chains
          await processChainReaction();
        } else {
          // 連鎖が起きなかったら、ためていたおじゃまを先に降らせる。
          // grid が変わるのでこの effect がもう一度走り、落ち切ってから次のペアが出る
          if (!ojamaDropped.current) {
            if (OJAMA_TEST && !ojamaLinkRef.current && gameState.grid.some(row => row.some(cell => cell.color))) {
              setGameState(prev => ({ ...prev, grid: createEmptyGrid() }));
              return;
            }
            const ojama =
              ojamaLinkRef.current?.takeOjama() ?? (OJAMA_TEST ? OJAMA_TEST[ojamaTestTurn++ % OJAMA_TEST.length] : 0);
            if (ojama > 0) {
              ojamaDropped.current = true;
              setGameState(prev => (prev.isGameOver ? prev : { ...prev, grid: dropOjamaPuyos(prev.grid, ojama) }));
              return;
            }
          }
          ojamaDropped.current = false;

          // No chains, spawn new pair
          setGameState(prev => {
            if (prev.isGameOver) {
              console.log('[PUYO GAME] Blocked pair spawn - game is over');
              return prev;
            }
            
            const newPair = prev.nextPair || createRandomPair();
            const nextPair = prev.nextNextPair || createRandomPair();
            const nextNextPair = createRandomPair();
            
            console.log('[PUYO GAME] Spawning new pair:', {
              current: newPair,
              next: nextPair
            });
            
            if (canPlacePair(prev.grid, newPair)) {
              return { 
                ...prev, 
                currentPair: newPair,
                nextPair,
                nextNextPair
              };
            } else {
              console.log('[PUYO GAME] Cannot place new pair - game over');
              return { 
                ...prev, 
                isGameOver: true, 
                isPlaying: false 
              };
            }
          });
        }
      }, GAME_TIMINGS.landing);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPair, gameState.isChaining, gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.grid, processChainReaction]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          movePair('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          movePair('right');
          break;
        case 'z':
        case 'Z':
          event.preventDefault();
          rotatePair(false);
          break;
        case 'x':
        case 'X':
          event.preventDefault();
          rotatePair(true);
          break;
        case 'ArrowDown':
          event.preventDefault();
          movePair('down');
          break;
        case ' ':
        case 'Space':
          event.preventDefault();
          hardDropPair();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, movePair, rotatePair]);

  // Game control functions
  const startGame = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver) {
        const newState = createInitialGameState();
        return {
          ...newState,
          isPlaying: true,
          currentPair: createRandomPair(),
          nextPair: createRandomPair(),
          nextNextPair: createRandomPair()
        };
      }
      return {
        ...prev,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        currentPair: createRandomPair(),
        nextPair: createRandomPair(),
        nextNextPair: createRandomPair(),
        chainAnimationStep: 'idle',
        currentChainStep: 0,
        ...chainTestStart()
      };
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const restartGame = useCallback(() => {
    ojamaDropped.current = false;
    gameIdRef.current++; // 走っている連鎖を打ち切る
    setGameState(createInitialGameState());
  }, []);

  const rotateClockwise = useCallback(() => rotatePair(true), [rotatePair]);
  const rotateCounterClockwise = useCallback(() => rotatePair(false), [rotatePair]);

  return {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    movePair,
    rotatePair,
    rotateClockwise,
    rotateCounterClockwise,
    hardDropPair,
    getPairPositions,
    config: GAME_CONFIG
  };
};