import { useEffect, useRef } from 'react';
import type { GameState, PuyoPair, VsGameState } from '../../types/game';
import { allVoicesOf, chainVoiceOf, voiceOf, type CpuCharacter, type CpuLineKind } from '../../constants/cpuCharacters';
import type { CpuCutin } from './useCpuCharacterReactions';
import { countOjama } from '../../utils/boardStatus';
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
  stopVoice
} from '../../utils/gameAudio';

interface Params {
  gameState: VsGameState | null;
  character: CpuCharacter;
  lineKind: CpuLineKind;
  lineIndex: number;
  lineTick: number;
  cutin: CpuCutin | null;
  /** どちらかの盤面が上まで積み上がっているか（BGM を速くする） */
  pinch: boolean;
}

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
export const useVsGameSound = ({ gameState, character, lineKind, lineIndex, lineTick, cutin, pinch }: Params) => {
  const isPlaying = !!gameState?.isPlaying;
  const isPaused = !!gameState?.isPaused;
  const isGameOver = !!gameState?.isGameOver;
  const winner = gameState?.winner ?? null;

  useEffect(() => {
    preloadVoices(allVoicesOf(character));
  }, [character]);

  // 始まり・ポーズ・終わり
  const wasPlaying = useRef(false);
  useEffect(() => {
    if (isPlaying && !wasPlaying.current && !isGameOver) {
      playSe('start');
      playBgm(character.bgm);
      if (character.lines.intro.length > 0) playVoice(voiceOf(character, 'intro', lineIndex));
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

  // 台詞を言うたびにボイス（intro は START のときに鳴らす）
  useEffect(() => {
    if (lineTick === 0 || lineKind === 'intro') return;
    const src = voiceOf(character, lineKind, lineIndex);
    if (lineKind === 'win' || lineKind === 'lose') {
      const timer = setTimeout(() => playVoice(src), RESULT_VOICE_DELAY_MS);
      return () => clearTimeout(timer);
    }
    playVoice(src);
  }, [lineTick]);

  useEffect(() => {
    if (cutin) playSe('cutin');
  }, [cutin?.id]);

  // 自分のぷよの操作音
  const playerPair = gameState?.player.currentPair ?? null;
  const prevPair = useRef<PuyoPair | null>(null);
  useEffect(() => {
    if (isPlaying && !isPaused) pairSound(prevPair.current, playerPair);
    prevPair.current = playerPair;
  }, [playerPair?.x, playerPair?.y, playerPair?.rotation, !!playerPair]);

  useBoardSound(gameState?.player, 1);
  useBoardSound(gameState?.cpu, CPU_VOLUME, step => {
    if (character.chain.length > 0) playChainVoice(chainVoiceOf(character, step));
  });
};
