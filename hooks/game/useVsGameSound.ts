import { useEffect, useRef } from 'react';
import type { GameState, PuyoPair, VsGameState } from '../../types/game';
import { chainVoiceOf, type CpuCharacter, type CpuLineKind } from '../../constants/cpuCharacters';
import type { CpuCutin } from './useCpuCharacterReactions';
import { countOjama, isPinch } from '../../utils/boardStatus';
import {
  pauseBgm,
  playBgm,
  playChainVoice,
  playSe,
  playVoice,
  preloadVoices,
  resumeBgm,
  setBgmPinch,
  stopBgm,
  stopVoice,
  type VoiceTiming
} from '../../utils/gameAudio';

/** 片方の側のキャラが、いま何を言ったか（useCharacterReactions の戻り値） */
export interface SideVoice {
  character: CpuCharacter;
  lineKind: CpuLineKind;
  lineIndex: number;
  lineTick: number;
  cutin: CpuCutin | null;
  /** 台詞のボイスの場所（CPU 側は voiceOf、自分の側は allyVoiceOf） */
  voiceSrc: (kind: CpuLineKind, n: number) => string;
  /** 先読みするボイス */
  voices: string[];
}

interface Params {
  gameState: VsGameState | null;
  /** 相手（CPU）の側 */
  cpu: SideVoice;
  /** 自分の側（プレイヤーが選んだキャラ） */
  ally: SideVoice;
  /** どちらかの盤面が上まで積み上がっているか（BGM を速くする） */
  pinch: boolean;
}

/**
 * 声の出口は1つ。両方の側が同時に言うときは、技を出した側・勝った側が先に言い、
 * 受けた側・負けた側はそのあとに言う。おじゃまを食らった短い声は、何も言っていないときだけ
 */
const LINE_TIMING: Record<CpuLineKind, VoiceTiming> = {
  intro: 'now',
  attack: 'now',
  win: 'now',
  attacked: 'after',
  lose: 'after',
  pinch: 'after',
  damaged: 'ifIdle'
};

/** 相手側の音は小さめに */
const CPU_VOLUME = 0.45;
/** 勝ち負けの決めの音楽を聞かせてから台詞を言う */
const RESULT_VOICE_DELAY_MS = 2300;

/** 自分のぷよの動き（横移動・回転・着地）を前の状態と比べて鳴らす */
const pairSound = (prev: PuyoPair | null, cur: PuyoPair | null) => {
  if (!prev) return;
  if (!cur || cur.y < prev.y) {
    playSe('land');
    return;
  }
  if (cur.rotation !== prev.rotation) playSe('rotate');
  else if (cur.x !== prev.x) playSe('move');
};

/**
 * 連鎖の各段で消える瞬間と、おじゃまが降ってきた瞬間を鳴らす。
 * onChainStep を渡すと、消える瞬間に段（1始まり）を渡して呼ぶ（掛け声用）
 */
const useBoardSound = (side: GameState | undefined, volume: number, onChainStep?: (step: number) => void) => {
  const prevStep = useRef(side?.chainAnimationStep);
  const prevOjama = useRef(0);
  const step = side?.chainAnimationStep;
  const ojama = side ? countOjama(side.grid) : 0;
  // そろって点滅している間（はじける前のため）。連鎖の判定の始めにも highlighting になるので、そろったぷよがあるかで見る
  const charging = step === 'highlighting' && !!side?.grid.some(row => row.some(cell => cell.isConnected));

  useEffect(() => {
    if (charging && side) playSe('charge', side.currentChainStep + 1, volume);
  }, [charging]);

  useEffect(() => {
    if (side && step === 'deleting' && prevStep.current !== 'deleting') {
      playSe('pop', side.currentChainStep + 1, volume);
      onChainStep?.(side.currentChainStep + 1);
    }
    prevStep.current = step;
  }, [step]);

  useEffect(() => {
    if (ojama > prevOjama.current) playSe('ojama', 1, volume);
    prevOjama.current = ojama;
  }, [ojama]);
};

/** 対戦の BGM・効果音・ボイス */
export const useVsGameSound = ({ gameState, cpu, ally, pinch }: Params) => {
  const isPlaying = !!gameState?.isPlaying;
  const isPaused = !!gameState?.isPaused;
  const isGameOver = !!gameState?.isGameOver;
  const winner = gameState?.winner ?? null;
  const character = cpu.character;

  useEffect(() => {
    preloadVoices(cpu.voices);
  }, [cpu.character]);
  useEffect(() => {
    preloadVoices(ally.voices);
  }, [ally.character]);

  // 始まり・ポーズ・終わり
  const wasPlaying = useRef(false);
  useEffect(() => {
    if (isPlaying && !wasPlaying.current && !isGameOver) {
      playSe('start');
      // BGM は相手のテーマ曲。はじめの台詞は、はじまりの演出（PuyoVsCpuGame の VS・カウント）のあいだに言う
      playBgm(character.bgm);
    }
    if (!isPlaying && wasPlaying.current && !isGameOver) {
      // RESTART
      stopBgm();
      stopVoice();
    }
    wasPlaying.current = isPlaying;
  }, [isPlaying, isGameOver, character]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    if (isPaused) pauseBgm();
    else resumeBgm();
  }, [isPaused]);

  useEffect(() => {
    if (isPlaying && !isGameOver) setBgmPinch(pinch);
  }, [pinch, isPlaying, isGameOver]);

  // 勝ち負け：BGM を止めて決めの音楽
  useEffect(() => {
    if (!isGameOver) return;
    stopBgm();
    playSe(winner === 'player' ? 'win' : 'lose');
  }, [isGameOver]);

  useEffect(() => () => {
    stopBgm();
    stopVoice();
  }, []);

  useSideLineVoice(cpu);
  useSideLineVoice(ally);

  useEffect(() => {
    if (cpu.cutin) playSe('cutin');
  }, [cpu.cutin?.id]);
  useEffect(() => {
    if (ally.cutin) playSe('cutin');
  }, [ally.cutin?.id]);

  // 自分のぷよの操作音
  const playerPair = gameState?.player.currentPair ?? null;
  const prevPair = useRef<PuyoPair | null>(null);
  useEffect(() => {
    if (isPlaying && !isPaused) pairSound(prevPair.current, playerPair);
    prevPair.current = playerPair;
  }, [playerPair?.x, playerPair?.y, playerPair?.rotation, !!playerPair]);

  useBoardSound(gameState?.player, 1, step => {
    if (ally.character.chain.length > 0) playChainVoice(chainVoiceOf(ally.character, step), 'player');
  });
  useBoardSound(gameState?.cpu, CPU_VOLUME, step => {
    if (character.chain.length > 0) playChainVoice(chainVoiceOf(character, step), 'cpu');
  });
};

/** 片方の側が台詞を言うたびにボイス（intro は START のときに鳴らす） */
const useSideLineVoice = ({ lineKind, lineIndex, lineTick, voiceSrc }: SideVoice) => {
  useEffect(() => {
    if (lineTick === 0 || lineKind === 'intro') return;
    const src = voiceSrc(lineKind, lineIndex);
    const timing = LINE_TIMING[lineKind];
    if (lineKind === 'win' || lineKind === 'lose') {
      const timer = setTimeout(() => playVoice(src, timing), RESULT_VOICE_DELAY_MS);
      return () => clearTimeout(timer);
    }
    playVoice(src, timing);
  }, [lineTick]);
};

/**
 * ひとりであそぶの BGM・効果音・ボイス。選んだキャラが、あるじどのの味方として横で言う
 * （BGM はそのキャラのテーマ曲。相手がいないので、言うのは はじめ・大連鎖・ピンチ・おしまい）
 */
export const useSoloGameSound = ({ gameState, ally }: { gameState: GameState; ally: SideVoice }) => {
  const { isPlaying, isPaused, isGameOver } = gameState;
  const pinch = isPinch(gameState.grid);

  useEffect(() => {
    preloadVoices(ally.voices);
  }, [ally.character]);

  const wasPlaying = useRef(false);
  useEffect(() => {
    if (isPlaying && !wasPlaying.current && !isGameOver) {
      playSe('start');
      playBgm(ally.character.bgm);
      playVoice(ally.voiceSrc('intro', ally.lineIndex));
    }
    if (!isPlaying && wasPlaying.current && !isGameOver) {
      // やりなおす
      stopBgm();
      stopVoice();
    }
    wasPlaying.current = isPlaying;
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    if (isPaused) pauseBgm();
    else resumeBgm();
  }, [isPaused]);

  useEffect(() => {
    if (isPlaying && !isGameOver) setBgmPinch(pinch);
  }, [pinch, isPlaying, isGameOver]);

  useEffect(() => {
    if (!isGameOver) return;
    stopBgm();
    playSe('lose');
  }, [isGameOver]);

  useEffect(() => () => {
    stopBgm();
    stopVoice();
  }, []);

  useSideLineVoice(ally);
  useEffect(() => {
    if (ally.cutin) playSe('cutin');
  }, [ally.cutin?.id]);

  const pair = gameState.currentPair;
  const prevPair = useRef<PuyoPair | null>(null);
  useEffect(() => {
    if (isPlaying && !isPaused) pairSound(prevPair.current, pair);
    prevPair.current = pair;
  }, [pair?.x, pair?.y, pair?.rotation, !!pair]);

  useBoardSound(gameState, 1, step => {
    if (ally.character.chain.length > 0) playChainVoice(chainVoiceOf(ally.character, step), 'player');
  });
};
