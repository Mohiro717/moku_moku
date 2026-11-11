// 対戦の音：BGM・効果音・キャラのボイス。
// 効果音は素材を持たず Web Audio でその場で鳴らす（拍子木・鈴・太鼓・琴の「和の忍」の音色）。
// BGM は <audio> で流す。ボイスは mp3 を読み込んで Web Audio で鳴らす
// （<audio> 1本を差し替えて鳴らす作りは、Android のブラウザで声が出ないことがあった。2026-11-09）。
// ブラウザは操作なしの再生を止めるので、START を押したときに unlockAudio() を呼ぶ。

import { GAME_TIMINGS } from '../constants/gameTimings';
import { GAME_CONFIG } from './puyoGameLogic';
import { MAX_OJAMA_PER_DROP } from './ojamaSystem';

export type SeName =
  | 'move'
  | 'rotate'
  | 'land'
  | 'charge'
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

/** ボイスの出口（効果音とは別の音量・残響なし） */
let voiceOut: GainNode | null = null;

const bgm = typeof Audio !== 'undefined' ? new Audio() : null;
if (bgm) {
  bgm.loop = true;
  bgm.preload = 'auto';
  bgm.volume = BGM_VOLUME;
}

function duck(on: boolean) {
  if (bgm) bgm.volume = on ? BGM_DUCKED : BGM_VOLUME;
}

export const isMuted = () => muted;

export function setMuted(value: boolean) {
  muted = value;
  localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  if (bgm) bgm.muted = value;
  if (voiceOut) voiceOut.gain.value = value ? 0 : VOICE_VOLUME;
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
    voiceOut = ctx.createGain();
    voiceOut.gain.value = muted ? 0 : VOICE_VOLUME;
    voiceOut.connect(ctx.destination);
    // iPhone：Web Audio はマナーモードで消える。ボイスを <audio> で流していたときと同じく鳴らす
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
  }
  if (ctx.state !== 'running') void ctx.resume().catch(() => {});
  if (bgm) bgm.muted = muted;
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

/**
 * 台詞の言い方。声の出口は1つなので、自分の側と相手の側の台詞が重なったときの順番を決める。
 * - now: 前のボイスを止めて、すぐ言う（技を出した側・勝った側）
 * - after: いま言っている台詞が終わってから言う（受けた側・負けた側）。待ちは1本だけで、古くなったら言わない
 * - ifIdle: 何も言っていないときだけ言う（おじゃまを食らった短い声）
 */
export type VoiceTiming = 'now' | 'after' | 'ifIdle';

/** 待っている台詞が、これより古くなったら言わない（前の台詞は長いもので6秒ほど） */
const VOICE_QUEUE_STALE_MS = 9000;
/** after の台詞は、同じ瞬間に now の台詞が来るのを少しだけ待ってから言う */
const VOICE_AFTER_GRACE_MS = 80;

/** いま鳴っている掛け声がどちらの側か（自分の側の掛け声を優先する） */
let chainSide: 'player' | 'cpu' | null = null;
let queued: { src: string; at: number } | null = null;
let graceTimer: ReturnType<typeof setTimeout> | null = null;

/** いま言っているボイス。読み込み中も言っている扱い（isLine：台詞か。連鎖の掛け声は台詞を遮らない） */
interface VoicePlay {
  isLine: boolean;
  source: AudioBufferSourceNode | null;
}
let current: VoicePlay | null = null;

const voiceBusy = () => current !== null;
const lineBusy = () => !!current?.isLine;

/** mp3 の中身（先読み）と、Web Audio で鳴らせる形にしたもの */
const voiceData = new Map<string, Promise<ArrayBuffer | null>>();
const voiceBuffers = new Map<string, Promise<AudioBuffer | null>>();

function fetchVoice(src: string) {
  let data = voiceData.get(src);
  if (!data) {
    data = fetch(src)
      .then(res => (res.ok ? res.arrayBuffer() : null))
      .catch(() => null);
    voiceData.set(src, data);
  }
  return data;
}

function voiceBuffer(c: AudioContext, src: string) {
  let buffer = voiceBuffers.get(src);
  if (!buffer) {
    buffer = fetchVoice(src).then(
      data =>
        data
          ? new Promise<AudioBuffer | null>(resolve => {
              // 古い Safari は戻り値の Promise が無いので、コールバックで受ける
              c.decodeAudioData(data, resolve, () => resolve(null))?.catch(() => resolve(null));
            })
          : null
    );
    voiceBuffers.set(src, buffer);
    // 中身は鳴らせる形にしたら要らない（読めなかったときは、次にまた取りに行く）
    buffer.then(b => {
      voiceData.delete(src);
      if (!b) voiceBuffers.delete(src);
    });
  }
  return buffer;
}

/** いまのボイスを止める（終わったことにはしない＝待っている台詞へ進まない） */
function haltVoice() {
  const prev = current;
  current = null;
  duck(false);
  if (prev?.source) {
    prev.source.onended = null;
    try {
      prev.source.stop();
    } catch {
      // まだ鳴り始めていない
    }
  }
}

/** 言い終わったら、または読み込めなかったら、待っている台詞へ */
function voiceEnded(play: VoicePlay) {
  if (current !== play) return;
  current = null;
  duck(false);
  chainSide = null;
  playQueued();
}

function startVoice(src: string, isLine: boolean) {
  if (!ctx || !voiceOut) return;
  haltVoice();
  const play: VoicePlay = { isLine, source: null };
  current = play;
  duck(true);
  if (ctx.state !== 'running') void ctx.resume().catch(() => {});
  void voiceBuffer(ctx, src).then(buffer => {
    if (current !== play) return;
    if (!buffer || !ctx || !voiceOut) {
      voiceEnded(play);
      return;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(voiceOut);
    source.onended = () => voiceEnded(play);
    play.source = source;
    source.start();
  });
}

/** 待っている台詞があれば言う */
function playQueued() {
  if (!queued) return;
  const next = queued;
  queued = null;
  if (Date.now() - next.at < VOICE_QUEUE_STALE_MS) startVoice(next.src, true);
}

/** 台詞を言う */
export function playVoice(src: string, timing: VoiceTiming = 'now') {
  if (timing === 'ifIdle') {
    if (!voiceBusy() && !queued) startVoice(src, true);
    return;
  }
  if (timing === 'after') {
    queued = { src, at: Date.now() };
    // 掛け声は台詞より軽いので、台詞を待たせない。台詞を言っている途中なら、終わってから
    if (lineBusy()) return;
    if (graceTimer) clearTimeout(graceTimer);
    graceTimer = setTimeout(() => {
      graceTimer = null;
      if (!lineBusy()) playQueued();
    }, VOICE_AFTER_GRACE_MS);
    return;
  }
  chainSide = null;
  startVoice(src, true);
}

/** 連鎖の掛け声。台詞を言っている途中なら言わない。自分の側の掛け声は相手の掛け声で遮らない */
export function playChainVoice(src: string, side: 'player' | 'cpu' = 'cpu') {
  if (lineBusy()) return;
  if (side === 'cpu' && chainSide === 'player' && voiceBusy()) return;
  chainSide = side;
  startVoice(src, false);
}

export function stopVoice() {
  queued = null;
  if (graceTimer) clearTimeout(graceTimer);
  graceTimer = null;
  chainSide = null;
  haltVoice();
}

/** 相手が決まった時点で、ボイスを先に読み込んでおく（鳴らせる形にするのは、言うとき） */
export function preloadVoices(srcs: string[]) {
  srcs.forEach(fetchVoice);
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

/** ぬばたまが1つ着地した音：ぼとっ（柔らかくて重い） */
function plop(start: number, gain: number, dest: AudioNode | null, pitch: number) {
  tone({ from: pitch, to: pitch * 0.45, length: 0.12, gain, start, attack: 0.002, dest });
  hiss({ length: 0.05, gain: gain * 0.35, from: 1200, to: 250, filter: 'lowpass', start, attack: 0.001, dest });
}

/** おじゃまが上から落ちて着地するまでの秒数（GameGrid の落下アニメーションの上限。降るおじゃまはほぼこの長さで落ちる） */
const OJAMA_LAND = GAME_TIMINGS.drop / 1000;

const semitone = (base: number, n: number) => base * Math.pow(2, n / 12);
/** 陽旋法（明るい和の音階）。連鎖の段ごとにひとつずつ上がる */
const YO_SCALE = [0, 2, 5, 7, 9, 12, 14, 17, 19, 21, 24];

/**
 * 効果音を鳴らす。
 * pop の step は連鎖の段（1始まり）。段が上がるほど鈴が上がり、音も厚くなる。
 * ojama の step は降った個数。多いほど重く、長くなる。
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
      // 鈴の和音がパッと開き、高い鈴の粒が左右に散る。段ごとに高く、和音と粒が増える。
      // 5段目からは上にもう一段和音を重ねる。毎回、腹に響く一撃を重ねる
      const base = semitone(294, YO_SCALE[Math.min(step, YO_SCALE.length - 1)]) * 2;
      const d = out(step % 2 ? -0.3 : 0.3, 0.45);
      hiss({ length: 0.18, gain: Math.min(0.32, 0.12 + step * 0.04) * v, from: 3000, to: 12000, q: 0.8, filter: 'highpass', attack: 0.004, dest: out(0, 0.25) });
      [1, 1.25, 1.5, 2].slice(0, Math.min(4, 1 + step)).forEach((r, i) => bell(base * r, i * 0.025, 0.2 * v, d, 1.1));
      if (step >= 5) [3, 4].forEach((r, i) => bell(base * r, 0.12 + i * 0.03, 0.12 * v, d, 1.4));
      const grains = 3 + step * 3;
      for (let i = 0; i < grains; i++) {
        const f = base * (3 + Math.random() * 5);
        bell(f, 0.04 + Math.random() * (0.18 + step * 0.04), 0.05 * v, out(Math.random() * 1.6 - 0.8, 0.5), 0.35);
      }
      const hit = out(0, 0.1);
      const w = 0.85 * v;
      tone({ from: 70, to: 32, length: 0.6, gain: Math.min(0.9, 0.35 + step * 0.08) * w, attack: 0.003, dest: hit });
      hiss({ length: 0.12, gain: Math.min(0.5, 0.2 + step * 0.05) * w, from: 3000, to: 200, q: 0.5, attack: 0.003, dest: hit });
      taiko(0.02, Math.min(0.9, 0.3 + step * 0.06) * w, hit, 150);
      // 3段目から：琴が陽旋法をシャラランと駆け上がる。段が上がるほど音が増えて高く
      if (step >= 3) {
        const run = Math.min(8, step + 2);
        for (let i = 0; i < run; i++) {
          pluck(semitone(294, YO_SCALE[Math.min(YO_SCALE.length - 1, i + step - 3)]) * 2, 0.06 + i * 0.035, 0.32 * v, out(-0.6 + (1.2 * i) / run, 0.4));
        }
      }
      break;
    }
    case 'charge': {
      // ため：はじける直前まで、風の音と鈴のトレモロがせり上がる（連鎖の消える前の点滅のあいだ）
      const d = out(0, 0.3);
      const top = semitone(294, YO_SCALE[Math.min(step, YO_SCALE.length - 1)]) * 4;
      hiss({ length: 0.55, gain: 0.16 * v, from: 600, to: 6000, q: 2, attack: 0.45, dest: d });
      for (let i = 0; i < 8; i++) bell(top * Math.pow(1.04, i), i * 0.06, (0.02 + i * 0.008) * v, d, 0.25);
      break;
    }
    case 'ojama': {
      // おじゃまが降ってきた。step は降った個数（1〜30）。音は着地の瞬間に合わせる。
      // 数個：ぼと、ぼとっと粒だけ。横一列（6個）から：落ちてくる風と、1段ごとに太鼓（ドン〜ドドドドド）。
      // 3段（18個）から：地鳴り。5段（30個・上限）：ずしんと腹に来る一撃
      const n = Math.max(1, step);
      const weight = Math.min(1, n / MAX_OJAMA_PER_DROP);
      const rows = Math.ceil(n / GAME_CONFIG.gridWidth);
      const land = OJAMA_LAND;
      if (n >= 6) {
        hiss({ length: land + 0.04, gain: (0.05 + 0.15 * weight) * v, from: 2500, to: 400, q: 0.7, attack: land, dest: out(0, 0.15) });
      }
      const grains = Math.min(n, 10);
      const spread = 0.02 + grains * 0.012;
      for (let i = 0; i < grains; i++) {
        plop(land + (i === 0 ? 0 : Math.random() * spread), (0.32 - 0.12 * weight) * v, out(Math.random() * 1.4 - 0.7, 0.1), 150 + Math.random() * 90);
      }
      if (n >= 6) {
        const d = out(0, 0.2);
        for (let i = 0; i < rows; i++) taiko(land + i * 0.06, (0.4 + 0.35 * weight) * v, d, 105 - i * 9);
      }
      const low = out(0, 0.05);
      tone({ from: 75, to: 30, length: 0.3 + 0.6 * weight, gain: (0.15 + 0.6 * weight) * v, start: land, attack: 0.004, dest: low });
      if (n >= 18) {
        hiss({ length: 0.5 + 0.9 * weight, gain: (0.1 + 0.3 * weight) * v, from: 260, to: 50, filter: 'lowpass', start: land, attack: 0.02, dest: out(0, 0.3) });
      }
      if (n >= MAX_OJAMA_PER_DROP) {
        taiko(land + 0.03, 0.5 * v, out(0, 0.35), 62);
        tone({ from: 48, to: 24, length: 1.2, gain: 0.3 * v, start: land + 0.03, attack: 0.004, dest: low });
      }
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
