import type { GameTimings } from '../types/game';

export const GAME_TIMINGS: GameTimings = {
  highlight: 600,  // ハイライト表示時間を長めに
  deletion: 400,   // 削除アニメーション時間を長めに
  falling: 300,    // 落下アニメーション時間を長めに
  complete: 300,   // 連鎖で落ちたぷよが落ち切る（drop）まで待ってから次の判定へ
  drop: 260,       // 落下アニメーションの上限
  landing: 360,    // 置いてから連鎖判定まで。drop＋つぶれの前半
  puyoFallInterval: 800  // ぷよの自然落下間隔（ミリ秒）
};