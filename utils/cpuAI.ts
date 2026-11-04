import type { PuyoCell, PuyoPair, GameDifficulty, ColoredPuyoColor } from '../types/game';
import { GAME_CONFIG } from './puyoGameLogic';
import { chainAttack, MAX_OJAMA_PER_DROP } from './ojamaSystem';

// ========================================
// CPU AI
//
// 盤面を Uint8Array に写して高速にシミュレーションし、
//   1. 置ける手（スポーン列から実際に運べる手だけ）を全列挙
//   2. 置いた後の連鎖を最後まで解決
//   3. 「今撃つ価値」と「残した盤面の価値（あと1〜2個で何連鎖撃てるか＋形）」で採点
// する。Hard は NEXT まで2手読み、Normal は1手読み、Easy は目先の消去だけを見る。
// 盤面ルールは puyoGameLogic と同じ（4個以上で消える・隣接おじゃまも消える・
// 固定時に row 1 に1つでもあれば負け）。
// ========================================

export interface CpuMove {
  x: number;
  rotation: number;
  score: number;
}

export interface CpuAiConfig {
  thinkTime: number;
  immediateDropChance: number;
  /** 撃つと決めている連鎖数。これ未満の発火は（危険時を除き）もったいない扱い */
  targetChain: number;
  /** NEXT まで読むか */
  lookAhead: boolean;
  /** 盤面評価で連鎖ポテンシャルを見るか */
  usePotential: boolean;
}

const AI_CONFIGS: Record<GameDifficulty, CpuAiConfig> = {
  easy: { thinkTime: 500, immediateDropChance: 0, targetChain: 1, lookAhead: false, usePotential: false },
  normal: { thinkTime: 800, immediateDropChance: 0.5, targetChain: 2, lookAhead: false, usePotential: true },
  hard: { thinkTime: 0, immediateDropChance: 1.0, targetChain: 5, lookAhead: true, usePotential: true }
};

export const getCpuAiConfig = (difficulty: GameDifficulty): CpuAiConfig => AI_CONFIGS[difficulty];

// ========================================
// 盤面表現
// ========================================

const W = GAME_CONFIG.gridWidth;
const H = GAME_CONFIG.gridHeight;
const DEATH_ROW = GAME_CONFIG.gameOverLine; // 固定時にこの行に1つでもあれば負け
const SPAWN_X = 2;
const EMPTY = 0;
const OJAMA = 5;
const MAX_HEIGHT = H - DEATH_ROW - 1; // 安全に積める最大の高さ

type Board = Uint8Array;

const COLOR_CODE: Record<string, number> = { red: 1, blue: 2, green: 3, yellow: 4, ojama: OJAMA };

const toBoard = (grid: PuyoCell[][]): Board => {
  const b = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = grid[y][x].color;
      b[y * W + x] = c ? COLOR_CODE[c] : EMPTY;
    }
  }
  return b;
};

const columnHeight = (b: Board, x: number): number => {
  for (let y = 0; y < H; y++) if (b[y * W + x] !== EMPTY) return H - y;
  return 0;
};

/** 列の一番下の空きに置く。置けた行を返す（列が満杯なら -1） */
const dropInto = (b: Board, x: number, color: number): number => {
  for (let y = H - 1; y >= 0; y--) {
    if (b[y * W + x] === EMPTY) {
      b[y * W + x] = color;
      return y;
    }
  }
  return -1;
};

// ========================================
// 連鎖の解決
// ========================================

const stack = new Int16Array(W * H);
const visited = new Uint8Array(W * H);
const toClear = new Uint8Array(W * H);

/** 盤面を破壊的に連鎖させ、連鎖数を返す */
const resolveChains = (b: Board): number => {
  let chains = 0;
  for (;;) {
    visited.fill(0);
    toClear.fill(0);
    let cleared = false;

    for (let i = 0; i < W * H; i++) {
      const color = b[i];
      if (color === EMPTY || color === OJAMA || visited[i]) continue;
      // 同色グループを集める
      let sp = 0, size = 0;
      const start = sp;
      stack[sp++] = i;
      visited[i] = 1;
      const group: number[] = [];
      while (sp > start) {
        const p = stack[--sp];
        group.push(p);
        size++;
        const x = p % W;
        if (x > 0 && !visited[p - 1] && b[p - 1] === color) { visited[p - 1] = 1; stack[sp++] = p - 1; }
        if (x < W - 1 && !visited[p + 1] && b[p + 1] === color) { visited[p + 1] = 1; stack[sp++] = p + 1; }
        if (p >= W && !visited[p - W] && b[p - W] === color) { visited[p - W] = 1; stack[sp++] = p - W; }
        if (p < W * (H - 1) && !visited[p + W] && b[p + W] === color) { visited[p + W] = 1; stack[sp++] = p + W; }
      }
      if (size >= GAME_CONFIG.minChainLength) {
        cleared = true;
        for (const p of group) toClear[p] = 1;
      }
    }
    if (!cleared) return chains;
    chains++;

    // 消えるぷよと、それに隣接するおじゃま
    for (let p = 0; p < W * H; p++) {
      if (toClear[p] !== 1) continue;
      const x = p % W;
      if (x > 0 && b[p - 1] === OJAMA) toClear[p - 1] = 2;
      if (x < W - 1 && b[p + 1] === OJAMA) toClear[p + 1] = 2;
      if (p >= W && b[p - W] === OJAMA) toClear[p - W] = 2;
      if (p < W * (H - 1) && b[p + W] === OJAMA) toClear[p + W] = 2;
    }
    for (let p = 0; p < W * H; p++) if (toClear[p]) b[p] = EMPTY;

    // 重力
    for (let x = 0; x < W; x++) {
      let write = H - 1;
      for (let y = H - 1; y >= 0; y--) {
        const v = b[y * W + x];
        if (v !== EMPTY) {
          b[y * W + x] = EMPTY;
          b[write * W + x] = v;
          write--;
        }
      }
    }
    if (chains > 19) return chains;
  }
};

// ========================================
// 手の列挙と配置
// ========================================

interface Move { x: number; rotation: number; }

const ALL_MOVES: Move[] = [];
for (let x = 0; x < W; x++) {
  ALL_MOVES.push({ x, rotation: 0 }, { x, rotation: 2 });
  if (x < W - 1) ALL_MOVES.push({ x, rotation: 1 });
  if (x > 0) ALL_MOVES.push({ x, rotation: 3 });
}

/** ペアが y=1 で x にいるときに占めるマス（rotation は types/game の定義どおり） */
const pairCells = (x: number, rotation: number): Array<[number, number]> => {
  switch (rotation) {
    case 0: return [[x, 1], [x, 0]];
    case 1: return [[x, 1], [x + 1, 1]];
    case 2: return [[x, 1], [x, 2]];
    default: return [[x, 1], [x - 1, 1]];
  }
};

/** スポーン列で回してから横に運ぶので、通り道が全部空いている手だけを有効にする */
const isReachable = (b: Board, move: Move): boolean => {
  const step = move.x >= SPAWN_X ? 1 : -1;
  for (let x = SPAWN_X; ; x += step) {
    for (const [cx, cy] of pairCells(x, move.rotation)) {
      if (cx < 0 || cx >= W || b[cy * W + cx] !== EMPTY) return false;
    }
    if (x === move.x) return true;
  }
};

/**
 * 手を置いた盤面を返す（連鎖はまだ解決しない）。
 * 運べない手・固定した瞬間に負ける手は null。
 */
const placePair = (b: Board, move: Move, main: number, sub: number): Board | null => {
  if (!isReachable(b, move)) return null;
  const nb = b.slice();
  const { x, rotation } = move;
  let rows: number[];
  if (rotation === 0) rows = [dropInto(nb, x, main), dropInto(nb, x, sub)];
  else if (rotation === 2) rows = [dropInto(nb, x, sub), dropInto(nb, x, main)];
  else rows = [dropInto(nb, x, main), dropInto(nb, rotation === 1 ? x + 1 : x - 1, sub)];
  if (rows.some(r => r <= DEATH_ROW)) return null;
  return nb;
};

const legalMoves = (main: number, sub: number): Move[] =>
  // 同色ペアは向きが違っても同じ形になるので半分だけ見る
  main === sub ? ALL_MOVES.filter(m => m.rotation === 0 || m.rotation === 1) : ALL_MOVES;

// ========================================
// 盤面評価
// ========================================

/** この連鎖で相手に送るおじゃまの目安（実際の送信と同じ式で、毎段4個消しと見なす） */
const attackOf = chainAttack;

/**
 * あと1〜2個（同色）をどこかの列に足したら何連鎖が起きるか。
 * 足す色は着地点の左右・下にある色だけ試す。
 */
const chainPotential = (b: Board, heights: number[]): number => {
  let best = 0;
  for (let x = 0; x < W; x++) {
    const h = heights[x];
    if (h + 2 > MAX_HEIGHT) continue;
    const y = H - 1 - h;
    const tried = new Set<number>();
    const neighbours = [
      x > 0 ? b[y * W + x - 1] : EMPTY,
      x < W - 1 ? b[y * W + x + 1] : EMPTY,
      y < H - 1 ? b[(y + 1) * W + x] : EMPTY,
      x > 0 ? b[(y - 1) * W + x - 1] : EMPTY,
      x < W - 1 ? b[(y - 1) * W + x + 1] : EMPTY
    ];
    for (const color of neighbours) {
      if (color === EMPTY || color === OJAMA || tried.has(color)) continue;
      tried.add(color);
      for (let add = 1; add <= 2; add++) {
        const nb = b.slice();
        for (let k = 0; k < add; k++) dropInto(nb, x, color);
        const chains = resolveChains(nb);
        if (chains > 0) {
          // 2個要る連鎖は少し割り引く
          const value = chains - (add - 1) * 0.3;
          if (value > best) best = value;
          break;
        }
      }
    }
  }
  return best;
};

/** つながり：2個・3個の同色グループ（4個以上は既に消えている） */
const connectivity = (b: Board): number => {
  visited.fill(0);
  let score = 0;
  for (let i = 0; i < W * H; i++) {
    const color = b[i];
    if (color === EMPTY || color === OJAMA || visited[i]) continue;
    let sp = 0, size = 0;
    stack[sp++] = i;
    visited[i] = 1;
    while (sp > 0) {
      const p = stack[--sp];
      size++;
      const x = p % W;
      if (x > 0 && !visited[p - 1] && b[p - 1] === color) { visited[p - 1] = 1; stack[sp++] = p - 1; }
      if (x < W - 1 && !visited[p + 1] && b[p + 1] === color) { visited[p + 1] = 1; stack[sp++] = p + 1; }
      if (p >= W && !visited[p - W] && b[p - W] === color) { visited[p - W] = 1; stack[sp++] = p - W; }
      if (p < W * (H - 1) && !visited[p + W] && b[p + W] === color) { visited[p + W] = 1; stack[sp++] = p + W; }
    }
    if (size === 2) score += 1;
    else if (size >= 3) score += 3;
  }
  return score;
};

/** 置いて連鎖を解決した後の盤面の価値 */
const evaluateBoard = (b: Board, config: CpuAiConfig): number => {
  const heights: number[] = [];
  for (let x = 0; x < W; x++) heights.push(columnHeight(b, x));

  let score = 0;

  // 形：高すぎる列（特にスポーン周り）と段差を嫌う
  for (let x = 0; x < W; x++) {
    const h = heights[x];
    const limit = x === SPAWN_X || x === SPAWN_X + 1 ? 7 : 8;
    if (h > limit) score -= (h - limit) * (h - limit) * 120;
    score -= h * 2;
    if (x < W - 1) {
      const d = Math.abs(h - heights[x + 1]);
      if (d > 2) score -= (d - 2) * 25;
    }
  }

  score += connectivity(b) * 12;

  if (config.usePotential) {
    const potential = chainPotential(b, heights);
    score += attackOf(Math.floor(potential)) * 90 + potential * 40;
  }

  let ojama = 0;
  for (let i = 0; i < W * H; i++) if (b[i] === OJAMA) ojama++;
  score -= ojama * 8;

  return score;
};

/** 自分宛ての予告がこれ以上なら、目標に届かない連鎖でも撃って相殺する（2段分） */
export const INCOMING_DANGER = 12;

const isInDanger = (b: Board): boolean => {
  for (let x = 0; x < W; x++) if (columnHeight(b, x) >= MAX_HEIGHT - 3) return true;
  return false;
};

/** 撃った連鎖の価値。目標未満の発火は危険時以外もったいない */
const fireValue = (chains: number, danger: boolean, config: CpuAiConfig): number => {
  if (chains === 0) return 0;
  if (danger || chains >= config.targetChain) return attackOf(chains) * 400;
  return -150 * (config.targetChain - chains);
};

// ========================================
// 探索
// ========================================

interface Placed { board: Board; chains: number; }

/**
 * 予告ぶんのおじゃまを盤面に降らせる（破壊的）。本物は余りの列がランダムなので、
 * 読みでは低い列から埋まると見なす。死亡ラインとスポーン行には積もらない。
 */
const dropOjamaOnBoard = (b: Board, count: number): void => {
  let left = Math.min(count, MAX_OJAMA_PER_DROP);
  if (left <= 0) return;
  const perColumn = new Array(W).fill(Math.floor(left / W));
  const byHeight = Array.from({ length: W }, (_, x) => x)
    .sort((p, q) => columnHeight(b, p) - columnHeight(b, q));
  for (let i = 0; i < left % W; i++) perColumn[byHeight[i]]++;
  for (let x = 0; x < W; x++) {
    for (let y = H - 1, n = perColumn[x]; y > DEATH_ROW && n > 0; y--) {
      if (b[y * W + x] !== EMPTY) continue;
      b[y * W + x] = OJAMA;
      n--;
    }
  }
};

/** 連鎖で相殺したあと、まだ自分に降る量 */
const afterOffset = (incoming: number, chains: number): number =>
  Math.max(0, incoming - Math.floor(attackOf(chains)));

const placeAndResolve = (b: Board, move: Move, main: number, sub: number): Placed | null => {
  const board = placePair(b, move, main, sub);
  if (!board) return null;
  const chains = resolveChains(board);
  return { board, chains };
};

const searchHardOrNormal = (
  b: Board,
  cur: [number, number],
  next: [number, number] | null,
  config: CpuAiConfig,
  incoming: number
): CpuMove | null => {
  // 盤面が高いか、大きめの予告が来ているなら、目標未満でも撃つ（相殺・早撃ち）
  const danger = isInDanger(b) || incoming >= INCOMING_DANGER;
  let best: CpuMove | null = null;

  for (const move of legalMoves(cur[0], cur[1])) {
    const first = placeAndResolve(b, move, cur[0], cur[1]);
    if (!first) continue;
    let score = fireValue(first.chains, danger, config);

    // 本物と同じく、連鎖しなかった着地の後に予告が降る。降った盤面で先を読む
    const left = afterOffset(incoming, first.chains);
    if (first.chains === 0) dropOjamaOnBoard(first.board, left);
    const leftAfterFirst = first.chains === 0 ? Math.max(0, left - MAX_OJAMA_PER_DROP) : left;

    if (config.lookAhead && next) {
      const danger2 = danger || isInDanger(first.board) || leftAfterFirst >= INCOMING_DANGER;
      let bestSecond = -Infinity;
      for (const move2 of legalMoves(next[0], next[1])) {
        const second = placeAndResolve(first.board, move2, next[0], next[1]);
        if (!second) continue;
        if (second.chains === 0) dropOjamaOnBoard(second.board, leftAfterFirst);
        // 1手先の発火は少しだけ割り引く（今撃てるなら今撃つ）
        const v = fireValue(second.chains, danger2, config) * 0.9 + evaluateBoard(second.board, config);
        if (v > bestSecond) bestSecond = v;
      }
      // 次に置ける場所が無い＝ほぼ負け
      score += bestSecond === -Infinity ? -100000 : bestSecond;
    } else {
      score += evaluateBoard(first.board, config);
    }

    if (!best || score > best.score) best = { x: move.x, rotation: move.rotation, score };
  }
  return best;
};

/** Easy：目先の消去・同色の隣接・高さだけを見る */
const searchEasy = (b: Board, cur: [number, number]): CpuMove | null => {
  let best: CpuMove | null = null;
  for (const move of legalMoves(cur[0], cur[1])) {
    const board = placePair(b, move, cur[0], cur[1]);
    if (!board) continue;
    const before = board.slice();
    const chains = resolveChains(board);
    let cleared = 0;
    for (let i = 0; i < W * H; i++) if (before[i] !== EMPTY && board[i] === EMPTY) cleared++;
    let maxH = 0;
    for (let x = 0; x < W; x++) maxH = Math.max(maxH, columnHeight(board, x));
    const score = (chains > 0 ? cleared * 100 : 0) + connectivity(before) * 10 - maxH * 5;
    if (!best || score > best.score) best = { x: move.x, rotation: move.rotation, score };
  }
  return best;
};

// ========================================
// メイン関数
// ========================================

const code = (c: ColoredPuyoColor): number => COLOR_CODE[c];

export const findBestMove = (
  grid: PuyoCell[][],
  pair: PuyoPair,
  difficulty: GameDifficulty,
  nextPair?: PuyoPair | null,
  /** 自分に降る予定のおじゃま数（予告） */
  incoming: number = 0
): CpuMove | null => {
  const board = toBoard(grid);
  const cur: [number, number] = [code(pair.main), code(pair.sub)];
  const next: [number, number] | null = nextPair ? [code(nextPair.main), code(nextPair.sub)] : null;

  const move = difficulty === 'easy'
    ? searchEasy(board, cur)
    : searchHardOrNormal(board, cur, next, AI_CONFIGS[difficulty], incoming);

  // どこに置いても負けるときはスポーン位置のまま落とす
  return move ?? { x: SPAWN_X, rotation: 0, score: -Infinity };
};
