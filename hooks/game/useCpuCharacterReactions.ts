import { useEffect, useRef, useState } from 'react';
import {
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
  character: CpuCharacter;
  isGameOver: boolean;
  winner: string | null;
  player: SideState;
  cpu: SideState;
  /** CPU の盤面にあるおじゃまの数（増えたら「食らった」声） */
  cpuOjama: number;
  /** CPU の盤面が上まで積み上がっているか */
  cpuPinch: boolean;
}

export interface CpuCutin {
  src: string;
  id: number;
}

/** おじゃまを食らった声は、ほかの台詞からこれだけ空いていれば言う */
const DAMAGED_GAP_MS = 1500;

// currentChainStep は「消えた回数 - 1」
const roundsOf = (side: SideState) => (side.isChaining ? side.currentChainStep + 1 : 0);

/** 対戦の流れに合わせて、CPU キャラの台詞とカットインを決める */
export const useCpuCharacterReactions = ({ character, isGameOver, winner, player, cpu, cpuOjama, cpuPinch }: Params) => {
  const [lineKind, setLineKind] = useState<CpuLineKind>('intro');
  const [lineIndex, setLineIndex] = useState(() => Math.floor(Math.random() * Math.max(1, character.lines.intro.length)));
  // 同じ台詞をもう一度言ったときも分かるように、言うたびに数える（ボイスの合図）
  const [lineTick, setLineTick] = useState(0);
  const lastIndex = useRef<Partial<Record<CpuLineKind, number>>>({});
  const lastSaidAt = useRef(0);

  /** 場面の台詞を、前回と違う1本から選んで言う */
  const say = (kind: CpuLineKind) => {
    const count = character.lines[kind].length;
    if (count === 0) return;
    let n = Math.floor(Math.random() * count);
    if (count > 1 && n === lastIndex.current[kind]) n = (n + 1) % count;
    lastIndex.current[kind] = n;
    lastSaidAt.current = Date.now();
    setLineKind(kind);
    setLineIndex(n);
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
    if (cpuFired.current || cpuRounds < CUTIN_MIN_CHAIN || character.cutins.length === 0) return;
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

  // おじゃまが降ってきた瞬間
  const prevOjama = useRef(cpuOjama);
  useEffect(() => {
    const landed = cpuOjama > prevOjama.current;
    prevOjama.current = cpuOjama;
    if (landed && !isGameOver && Date.now() - lastSaidAt.current > DAMAGED_GAP_MS) say('damaged');
  }, [cpuOjama]);

  // 上まで積み上がったとき（下がってからまた積み上がれば、また言う）
  useEffect(() => {
    if (cpuPinch && !isGameOver) say('pinch');
  }, [cpuPinch]);

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

  const options = character.lines[lineKind];
  const index = Math.min(lineIndex, Math.max(0, options.length - 1));
  return { line: options[index] ?? '', lineKind, lineIndex: index, lineTick, cutin };
};
