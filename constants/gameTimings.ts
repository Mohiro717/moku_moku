import type { GameTimings } from '../types/game';

export const GAME_TIMINGS: GameTimings = {
  highlight: 600,  // ハイライト表示時間を長めに
  deletion: 400,   // 削除アニメーション時間を長めに
  falling: 300,    // 落下アニメーション時間を長めに
  complete: 200,   // 完了待機時間を少し長めに
  puyoFallInterval: 800  // ぷよの自然落下間隔（ミリ秒）
};