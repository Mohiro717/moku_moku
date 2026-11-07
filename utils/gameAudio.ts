// 対戦の音：BGM・効果音・キャラのボイス。
// 効果音は素材を持たず Web Audio でその場で鳴らす（拍子木・鈴・太鼓・琴の「和の忍」の音色）。
// BGM とボイスは <audio> で流す。
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
/** 盤面が上まで積み上がったときの BGM の速さ */
const BGM_PINCH_RATE = 1.12;
const VOICE_VOLUME = 1;
const SE_VOLUME = 0.5;
const REVERB_SECONDS = 1.8;
const REVERB_LEVEL = 0.5;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let noise: AudioBuffer | null = null;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';

const bgm = typeof Audio !== 'undefined' ? new Audio() : null;
const voice = typeof Audio !== 'undefined' ? new Audio() : null;
/** いま鳴っているボイスが台詞か（連鎖の掛け声は台詞を遮らない） */
let voiceIsLine = false;
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

function makeReverb(c: AudioContext) {
  const len = Math.floor(c.sampleRate * REVERB_SECONDS);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const conv = c.createConvolver();
  conv.buffer = ir;
  return conv;
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
    reverb = makeReverb(ctx);
    const wet = ctx.createGain();
    wet.gain.value = REVERB_LEVEL;
    reverb.connect(wet).connect(master);
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
  bgm.playbackRate = 1;
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
  bgm.playbackRate = 1;
}

/** ピンチのあいだ BGM を少し速くする（音の高さは変えない） */
export function setBgmPinch(on: boolean) {
  if (!bgm) return;
  bgm.preservesPitch = true;
  bgm.playbackRate = on ? BGM_PINCH_RATE : 1;
}

// --- ボイス ---

/** 台詞を言う。前のボイスは止める */
export function playVoice(src: string) {
  if (!voice) return;
  voice.pause();
  voice.src = src;
  voiceIsLine = true;
  duck(true);
  void voice.play().catch(() => duck(false));
}

/** 連鎖の掛け声。台詞を言っている途中なら言わない */
export function playChainVoice(src: string) {
  if (!voice) return;
  if (voiceIsLine && !voice.paused && !voice.ended) return;
  voice.pause();
  voice.src = src;
  voiceIsLine = false;
  duck(true);
  void voice.play().catch(() => duck(false));
}

export function stopVoice() {
  voice?.pause();
}

/** 相手が決まった時点で、ボイスを先に読み込んでおく */
export function preloadVoices(srcs: string[]) {
  srcs.forEach(src => {
    const a = new Audio();
    a.preload = 'auto';
    a.src = src;
  });
}

// --- 効果音の部品 ---

/** pan は左右（-1〜1）、wet は残響の量（0〜1） */
function out(pan = 0, wet = 0): AudioNode | null {
  if (!ctx || !master) return null;
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  p.connect(master);
  if (wet && reverb) {
    const send = ctx.createGain();
    send.gain.value = wet;
    p.connect(send).connect(reverb);
  }
  return p;
}

interface ToneOptions {
  type?: OscillatorType;
  from: number;
  to?: number;
  start?: number;
  length: number;
  gain: number;
  attack?: number;
  dest: AudioNode | null;
}

function tone({ type = 'sine', from, to = from, start = 0, length, gain, attack = 0.008, dest }: ToneOptions) {
  if (!ctx || !dest) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + length);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(env).connect(dest);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

interface HissOptions {
  length: number;
  gain: number;
  from: number;
  to?: number;
  q?: number;
  start?: number;
  filter?: BiquadFilterType;
  attack?: number;
  dest: AudioNode | null;
}

function hiss({ length, gain, from, to = from, q = 1, start = 0, filter = 'bandpass', attack = 0.01, dest }: HissOptions) {
  if (!ctx || !noise || !dest) return;
  const t = ctx.currentTime + start;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + length);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(f).connect(env).connect(dest);
  src.start(t);
  src.stop(t + length + 0.05);
}

/** 琴：弦をはじいた音（Karplus-Strong を一度だけ計算して使い回す） */
const pluckCache = new Map<string, AudioBuffer>();
function pluck(freq: number, start: number, gain: number, dest: AudioNode | null, decay = 0.996) {
  if (!ctx || !dest) return;
  const key = `${Math.round(freq)}:${decay}`;
  let buf = pluckCache.get(key);
  if (!buf) {
    const sr = ctx.sampleRate;
    const n = Math.floor(sr * 1.6);
    buf = ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    const period = Math.round(sr / freq);
    const line = new Float32Array(period);
    for (let i = 0; i < period; i++) line[i] = Math.random() * 2 - 1;
    for (let i = 0; i < n; i++) {
      const j = i % period;
      const v = line[j];
      d[i] = v;
      line[j] = decay * 0.5 * (v + line[(i + 1) % period]);
    }
    pluckCache.set(key, buf);
  }
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  src.buffer = buf;
  g.gain.value = gain;
  src.connect(g).connect(dest);
  src.start(ctx.currentTime + start);
}

/** 鈴：倍音がずれた澄んだ音 */
function bell(freq: number, start: number, gain: number, dest: AudioNode | null, length = 1.2) {
  [[1, 1], [2.76, 0.45], [5.4, 0.25], [8.93, 0.12]].forEach(([ratio, amp]) =>
    tone({ from: freq * ratio, start, length: length / Math.sqrt(ratio), gain: gain * amp, attack: 0.003, dest })
  );
}

/** 拍子木：カン */
function clapper(start: number, gain: number, dest: AudioNode | null) {
  hiss({ length: 0.05, gain, from: 2200, q: 12, start, attack: 0.001, dest });
  tone({ from: 2200, length: 0.05, gain: gain * 0.2, start, attack: 0.001, dest });
}

/** 太鼓：ドン */
function taiko(start: number, gain: number, dest: AudioNode | null, pitch = 100) {
  tone({ from: pitch, to: pitch / 2, length: 0.45, gain, start, attack: 0.003, dest });
  hiss({ length: 0.1, gain: gain * 0.3, from: 700, to: 150, filter: 'lowpass', start, attack: 0.002, dest });
}

const semitone = (base: number, n: number) => base * Math.pow(2, n / 12);
/** 陽旋法（明るい和の音階）。連鎖の段ごとにひとつずつ上がる */
const YO_SCALE = [0, 2, 5, 7, 9, 12, 14, 17, 19, 21, 24];

/**
 * 効果音を鳴らす。
 * pop の step は連鎖の段（1始まり）。段が上がるほど琴が上がり、音も厚くなる。
 * volume は 0〜1（相手側の音を小さくするのに使う）
 */
export function playSe(name: SeName, step = 1, volume = 1) {
  if (!ctx || muted) return;
  const v = volume;
  switch (name) {
    case 'move':
      hiss({ length: 0.025, gain: 0.18 * v, from: 2600, q: 9, attack: 0.002, dest: out(-0.15, 0.05) });
      break;
    case 'rotate':
      bell(2400, 0, 0.08 * v, out(0.2, 0.2), 0.5);
      break;
    case 'land': {
      const d = out(0, 0.12);
      tone({ from: 150, to: 75, length: 0.16, gain: 0.55 * v, attack: 0.003, dest: d });
      hiss({ length: 0.06, gain: 0.15 * v, from: 900, to: 300, filter: 'lowpass', attack: 0.002, dest: d });
      break;
    }
    case 'pop': {
      // 段ごとに高く・大きく。毎回、腹に響く一撃を重ねる
      const loud = Math.min(1, 0.55 + step * 0.08);
      const base = semitone(294, YO_SCALE[Math.min(step, YO_SCALE.length - 1)]);
      const d = out(step % 2 ? -0.25 : 0.25, 0.3);
      hiss({ length: 0.12, gain: Math.min(0.3, 0.1 + step * 0.03) * v, from: 800, to: 7000, q: 2, attack: 0.08, dest: out(0, 0.1) });
      pluck(base, 0, 0.7 * loud * v, d);
      pluck(base * 1.5, 0.03, 0.5 * loud * v, d);
      if (step >= 3) pluck(base * 2, 0.06, 0.45 * loud * v, d);
      if (step >= 5) bell(base * 4, 0.08, 0.12 * v, d);
      const hit = out(0, 0.1);
      tone({ from: 70, to: 32, length: 0.6, gain: Math.min(0.9, 0.35 + step * 0.08) * v, attack: 0.003, dest: hit });
      hiss({ length: 0.12, gain: Math.min(0.5, 0.2 + step * 0.05) * v, from: 3000, to: 200, q: 0.5, attack: 0.003, dest: hit });
      taiko(0.02, Math.min(0.9, 0.3 + step * 0.06) * v, hit, 150);
      break;
    }
    case 'ojama': {
      // ドドドン
      const d = out(0, 0.2);
      [0, 0.16, 0.26].forEach((t, i) => taiko(t, 0.65 * v, d, 110 - i * 8));
      break;
    }
    case 'cutin': {
      // カン、カン、ドン、琴の和音と鈴
      const d = out(0, 0.35);
      clapper(0, 0.5 * v, d);
      clapper(0.14, 0.5 * v, d);
      taiko(0.36, 0.75 * v, d, 90);
      [294, 392, 440, 587].forEach((f, i) => pluck(f, 0.4 + i * 0.035, 0.5 * v, d));
      bell(2349, 0.42, 0.14 * v, d, 1.5);
      break;
    }
    case 'start': {
      const d = out(0, 0.3);
      clapper(0, 0.5 * v, d);
      clapper(0.32, 0.5 * v, d);
      bell(1760, 0.5, 0.15 * v, d, 1.2);
      break;
    }
    case 'win': {
      // 勝ちの決め：太鼓三つ打ちから琴が陽旋法を駆け上がり、最後に和音と鈴
      const d = out(0, 0.35);
      [0, 0.2, 0.4].forEach(t => taiko(t, 0.6 * v, d, 110));
      [294, 330, 392, 440, 587, 659, 784, 880].forEach((f, i) => pluck(f, 0.7 + i * 0.08, 0.5 * v, d));
      [587, 880, 1175].forEach(f => pluck(f, 1.45, 0.45 * v, d, 0.998));
      taiko(1.45, 0.7 * v, d, 90);
      bell(2349, 1.5, 0.16 * v, d, 2);
      break;
    }
    case 'lose': {
      // 負けの決め：都節の音階で琴がゆっくり下り、低い太鼓で終わる
      const d = out(0, 0.35);
      [659, 523, 494, 440, 330].forEach((f, i) => pluck(f, i * 0.32, 0.55 * v, d, 0.998));
      [330, 392, 494].forEach(f => pluck(f / 2, 1.75, 0.4 * v, d, 0.998));
      taiko(1.75, 0.55 * v, d, 70);
      break;
    }
  }
}
