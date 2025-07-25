import type { GameDifficulty, GameState, PuyoPair } from '../types/game';
import type { CpuMove } from './cpuAI';
import { CPU_OPERATION_CONFIGS, CPU_MESSAGES } from '../constants/cpuConfig';
import { findBestMove, getCpuAiConfig } from './cpuAI';

export interface CpuOperationResult {
  success: boolean;
  move?: CpuMove;
  error?: string;
}

export class CpuOperationManager {
  private activeOperations = new Map<string, NodeJS.Timeout>();
  private processedPairs = new Set<string>();

  private generatePairId(pair: PuyoPair): string {
    return `${pair.main}-${pair.sub}`;
  }

  private clearOperation(operationId: string): void {
    const timer = this.activeOperations.get(operationId);
    if (timer) {
      clearTimeout(timer);
      this.activeOperations.delete(operationId);
    }
  }

  private executeOperations(
    bestMove: CpuMove,
    currentState: GameState,
    cpuGame: any,
    difficulty: GameDifficulty
  ): void {
    const settings = CPU_OPERATION_CONFIGS[difficulty];
    const aiConfig = getCpuAiConfig(difficulty);
    
    const targetX = bestMove.x;
    const targetRotation = bestMove.rotation;
    const currentX = currentState.currentPair!.x;
    const currentRotation = currentState.currentPair!.rotation;
    
    let delay = 0;
    
    // 回転処理
    let rotationsNeeded = (targetRotation - currentRotation + 4) % 4;
    
    // EASY用のエラー注入
    if (difficulty === 'easy' && Math.random() < settings.rotationErrorChance) {
      rotationsNeeded = (rotationsNeeded + 1) % 4;
    }
    
    // 回転実行
    if (difficulty === 'hard') {
      for (let i = 0; i < rotationsNeeded; i++) {
        cpuGame.rotateClockwise();
      }
    } else {
      for (let i = 0; i < rotationsNeeded; i++) {
        setTimeout(() => cpuGame.rotateClockwise(), delay);
        delay += settings.rotationDelay;
      }
    }
    
    // X位置調整
    let xDiff = targetX - currentX;
    
    // EASY用の位置エラー注入
    if (difficulty === 'easy' && Math.random() < settings.errorChance) {
      xDiff += Math.random() > 0.5 ? 1 : -1;
    }
    
    // 移動実行
    if (difficulty === 'hard') {
      if (xDiff > 0) {
        for (let i = 0; i < xDiff; i++) {
          cpuGame.movePair('right');
        }
      } else if (xDiff < 0) {
        for (let i = 0; i < Math.abs(xDiff); i++) {
          cpuGame.movePair('left');
        }
      }
    } else {
      if (xDiff > 0) {
        for (let i = 0; i < xDiff; i++) {
          setTimeout(() => cpuGame.movePair('right'), delay);
          delay += settings.moveDelay;
        }
      } else if (xDiff < 0) {
        for (let i = 0; i < Math.abs(xDiff); i++) {
          setTimeout(() => cpuGame.movePair('left'), delay);
          delay += settings.moveDelay;
        }
      }
    }
    
    // 最終処理（ハードドロップ判定）
    setTimeout(() => {
      const shouldHardDrop = Math.random() < aiConfig.immediateDropChance;
      
      if (shouldHardDrop) {
        console.log(CPU_MESSAGES.hardDrop(difficulty));
        cpuGame.hardDropPair();
      } else {
        console.log(CPU_MESSAGES.naturalDrop(difficulty));
      }
      
      // 処理完了をマーク
      const pairId = this.generatePairId(currentState.currentPair!);
      this.processedPairs.delete(pairId);
    }, delay + settings.finalDelay);
  }

  public executeCpuTurn(
    cpuState: GameState,
    difficulty: GameDifficulty,
    cpuGame: any
  ): CpuOperationResult {
    if (!cpuState.currentPair || cpuState.isPaused || cpuState.isChaining || cpuState.isGameOver) {
      return { success: false, error: 'Invalid state for CPU operation' };
    }

    const pairId = this.generatePairId(cpuState.currentPair);
    
    // 重複チェック
    if (this.processedPairs.has(pairId)) {
      return { success: false, error: 'Pair already being processed' };
    }

    // 前の操作をクリア
    this.clearOperation(pairId);
    
    const aiConfig = getCpuAiConfig(difficulty);
    const thinkTime = aiConfig.thinkTime;
    
    console.log(CPU_MESSAGES.processing(difficulty, pairId, thinkTime));
    this.processedPairs.add(pairId);
    
    const timer = setTimeout(() => {
      // 状態が変わっていないかチェック
      if (!cpuState.currentPair || cpuState.isPaused || cpuState.isChaining) {
        console.log(CPU_MESSAGES.operationCancelled(difficulty));
        this.processedPairs.delete(pairId);
        return;
      }
      
      console.log(CPU_MESSAGES.thinking(difficulty));
      const bestMove = findBestMove(cpuState.grid, cpuState.currentPair, difficulty, cpuState.nextPair);
      
      if (bestMove) {
        console.log(CPU_MESSAGES.foundMove(difficulty, bestMove.x, bestMove.rotation));
        this.executeOperations(bestMove, cpuState, cpuGame, difficulty);
      } else {
        console.log(CPU_MESSAGES.noValidMove(difficulty));
        cpuGame.hardDropPair();
        this.processedPairs.delete(pairId);
      }
    }, thinkTime);
    
    this.activeOperations.set(pairId, timer);
    
    return { success: true };
  }

  public resetForNewPair(): void {
    console.log(CPU_MESSAGES.readyForNext());
    this.processedPairs.clear();
  }

  public cleanup(): void {
    this.activeOperations.forEach(timer => clearTimeout(timer));
    this.activeOperations.clear();
    this.processedPairs.clear();
  }
}

export const cpuOperationManager = new CpuOperationManager();