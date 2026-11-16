#!/usr/bin/env python3
"""ぬばたま落とし タイトル・キャラえらびの BGM を、外部の素材を使わずに一から合成する。

オーナー 11-16「専用の曲を作りたい。ボーカル無し。ポップ、ゆったり系で」。
標準ライブラリだけで書いた（numpy なし）。音はすべてこのファイルの中で作る:
エレピ（FM）・琴っぽいはじく音（Karplus-Strong）・グロッケン・マリンバ・パッド・ベース・ドラム、
残響は Freeverb を小さくしたもの。

曲はループ前提。はみ出した音はループの頭へ折り返して足し、残響は「曲の末尾 → 曲の全体」の順に通して
最後の1周ぶんだけ取るので、つなぎ目で音も残響も切れない。

使い方:
    py -3 scripts/compose_menu_bgm.py <出力フォルダ> [曲id ...]
曲id を省くと全曲。出力は <曲id>.wav（32kHz・16bit・ステレオ）。mp3 にするのは別の手順（ffmpeg）。
"""
import array
import math
import os
import random
import sys
import wave

SR = 32000
TAU = 2.0 * math.pi


def mtof(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def zeros(n):
    return array.array('f', bytes(4 * n))


# ---------------------------------------------------------------- 音色

_cache = {}


def cached(fn):
    def wrap(*args):
        key = (fn.__name__,) + args
        if key not in _cache:
            _cache[key] = fn(*args)
        return _cache[key]
    wrap.__name__ = fn.__name__
    return wrap


def _table(harms, size=4096):
    t = [0.0] * size
    for h, a in harms:
        for i in range(size):
            t[i] += a * math.sin(TAU * h * i / size)
    peak = max(abs(x) for x in t)
    return [x / peak for x in t]


PAD_TABLE = _table([(h, 1.0 / h ** 1.7) for h in range(1, 9)])
BASS_TABLE = _table([(1, 1.0), (2, 0.28), (3, 0.08)])


@cached
def ep(midi, dur):
    """エレピ（FM。鍵盤を叩いた明るさがすぐ丸くなる）"""
    f = mtof(midi)
    n = int((dur + 0.9) * SR)
    out = zeros(n)
    w = TAU * f / SR
    dec, rel = math.exp(-1.7 / SR), math.exp(-9.0 / SR)
    idec, tdec = math.exp(-4.5 / SR), math.exp(-16.0 / SR)
    a, idx, tine = 1.0, 0.8, 0.09
    off = int(dur * SR)
    sin = math.sin
    for i in range(n):
        ph = w * i
        s = sin(ph + (idx + 0.1) * sin(ph)) + tine * sin(ph * 7.0)
        out[i] = s * a * (1.0 if i > 96 else i / 96.0)
        a *= dec if i < off else rel
        idx *= idec
        tine *= tdec
    return out


@cached
def pad(midi, dur):
    """やわらかいパッド（2本を少しずらして揺らす）"""
    f = mtof(midi)
    n = int((dur + 1.2) * SR)
    out = zeros(n)
    tb = PAD_TABLE
    size = len(tb)
    inc1, inc2 = f * 1.0025 * size / SR, f * 0.9975 * size / SR
    p1, p2 = 0.0, size * 0.37
    atk, off = int(0.5 * SR), int(dur * SR)
    rel = math.exp(-3.5 / SR)
    e_rel = 1.0
    lp = 0.0
    for i in range(n):
        s = tb[int(p1)] + tb[int(p2)]
        p1 += inc1
        p2 += inc2
        if p1 >= size:
            p1 -= size
        if p2 >= size:
            p2 -= size
        if i < atk:
            e = i / atk
        elif i < off:
            e = 1.0
        else:
            e_rel *= rel
            e = e_rel
        lp += 0.3 * (s - lp)
        out[i] = lp * 0.5 * e
    return out


@cached
def bass(midi, dur):
    f = mtof(midi)
    n = int((dur + 0.12) * SR)
    out = zeros(n)
    tb = BASS_TABLE
    size = len(tb)
    inc = f * size / SR
    p = 0.0
    off = int(dur * SR)
    for i in range(n):
        t = i / SR
        e = min(1.0, i / 90.0) * (0.62 + 0.38 * math.exp(-t * 6.0))
        if i >= off:
            e *= math.exp(-(i - off) / SR * 35.0)
        out[i] = tb[int(p)] * e
        p += inc
        if p >= size:
            p -= size
    return out


@cached
def pluck(midi, dur, t60=2.2, bright=0.55):
    """はじく音（Karplus-Strong）。高めの音域では琴っぽく、短く止めれば刻み"""
    f = mtof(midi)
    n = int((min(dur, t60) + 0.35) * SR)
    y = [0.0] * n
    rng = random.Random(midi * 7919 + int(dur * 1000))
    d = SR / f - 0.5
    k = int(d)
    frac = d - k
    period = k + 1
    ex, lp = [], 0.0
    for _ in range(period):
        lp += bright * ((rng.random() * 2.0 - 1.0) - lp)
        ex.append(lp)
    mean = sum(ex) / period
    peak = max(abs(e - mean) for e in ex) or 1.0
    ex = [(e - mean) / peak for e in ex]
    r_on = 0.001 ** (1.0 / (f * t60))
    r_off = 0.001 ** (1.0 / (f * 0.12))
    off = int(dur * SR)
    prev = 0.0
    for i in range(n):
        x = ex[i] if i < period else 0.0
        a = y[i - k] if i - k >= 0 else 0.0
        b = y[i - k - 1] if i - k - 1 >= 0 else 0.0
        dl = (1.0 - frac) * a + frac * b
        y[i] = x + (r_on if i < off else r_off) * 0.5 * (dl + prev)
        prev = dl
    return array.array('f', y)


@cached
def bell(midi, dur):
    """グロッケン（倍音が整数倍でない、きらっとした金属の音）"""
    f = mtof(midi)
    n = int((min(dur, 1.0) + 1.4) * SR)
    out = zeros(n)
    parts = [(1.0, 1.0, 1.6), (2.76, 0.32, 6.0), (5.40, 0.10, 14.0)]
    for ratio, amp, decay in parts:
        w = TAU * f * ratio / SR
        if f * ratio > SR * 0.45:
            continue
        a, dk = amp, math.exp(-decay / SR)
        for i in range(n):
            out[i] += math.sin(w * i) * a
            a *= dk
    for i in range(min(48, n)):
        out[i] *= i / 48.0
    return out


@cached
def marimba(midi, dur):
    f = mtof(midi)
    n = int(min(dur + 0.4, 1.3) * SR)
    out = zeros(n)
    for ratio, amp, decay in ((1.0, 1.0, 5.5), (3.93, 0.22, 22.0), (9.2, 0.05, 50.0)):
        if f * ratio > SR * 0.45:
            continue
        w = TAU * f * ratio / SR
        a, dk = amp, math.exp(-decay / SR)
        for i in range(n):
            out[i] += math.sin(w * i) * a
            a *= dk
    for i in range(min(40, n)):
        out[i] *= i / 40.0
    return out


@cached
def kick():
    n = int(0.42 * SR)
    out = zeros(n)
    ph = 0.0
    for i in range(n):
        t = i / SR
        ph += TAU * (46.0 + 75.0 * math.exp(-t * 32.0)) / SR
        out[i] = math.sin(ph) * math.exp(-t * 9.0) * min(1.0, i / 24.0)
    return out


def _noise(n, seed):
    rng = random.Random(seed)
    return [rng.random() * 2.0 - 1.0 for _ in range(n)]


@cached
def snap():
    """指パッチン寄りのやわらかいスネア"""
    n = int(0.25 * SR)
    nz = _noise(n, 11)
    out = zeros(n)
    lp, prev = 0.0, 0.0
    for i in range(n):
        t = i / SR
        hp = nz[i] - prev
        prev = nz[i]
        lp += 0.45 * (hp - lp)
        body = math.sin(TAU * 190.0 * t) * math.exp(-t * 30.0) * 0.5
        out[i] = (lp * math.exp(-t * 32.0) + body) * min(1.0, i / 16.0)
    return out


@cached
def hat():
    n = int(0.09 * SR)
    nz = _noise(n, 23)
    out = zeros(n)
    p1 = p2 = 0.0
    for i in range(n):
        h1 = nz[i] - p1
        p1 = nz[i]
        h2 = h1 - p2
        p2 = h1
        out[i] = h2 * math.exp(-i / SR * 65.0)
    return out


@cached
def shaker():
    n = int(0.12 * SR)
    nz = _noise(n, 37)
    out = zeros(n)
    prev = 0.0
    for i in range(n):
        t = i / SR
        h = nz[i] - prev
        prev = nz[i]
        out[i] = h * min(1.0, t / 0.012) * math.exp(-t * 40.0)
    return out


# ---------------------------------------------------------------- 並べる

class Arrangement:
    def __init__(self, bpm, bars, swing=0.0, seed=1):
        self.spb = 60.0 / bpm
        self.bars = bars
        self.L = int(round(bars * 4 * self.spb * SR))
        self.swing = swing
        self.rng = random.Random(seed)
        self.bus = {}

    def at(self, bar, beat):
        if abs((beat % 1.0) - 0.5) < 1e-9:
            beat += self.swing
        return (bar * 4 + beat) * self.spb

    def put(self, name, sig, t, pan=0.0, gain=1.0):
        if name not in self.bus:
            self.bus[name] = (zeros(self.L), zeros(self.L))
        left, right = self.bus[name]
        a = (pan + 1.0) * math.pi / 4.0
        gl, gr = gain * math.cos(a), gain * math.sin(a)
        L = self.L
        i0 = int(round(t * SR)) % L
        n = min(len(sig), L)
        first = min(n, L - i0)
        for k in range(first):
            s = sig[k]
            left[i0 + k] += s * gl
            right[i0 + k] += s * gr
        for k in range(first, n):
            s = sig[k]
            left[k - first] += s * gl
            right[k - first] += s * gr

    def note(self, name, inst, bar, beat, midi, beats, vel=1.0, pan=0.0, delay=0.0, hum=0.004, extra=()):
        dur = round(beats * self.spb, 3)
        sig = inst(midi, dur, *extra)
        t = self.at(bar, beat) + delay + self.rng.uniform(-hum, hum)
        self.put(name, sig, t, pan, vel)

    def hit(self, name, inst, bar, beat, vel=1.0, pan=0.0, hum=0.003):
        t = self.at(bar, beat) + self.rng.uniform(-hum, hum)
        self.put(name, inst(), t, pan, vel)


def segments(chord):
    """1小節のコード。(根音, 和音) か [(拍, 拍数, 根音, 和音), ...]"""
    if isinstance(chord, list):
        return chord
    return [(0, 4, chord[0], chord[1])]


def melody(arr, name, inst, bars, transpose=0, vel=1.0, pan=0.0, start_bar=0, extra=()):
    for b, notes in enumerate(bars):
        for beat, midi, beats in notes:
            v = vel * (1.0 if beat % 1 == 0 else 0.85)
            arr.note(name, inst, start_bar + b, beat, midi + transpose, beats, v, pan, extra=extra)


def chords_comp(arr, name, inst, prog, pattern, bars=None, strum=0.012, vel=1.0, top=None, extra=()):
    for b in (bars if bars is not None else range(len(prog))):
        for s0, slen, _root, voicing in segments(prog[b]):
            notes = voicing[-top:] if top else voicing
            for beat, beats, v in pattern:
                if s0 <= beat < s0 + slen:
                    for j, m in enumerate(notes):
                        pan = -0.35 + 0.7 * j / max(1, len(notes) - 1)
                        arr.note(name, inst, b, beat, m, min(beats, s0 + slen - beat), vel * v, pan, delay=j * strum, extra=extra)


def pads(arr, prog, bars=None, vel=1.0):
    for b in (bars if bars is not None else range(len(prog))):
        for s0, slen, _root, voicing in segments(prog[b]):
            for j, m in enumerate(voicing):
                arr.note('pad', pad, b, s0, m, slen, vel, -0.5 + j / max(1, len(voicing) - 1), hum=0.0)


def bassline(arr, prog, pattern, bars=None, vel=1.0):
    for b in (bars if bars is not None else range(len(prog))):
        for s0, slen, root, _v in segments(prog[b]):
            for beat, beats, interval, v in pattern:
                if s0 <= beat < s0 + slen:
                    arr.note('bass', bass, b, beat, root + interval, min(beats, s0 + slen - beat), vel * v, 0.0)


def drums(arr, bars, kicks, snaps, hats=(), shakers=(), vel=1.0):
    for b in bars:
        for beat, v in kicks:
            arr.hit('kick', kick, b, beat, vel * v)
        for beat, v in snaps:
            arr.hit('snap', snap, b, beat, vel * v, 0.08)
        for beat, v in hats:
            arr.hit('hat', hat, b, beat, vel * v, 0.25)
        for beat, v in shakers:
            arr.hit('shaker', shaker, b, beat, vel * v, -0.3)


EIGHTHS = [(i * 0.5, 1.0 if i % 2 == 0 else 0.6) for i in range(8)]
SIXTEENTHS = [(i * 0.25, (1.0, 0.45, 0.75, 0.45)[i % 4]) for i in range(16)]


# ---------------------------------------------------------------- 曲

def title_a():
    """月夜の縁側：和のポップ。琴っぽいはじく音のメロディ、エレピ、86 BPM、ニ長調。王道進行"""
    arr = Arrangement(86, 16, swing=0.06, seed=101)
    G7M = (43, [55, 59, 62, 66]); A = (45, [57, 61, 64, 69]); Fm7 = (42, [54, 57, 61, 64])
    Bm7 = (47, [57, 59, 62, 66]); Em7 = (40, [55, 59, 62, 64]); D7M = (38, [57, 61, 62, 66])
    Asus_A = [(0, 2, 45, [57, 62, 64, 69]), (2, 2, 45, [57, 61, 64, 69])]
    prog = [G7M, A, Fm7, Bm7, Em7, Fm7, G7M, Asus_A,
            G7M, A, Fm7, Bm7, Em7, A, D7M, D7M]
    mel = [
        [(1, 71, .5), (1.5, 69, .5), (2, 66, 1), (3, 69, 1)],
        [(0, 64, 1.5), (1.5, 66, .5), (2, 69, 2)],
        [(0, 69, .5), (.5, 71, .5), (1, 74, 1), (2, 71, 1), (3, 69, 1)],
        [(0, 66, 3), (3, 64, .5), (3.5, 62, .5)],
        [(0, 64, 1), (1, 66, .5), (1.5, 69, 1.5), (3, 71, 1)],
        [(0, 69, 1.5), (1.5, 66, .5), (2, 64, 2)],
        [(0, 62, .5), (.5, 64, .5), (1, 66, 1), (2, 71, 1), (3, 69, 1)],
        [(0, 69, 2), (3, 64, .5), (3.5, 66, .5)],
        [(0, 74, 1.5), (1.5, 71, .5), (2, 74, 1), (3, 76, 1)],
        [(0, 76, 1.5), (1.5, 74, .5), (2, 71, 2)],
        [(0, 69, .5), (.5, 71, .5), (1, 73, 1), (2, 76, 1), (3, 74, 1)],
        [(0, 74, 2), (2, 71, 1), (3, 69, 1)],
        [(0, 71, 1), (1, 74, 1), (2, 76, 1), (3, 74, 1)],
        [(0, 73, 1.5), (1.5, 71, .5), (2, 69, 2)],
        [(0, 66, 1), (1, 69, 1), (2, 74, 2)],
        [(0, 73, 3)],
    ]
    melody(arr, 'lead', pluck, mel, pan=0.1)
    melody(arr, 'sparkle', bell, mel[8:], transpose=12, start_bar=8, vel=0.8, pan=-0.2)
    chords_comp(arr, 'comp', ep, prog, [(0, 1.5, 0.9), (2.5, 1.25, 0.7)], bars=range(8))
    chords_comp(arr, 'comp', ep, prog, [(0, 1.5, 0.9), (1.5, 0.5, 0.5), (2.5, 1.25, 0.75)], bars=range(8, 16))
    pads(arr, prog, bars=range(8), vel=0.6)
    pads(arr, prog, bars=range(8, 16), vel=1.0)
    bassline(arr, prog, [(0, 2, 0, 1.0), (2.5, 1.5, 7, 0.8)], bars=range(8))
    bassline(arr, prog, [(0, 1.25, 0, 1.0), (1.5, 0.5, 0, 0.7), (2.5, 1.0, 7, 0.85), (3.5, 0.5, 12, 0.6)], bars=range(8, 16))
    drums(arr, range(8), kicks=[(0, 1.0), (2.5, 0.6)], snaps=[(1, 0.6), (3, 0.7)], hats=EIGHTHS, vel=0.85)
    drums(arr, range(8, 16), kicks=[(0, 1.0), (1.5, 0.5), (2.5, 0.7)], snaps=[(1, 0.75), (3, 0.85)], hats=EIGHTHS,
          shakers=[(b, v * 0.7) for b, v in SIXTEENTHS])
    arr.hit('snap', snap, 15, 3.5, 0.5)
    return arr


def title_b():
    """月見だんご：ゆるいローファイ・ポップ。エレピのメロディにグロッケンを重ねる、76 BPM、ヘ長調"""
    arr = Arrangement(76, 16, swing=0.1, seed=202)
    Bb7M = (46, [58, 62, 65, 69]); Am7 = (45, [57, 60, 64, 67]); Gm7 = (43, [55, 58, 62, 65])
    F7M = (41, [57, 60, 64, 65]); C7sus = (48, [58, 60, 65, 67]); Dm7 = (50, [57, 60, 62, 65])
    Gm7_C7 = [(0, 2, 43, [55, 58, 62, 65]), (2, 2, 48, [58, 60, 64, 67])]
    prog = [Bb7M, Am7, Gm7, F7M, Bb7M, Am7, Gm7, C7sus,
            Dm7, Am7, Bb7M, C7sus, Bb7M, Am7, Gm7_C7, F7M]
    mel = [
        [(0, 74, 1), (1, 72, .5), (1.5, 69, 1.5), (3, 72, 1)],
        [(0, 72, .5), (.5, 69, .5), (1, 67, 2)],
        [(0, 65, .5), (.5, 67, .5), (1, 69, 1), (2, 74, 1), (3, 72, 1)],
        [(0, 69, 3)],
        [(0, 74, 1), (1, 77, .5), (1.5, 74, 1.5), (3, 72, 1)],
        [(0, 72, 1), (1, 69, 1), (2, 72, 1), (3, 76, 1)],
        [(0, 74, 1.5), (1.5, 72, .5), (2, 69, 1), (3, 67, 1)],
        [(0, 67, 3), (3, 69, .5), (3.5, 72, .5)],
        [(0, 74, 1.5), (1.5, 77, .5), (2, 76, 1), (3, 74, 1)],
        [(0, 72, 2), (2, 69, 1), (3, 72, 1)],
        [(0, 74, 1), (1, 77, 1), (2, 81, 1), (3, 79, 1)],
        [(0, 79, 2), (2, 77, 1), (3, 74, 1)],
        [(0, 77, 1.5), (1.5, 74, .5), (2, 72, 1), (3, 74, 1)],
        [(0, 72, 1.5), (1.5, 69, .5), (2, 67, 2)],
        [(0, 65, 1), (1, 67, 1), (2, 69, 1), (3, 70, 1)],
        [(0, 69, 3.5)],
    ]
    melody(arr, 'lead', ep, mel, pan=0.05)
    melody(arr, 'sparkle', bell, mel, transpose=12, vel=0.7, pan=0.25)
    chords_comp(arr, 'comp', ep, prog, [(0, 2.5, 0.8), (2.5, 1.5, 0.55)], vel=1.0)
    pads(arr, prog, vel=1.0)
    bassline(arr, prog, [(0, 1.5, 0, 1.0), (2.5, 1.5, 0, 0.75)])
    drums(arr, range(16), kicks=[(0, 1.0), (2.5, 0.75)], snaps=[(1, 0.8), (3, 0.8)], hats=EIGHTHS)
    return arr


def select_c():
    """ころころ：はずむマリンバ。刻むはじく音、96 BPM、ハ長調"""
    arr = Arrangement(96, 16, swing=0.04, seed=303)
    C7M = (48, [55, 59, 60, 64]); Am7 = (45, [55, 57, 60, 64]); Dm7 = (50, [57, 60, 62, 65])
    G = (43, [55, 59, 62, 67]); F7M = (41, [57, 60, 64, 65]); Em7 = (40, [55, 59, 62, 64])
    Cadd9 = (48, [55, 60, 62, 64])
    prog = [C7M, Am7, Dm7, G, C7M, Am7, F7M, G,
            Em7, Am7, Dm7, G, F7M, G, C7M, Cadd9]
    mel = [
        [(0, 72, .5), (.5, 76, .5), (1, 79, 1), (2, 76, .5), (2.5, 74, .5), (3, 72, 1)],
        [(0, 69, 1.5), (1.5, 72, .5), (2, 76, 2)],
        [(0, 74, .5), (.5, 76, .5), (1, 74, .5), (1.5, 72, .5), (2, 69, 1), (3, 72, 1)],
        [(0, 74, 3), (3, 67, .5), (3.5, 69, .5)],
        [(0, 72, .5), (.5, 76, .5), (1, 79, 1), (2, 81, .5), (2.5, 79, .5), (3, 76, 1)],
        [(0, 76, 1.5), (1.5, 74, .5), (2, 72, 2)],
        [(0, 69, .5), (.5, 72, .5), (1, 76, 1), (2, 74, 1), (3, 72, 1)],
        [(0, 74, 2), (3, 79, .5), (3.5, 76, .5)],
        [(0, 79, 1.5), (1.5, 76, .5), (2, 74, 1), (3, 76, 1)],
        [(0, 72, 1.5), (1.5, 69, .5), (2, 72, 1), (3, 76, 1)],
        [(0, 74, .5), (.5, 72, .5), (1, 69, 1), (2, 72, .5), (2.5, 74, .5), (3, 77, 1)],
        [(0, 79, 3), (3, 76, .5), (3.5, 74, .5)],
        [(0, 72, 1), (1, 69, .5), (1.5, 72, .5), (2, 76, 1), (3, 72, 1)],
        [(0, 74, 1), (1, 76, .5), (1.5, 74, .5), (2, 71, 1), (3, 67, 1)],
        [(0, 72, 2), (2, 76, 1), (3, 79, 1)],
        [(0, 76, 3)],
    ]
    melody(arr, 'lead', marimba, mel, pan=0.0)
    chords_comp(arr, 'comp', pluck, prog, [(0.5, 0.25, 0.8), (1.5, 0.25, 0.7), (2.5, 0.25, 0.8), (3.5, 0.25, 0.7)],
                top=3, strum=0.006, extra=(0.4, 0.5))
    pads(arr, prog, vel=0.7)
    bassline(arr, prog, [(0, 0.75, 0, 1.0), (1, 0.5, 12, 0.6), (2, 0.75, 0, 0.9), (3, 0.5, 7, 0.65)])
    drums(arr, range(16), kicks=[(0, 1.0), (2, 0.8)], snaps=[(1, 0.6), (3, 0.6)], shakers=EIGHTHS)
    return arr


def select_d():
    """オルゴールの夜：グロッケンのメロディとマリンバの分散和音。ドラムはごく軽く、84 BPM、ト長調"""
    arr = Arrangement(84, 16, swing=0.05, seed=404)
    G7M = (43, [55, 59, 62, 66]); Bm7 = (47, [57, 59, 62, 66]); C7M = (48, [55, 59, 60, 64])
    D = (38, [54, 57, 62, 66]); Em7 = (40, [55, 59, 62, 64]); D7sus = (38, [55, 57, 60, 62])
    Am7 = (45, [55, 57, 60, 64])
    prog = [G7M, Bm7, C7M, D, Em7, Bm7, C7M, D7sus,
            C7M, D, Bm7, Em7, Am7, D, G7M, G7M]
    mel = [
        [(0, 74, 1.5), (1.5, 76, .5), (2, 74, 1), (3, 71, 1)],
        [(0, 69, 2), (2, 71, 1), (3, 74, 1)],
        [(0, 76, 1), (1, 79, 1), (2, 76, 1), (3, 74, 1)],
        [(0, 74, 2), (2, 69, 2)],
        [(0, 71, 1.5), (1.5, 74, .5), (2, 76, 1), (3, 79, 1)],
        [(0, 78, 2), (2, 76, 1), (3, 74, 1)],
        [(0, 76, 1), (1, 74, 1), (2, 71, 1), (3, 69, 1)],
        [(0, 69, 3), (3, 74, .5), (3.5, 76, .5)],
        [(0, 79, 2), (2, 76, 1), (3, 79, 1)],
        [(0, 81, 2), (2, 78, 1), (3, 76, 1)],
        [(0, 74, 1), (1, 76, 1), (2, 78, 1), (3, 81, 1)],
        [(0, 79, 3), (3, 76, 1)],
        [(0, 76, 1.5), (1.5, 74, .5), (2, 72, 1), (3, 71, 1)],
        [(0, 69, 1), (1, 71, 1), (2, 74, 1), (3, 72, 1)],
        [(0, 71, 4)],
        [],
    ]
    melody(arr, 'lead', bell, mel, pan=0.1)
    # マリンバの分散和音（8分）。1オクターブ上で、和音の下から上へ・上から下へ
    for b in range(16):
        for s0, slen, _root, v in segments(prog[b]):
            seq = v + v[-2:0:-1]
            for i in range(int(slen * 2)):
                arr.note('comp', marimba, b, s0 + i * 0.5, seq[i % len(seq)] + 12, 0.5,
                         0.8 if i % 2 == 0 else 0.6, -0.4 + 0.8 * (i % len(seq)) / len(seq))
    pads(arr, prog, vel=0.9)
    bassline(arr, prog, [(0, 2.5, 0, 1.0), (2.5, 1.5, 7, 0.7)])
    drums(arr, range(16), kicks=[(0, 0.8)], snaps=[(3, 0.45)], shakers=[(b, v * 0.8) for b, v in EIGHTHS])
    return arr


SONGS = {
    'title_a': title_a,
    'title_b': title_b,
    'select_c': select_c,
    'select_d': select_d,
}

# バスの音量（RMS の比）と残響に送る量
LEVELS = {'lead': 1.0, 'sparkle': 0.22, 'comp': 0.5, 'pad': 0.26, 'bass': 0.55,
          'kick': 0.42, 'snap': 0.2, 'hat': 0.1, 'shaker': 0.1}
SENDS = {'lead': 0.3, 'sparkle': 0.6, 'comp': 0.25, 'pad': 0.45, 'bass': 0.0,
         'kick': 0.02, 'snap': 0.35, 'hat': 0.1, 'shaker': 0.15}
WET = 0.32          # 残響の RMS を乾いた音の何倍にするか
TARGET_RMS = 0.088  # 仕上がりの音量（-21 dBFS 前後）。4曲をそろえて聴き比べられるよう、いちばん山の高い曲に合わせた


# ---------------------------------------------------------------- 残響・仕上げ

def _rms(*chans):
    total = sum(sum(x * x for x in c) for c in chans)
    n = sum(len(c) for c in chans)
    return math.sqrt(total / n) if n else 0.0


def _reverb_channel(src, spread):
    n = len(src)
    acc = [0.0] * n
    for c in (1116, 1277, 1422, 1557):
        size = int((c + spread) * SR / 44100)
        buf = [0.0] * size
        idx, filt = 0, 0.0
        fb, damp = 0.83, 0.3
        for i in range(n):
            o = buf[idx]
            filt = o * (1.0 - damp) + filt * damp
            buf[idx] = src[i] + filt * fb
            idx += 1
            if idx == size:
                idx = 0
            acc[i] += o
    for c in (556, 341):
        size = int((c + spread) * SR / 44100)
        buf = [0.0] * size
        idx = 0
        for i in range(n):
            o = buf[idx]
            x = acc[i]
            acc[i] = o - x
            buf[idx] = x + o * 0.5
            idx += 1
            if idx == size:
                idx = 0
    return acc


def render(arr):
    L = arr.L
    out_l, out_r, send = zeros(L), zeros(L), zeros(L)
    for name, (left, right) in arr.bus.items():
        r = _rms(left, right)
        if r == 0:
            continue
        g = LEVELS.get(name, 0.3) / r
        sg = g * SENDS.get(name, 0.2) * 0.5
        for i in range(L):
            a, b = left[i], right[i]
            out_l[i] += a * g
            out_r[i] += b * g
            send[i] += (a + b) * sg
    # 末尾 warm 秒を先に通して、ループの頭にも前の周の残響が乗るようにする
    warm = min(L, int(4.0 * SR))
    src = list(send[L - warm:]) + list(send)
    wet_l = _reverb_channel(src, 0)[warm:]
    wet_r = _reverb_channel(src, 23)[warm:]
    wg = WET * _rms(out_l, out_r) / (_rms(wet_l, wet_r) or 1.0)
    for i in range(L):
        out_l[i] += wet_l[i] * wg
        out_r[i] += wet_r[i] * wg
    raw_peak = max(max(abs(x) for x in out_l), max(abs(x) for x in out_r)) or 1.0
    # 目標の音量にそろえる。ただし山が 1.05 を超えるほどは上げない（tanh で音が歪むので）
    g = min(TARGET_RMS / (_rms(out_l, out_r) or 1.0), 1.05 / raw_peak)
    peak = 0.0
    for i in range(L):
        a, b = out_l[i] * g, out_r[i] * g
        peak = max(peak, abs(a), abs(b))
        out_l[i] = math.tanh(a)
        out_r[i] = math.tanh(b)
    return out_l, out_r, peak


def write_wav(path, left, right):
    data = array.array('h', bytes(4 * len(left)))
    for i in range(len(left)):
        data[2 * i] = int(max(-1.0, min(1.0, left[i])) * 32767)
        data[2 * i + 1] = int(max(-1.0, min(1.0, right[i])) * 32767)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    out_dir = sys.argv[1]
    ids = sys.argv[2:] or list(SONGS)
    os.makedirs(out_dir, exist_ok=True)
    for sid in ids:
        _cache.clear()
        arr = SONGS[sid]()
        left, right, peak = render(arr)
        path = os.path.join(out_dir, sid + '.wav')
        write_wav(path, left, right)
        seam = max(abs(left[0] - left[-1]), abs(right[0] - right[-1]))
        inner = max(abs(left[i] - left[i - 1]) for i in range(1, len(left)))
        print(f'{sid}: {arr.L / SR:.2f}s  rms={_rms(left, right):.3f}  peak={peak:.2f}  '
              f'seam jump={seam:.4f} (largest step inside={inner:.4f})  -> {path}')


if __name__ == '__main__':
    main()
