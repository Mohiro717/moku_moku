import { useEffect, useRef } from 'react';
import type { GameState, PuyoCell, PuyoPair, VsGameState } from '../../types/game';
import { LINE_KINDS, voiceOf, type CpuCharacter, type CpuLineKind } from '../../constants/cpuCharacters';
import type { CpuCutin } from './useCpuCharacterReactions';
import {
  pauseBgm,
  playBgm,
  playSe,
  playVoice,
  preloadVoices,
  resumeBgm,
  stopBgm,
  stopVoice
} from '../../utils/gameAudio';

interface Params {
  gameState: VsGameState | null;
  character: CpuCharacter;
  lineKind: CpuLineKind;
  lineTick: number;
  cutin: CpuCutin | null;
}

/** 相手側の音は小さめに */
const CPU_VOLUME = 0.45;
/** 勝ち負けの音を聞かせてから台詞を言う */
const RESULT_VOICE_DELAY_MS = 900;

const countOjama = (grid: PuyoCell[][]) =>
  grid.reduce((n, row) => n + row.filter(cell => cell.color === 'ojama').length, 0);

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

/** 連鎖の各段で消える瞬間と、おじゃまが降ってきた瞬間を鳴らす */
const useBoardSound = (side: GameState | undefined, volume: number) => {
  const prevStep = useRef(side?.chainAnimationStep);
  const prevOjama = useRef(0);
  const step = side?.chainAnimationStep;
  const ojama = side ? countOjama(side.grid) : 0;

  useEffect(() => {
    if (side && step === 'deleting' && prevStep.current !== 'deleting') {
      playSe('pop', side.currentChainStep + 1, volume);
    }
    prevStep.current = step;
  }, [step]);

  useEffect(() => {
    if (ojama > prevOjama.current) playSe('ojama', 1, volume);
    prevOjama.current = ojama;
  }, [ojama]);
};

/** 対戦の BGM・効果音・ボイス */
export const useVsGameSound = ({ gameState, character, lineKind, lineTick, cutin }: Params) => {
  const isPlaying = !!gameState?.isPlaying;
  const isPaused = !!gameState?.isPaused;
  const isGameOver = !!gameState?.isGameOver;
  const winner = gameState?.winner ?? null;

  useEffect(() => {
    preloadVoices(LINE_KINDS.map(kind => voiceOf(character, kind)));
  }, [character]);

  // 始まり・ポーズ・終わり
  const wasPlaying = useRef(false);
  useEffect(() => {
    if (isPlaying && !wasPlaying.current && !isGameOver) {
      playSe('start');
      playBgm(character.bgm);
      playVoice(voiceOf(character, 'intro'));
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
    const src = voiceOf(character, lineKind);
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
  useBoardSound(gameState?.cpu, CPU_VOLUME);
};
