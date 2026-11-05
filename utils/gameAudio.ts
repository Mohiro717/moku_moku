// 対戦の音：BGM・効果音・キャラのボイス。
// 効果音は素材を持たず Web Audio でその場で鳴らす。BGM とボイスは <audio> で流す。
// ブラウザは操作なしの再生を止めるので、START を押したときに unlockAudio() を呼ぶ。

export type SeName =
  | 'move'
  | 'rotate'
  | 'land'
  | 'pop'
  | 'ojama'
  | 'cutin'
  | 'start'
  | 'win'
  | 'lose';

const MUTE_KEY = 'mokumoku-sound-muted';
const BGM_VOLUME = 0.32;
/** ボイスが鳴っている間は BGM を下げる */
const BGM_DUCKED = 0.12;
const VOICE_VOLUME = 1;
const SE_VOLUME = 0.45;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';

const bgm = typeof Audio !== 'undefined' ? new Audio() : null;
const voice = typeof Audio !== 'undefined' ? new Audio() : null;
if (bgm) {
  bgm.loop = true;
  bgm.preload = 'auto';
  bgm.volume = BGM_VOLUME;
}
if (voice) {
  voice.volume = VOICE_VOLUME;
  voice.addEventListener('ended', () => duck(false));
  voice.addEventListener('pause', () => duck(false));
}

function duck(on: boolean) {
  if (bgm) bgm.volume = on ? BGM_DUCKED : BGM_VOLUME;
}

export const isMuted = () => muted;

export function setMuted(value: boolean) {
  muted = value;
  localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  if (bgm) bgm.muted = value;
  if (voice) voice.muted = value;
  if (master) master.gain.value = value ? 0 : SE_VOLUME;
}

/** ユーザー操作の中で呼ぶ。これ以降は効果音・BGM・ボイスが鳴る */
export function unlockAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : SE_VOLUME;
    master.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
  if (bgm) bgm.muted = muted;
  if (voice) voice.muted = muted;
}

// --- BGM ---

export function playBgm(src: string) {
  if (!bgm) return;
  if (!bgm.src.endsWith(src)) bgm.src = src;
  bgm.currentTime = 0;
  duck(false);
  void bgm.play().catch(() => {});
}

export function pauseBgm() {
  bgm?.pause();
}

export function resumeBgm() {
  if (bgm?.src) void bgm.play().catch(() => {});
}

export function stopBgm() {
  if (!bgm) return;
  bgm.pause();
  bgm.currentTime = 0;
}

// --- ボイス ---

export function playVoice(src: string) {
  if (!voice) return;
  voice.pause();
  voice.src = src;
  duck(true);
  void voice.play().catch(() => duck(false));
}

export function stopVoice() {
  voice?.pause();
}

/** 相手が決まった時点で、台詞を先に読み込んでおく */
export function preloadVoices(srcs: string[]) {
  srcs.forEach(src => {
    const a = new Audio();
    a.preload = 'auto';
    a.src = src;
  });
}

// --- 効果音 ---

interface ToneOptions {
  type: OscillatorType;
  from: number;
  to?: number;
  start?: number;
  length: number;
  gain: number;
}

function tone({ type, from, to = from, start = 0, length, gain }: ToneOptions) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + length);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(env).connect(master);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

function hiss(length: number, gain: number, fromHz: number, toHz: number, start = 0) {
  if (!ctx || !master || !noise) return;
  const t = ctx.currentTime + start;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(fromHz, t);
  filter.frequency.exponentialRampToValueAtTime(toHz, t + length);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(filter).connect(env).connect(master);
  src.start(t);
  src.stop(t + length + 0.02);
}

const semitone = (base: number, n: number) => base * Math.pow(2, n / 12);

/**
 * 効果音を鳴らす。
 * pop の step は連鎖の段（1始まり）。段が上がるほど音が高くなる。
 * volume は 0〜1（相手側の音を小さくするのに使う）
 */
export function playSe(name: SeName, step = 1, volume = 1) {
  if (!ctx || muted) return;
  const v = volume;
  switch (name) {
    case 'move':
      tone({ type: 'square', from: 900, length: 0.03, gain: 0.08 * v });
      break;
    case 'rotate':
      tone({ type: 'triangle', from: 620, to: 980, length: 0.06, gain: 0.22 * v });
      break;
    case 'land':
      tone({ type: 'sine', from: 210, to: 90, length: 0.12, gain: 0.5 * v });
      break;
    case 'pop': {
      // ぷよっ、と弾む音。段ごとに全音ずつ上がる
      const base = semitone(523, Math.min(step - 1, 10) * 2);
      tone({ type: 'sine', from: base * 0.7, to: base * 1.5, length: 0.14, gain: 0.55 * v });
      tone({ type: 'triangle', from: base * 2, length: 0.22, start: 0.05, gain: 0.18 * v });
      break;
    }
    case 'ojama':
      hiss(0.35, 0.6 * v, 900, 120);
      tone({ type: 'sine', from: 120, to: 50, length: 0.3, gain: 0.5 * v });
      break;
    case 'cutin':
      hiss(0.5, 0.45 * v, 400, 5000);
      tone({ type: 'triangle', from: 1568, length: 0.5, start: 0.32, gain: 0.25 * v });
      tone({ type: 'triangle', from: 2093, length: 0.6, start: 0.4, gain: 0.2 * v });
      break;
    case 'start':
      tone({ type: 'triangle', from: 784, length: 0.12, gain: 0.3 * v });
      tone({ type: 'triangle', from: 1175, length: 0.25, start: 0.12, gain: 0.3 * v });
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) =>
        tone({ type: 'triangle', from: f, length: i === 3 ? 0.6 : 0.16, start: i * 0.13, gain: 0.32 * v })
      );
      break;
    case 'lose':
      [494, 440, 392, 330].forEach((f, i) =>
        tone({ type: 'sine', from: f, to: f * 0.97, length: i === 3 ? 0.7 : 0.22, start: i * 0.22, gain: 0.32 * v })
      );
      break;
  }
}
