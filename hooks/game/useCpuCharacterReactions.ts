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
  /** このキャラが言う台詞（CPU 側は character.lines、自分の側は味方用の台詞） */
  lines: Record<CpuLineKind, string[]>;
  isGameOver: boolean;
  /** このキャラの側が勝ったか */
  won: boolean;
  /** このキャラの側の盤面 */
  self: SideState;
  /** 向かいの盤面 */
  opponent: SideState;
  /** このキャラの側の盤面にあるおじゃまの数（増えたら「食らった」声） */
  selfOjama: number;
  /** このキャラの側の盤面が上まで積み上がり、しかも向かいより高いか（ピンチの台詞用） */
  selfPinch: boolean;
}

export interface CpuCutin {
  src: string;
  id: number;
}

/** おじゃまを食らった声は、ほかの台詞からこれだけ空いていれば言う */
const DAMAGED_GAP_MS = 1500;
/**
 * おじゃまを食らった声は、降ってきたおじゃまを送った向かいの連鎖がこれ以上のときだけ言う。
 * 1連鎖・2連鎖の少しのおじゃまで毎回言うとくどい（2026-11-09 オーナー）
 */
export const DAMAGED_MIN_CHAIN = 3;
/** ピンチの台詞を続けて言わない間隔 */
const PINCH_GAP_MS = 8000;

// currentChainStep は「消えた回数 - 1」
const roundsOf = (side: SideState) => (side.isChaining ? side.currentChainStep + 1 : 0);

/** 対戦の流れに合わせて、片方の側のキャラの台詞とカットインを決める（CPU 側と自分の側で1つずつ使う） */
export const useCharacterReactions = ({ character, lines, isGameOver, won, self, opponent, selfOjama, selfPinch }: Params) => {
  const [lineKind, setLineKind] = useState<CpuLineKind>('intro');
  const [lineIndex, setLineIndex] = useState(() => Math.floor(Math.random() * Math.max(1, lines.intro.length)));
  // 同じ台詞をもう一度言ったときも分かるように、言うたびに数える（ボイスの合図）
  const [lineTick, setLineTick] = useState(0);
  const lastIndex = useRef<Partial<Record<CpuLineKind, number>>>({});
  const lastSaidAt = useRef(0);

  /** 場面の台詞を、前回と違う1本から選んで言う */
  const say = (kind: CpuLineKind) => {
    const count = lines[kind].length;
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
  const selfFired = useRef(false);
  const opponentFired = useRef(false);

  // カットインは1本1〜3MB。出す瞬間に読み込みが間に合うよう、キャラが決まった時点で先読みする
  useEffect(() => {
    character.cutins.forEach(src => {
      new Image().src = src;
    });
  }, [character]);

  const selfRounds = roundsOf(self);
  const opponentRounds = roundsOf(opponent);

  // こちらの大連鎖: 1連鎖につき1回だけカットイン
  useEffect(() => {
    if (selfRounds === 0) {
      selfFired.current = false;
      return;
    }
    if (selfFired.current || selfRounds < CUTIN_MIN_CHAIN || character.cutins.length === 0) return;
    selfFired.current = true;
    const n = cutinCount.current++;
    const len = character.cutins.length;
    // 同じ URL の動く webp は頭から再生し直されないことがあるので、2周目からは URL を変える
    const lap = Math.floor(n / len);
    const src = character.cutins[n % len] + (lap > 0 ? `?lap=${lap}` : '');
    setCutin({ src, id: n });
    say('attack');
  }, [selfRounds, character]);

  // 前におじゃまが降ってから、向かいがした一番長い連鎖（いま降ってきたおじゃまの出どころ）
  const opponentBestChain = useRef(0);
  useEffect(() => {
    if (opponentRounds > opponentBestChain.current) opponentBestChain.current = opponentRounds;
  }, [opponentRounds]);

  // 向かいの大連鎖を受けたとき
  useEffect(() => {
    if (opponentRounds === 0) {
      opponentFired.current = false;
      return;
    }
    if (opponentFired.current || opponentRounds < CUTIN_MIN_CHAIN) return;
    opponentFired.current = true;
    say('attacked');
  }, [opponentRounds]);

  // おじゃまが降ってきた瞬間（大きな連鎖から来たものだけ。小さな連鎖のおじゃまは黙って受ける）
  const prevOjama = useRef(selfOjama);
  useEffect(() => {
    const landed = selfOjama > prevOjama.current;
    prevOjama.current = selfOjama;
    if (!landed) return;
    const bigChain = opponentBestChain.current >= DAMAGED_MIN_CHAIN;
    opponentBestChain.current = 0;
    if (bigChain && !isGameOver && Date.now() - lastSaidAt.current > DAMAGED_GAP_MS) say('damaged');
  }, [selfOjama]);

  // 上まで積み上がって、こちらより危ないとき（下がってからまた積み上がれば、また言う。ただし続けて何度も言わない）
  const lastPinchAt = useRef(0);
  useEffect(() => {
    if (!selfPinch || isGameOver || Date.now() - lastPinchAt.current < PINCH_GAP_MS) return;
    lastPinchAt.current = Date.now();
    say('pinch');
  }, [selfPinch]);

  // 勝敗。RESTART で isGameOver が戻ったら最初の台詞へ
  useEffect(() => {
    if (isGameOver) {
      say(won ? 'win' : 'lose');
    } else {
      setLineKind('intro');
      setCutin(null);
      opponentBestChain.current = 0;
    }
  }, [isGameOver, won]);

  useEffect(() => {
    if (!cutin) return;
    const timer = setTimeout(() => setCutin(null), CUTIN_DURATION_MS);
    return () => clearTimeout(timer);
  }, [cutin]);

  const options = lines[lineKind];
  const index = Math.min(lineIndex, Math.max(0, options.length - 1));
  return { line: options[index] ?? '', lineKind, lineIndex: index, lineTick, cutin };
};
