import { useEffect, useRef, useState } from 'react';
import type { GameDifficulty } from '../../types/game';
import {
  CPU_CHARACTERS,
  CUTIN_DURATION_MS,
  CUTIN_MIN_CHAIN,
  type CpuCharacter,
  type CpuLineKind
} from '../../constants/cpuCharacters';

interface SideState {
  isChaining: boolean;
  currentChainStep: number;
}

interface Params {
  difficulty: GameDifficulty;
  isGameOver: boolean;
  winner: string | null;
  player: SideState;
  cpu: SideState;
}

export interface CpuCutin {
  src: string;
  id: number;
}

// currentChainStep は「消えた回数 - 1」
const roundsOf = (side: SideState) => (side.isChaining ? side.currentChainStep + 1 : 0);

/** 対戦の流れに合わせて、CPU キャラの台詞とカットインを決める */
export const useCpuCharacterReactions = ({ difficulty, isGameOver, winner, player, cpu }: Params) => {
  const character: CpuCharacter = CPU_CHARACTERS[difficulty];
  const [lineKind, setLineKind] = useState<CpuLineKind>('intro');
  // 同じ台詞をもう一度言ったときも分かるように、言うたびに数える（ボイスの合図）
  const [lineTick, setLineTick] = useState(0);
  const say = (kind: CpuLineKind) => {
    setLineKind(kind);
    setLineTick(t => t + 1);
  };
  const [cutin, setCutin] = useState<CpuCutin | null>(null);
  const cutinCount = useRef(0);
  const cpuFired = useRef(false);
  const playerFired = useRef(false);

  // カットインは1本1〜3MB。出す瞬間に読み込みが間に合うよう、相手が決まった時点で先読みする
  useEffect(() => {
    character.cutins.forEach(src => {
      new Image().src = src;
    });
  }, [character]);

  const cpuRounds = roundsOf(cpu);
  const playerRounds = roundsOf(player);

  // CPU の大連鎖: 1連鎖につき1回だけカットイン
  useEffect(() => {
    if (cpuRounds === 0) {
      cpuFired.current = false;
      return;
    }
    if (cpuFired.current || cpuRounds < CUTIN_MIN_CHAIN) return;
    cpuFired.current = true;
    const n = cutinCount.current++;
    const len = character.cutins.length;
    // 同じ URL の動く webp は頭から再生し直されないことがあるので、2周目からは URL を変える
    const lap = Math.floor(n / len);
    const src = character.cutins[n % len] + (lap > 0 ? `?lap=${lap}` : '');
    setCutin({ src, id: n });
    say('attack');
  }, [cpuRounds, character]);

  // プレイヤーの大連鎖を受けたとき
  useEffect(() => {
    if (playerRounds === 0) {
      playerFired.current = false;
      return;
    }
    if (playerFired.current || playerRounds < CUTIN_MIN_CHAIN) return;
    playerFired.current = true;
    say('attacked');
  }, [playerRounds]);

  // 勝敗。RESTART で isGameOver が戻ったら最初の台詞へ
  useEffect(() => {
    if (isGameOver) {
      say(winner === 'cpu' ? 'win' : 'lose');
    } else {
      setLineKind('intro');
      setCutin(null);
    }
  }, [isGameOver, winner]);

  useEffect(() => {
    if (!cutin) return;
    const timer = setTimeout(() => setCutin(null), CUTIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [cutin]);

  return { character, line: character.lines[lineKind], lineKind, lineTick, cutin };
};
