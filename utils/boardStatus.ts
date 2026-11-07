import type { PuyoCell } from '../types/game';

/** この行より上（行番号が小さい側）に1つでもあればピンチ。13行のうち上から5行目＝見える12段のうち9段目 */
const PINCH_ROW = 4;

export const countOjama = (grid: PuyoCell[][]) =>
  grid.reduce((n, row) => n + row.filter(cell => cell.color === 'ojama').length, 0);

export const isPinch = (grid: PuyoCell[][]) =>
  grid.some((row, y) => y <= PINCH_ROW && row.some(cell => cell.color !== null));

/** いちばん高く積もったぷよの行番号（小さいほど高い）。何も無ければ盤面の行数 */
export const topRow = (grid: PuyoCell[][]) => {
  const y = grid.findIndex(row => row.some(cell => cell.color !== null));
  return y === -1 ? grid.length : y;
};
