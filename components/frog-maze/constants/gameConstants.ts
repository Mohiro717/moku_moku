// Game text constants
export const GAME_TEXT = {
  TITLE: '🐸 カエルのお姫様の迷宮',
  STATUS: {
    ORB_COUNT: 'まほうのオーブ',
    PC_CONTROLS: 'やじるしきーまたはWASDでいどう',
    MOBILE_CONTROLS: 'マップをタップしていどう',
    GAME_OVER: 'げーむおーばー！ もどるぼたんでさいちょうせん',
  },
  LEGEND: {
    PLAYER: '🐸 プレイヤー',
    ORB: '💎 まほうのオーブ',
    TRAP: '🕸️ わな',
    MONSTER: '👻 モンスター',
  },
  GOAL: 'みっつのオーブをあつめておしろ🏰をめざそう！',
  LOADING: 'よみこみちゅう...',
} as const;

// Style constants
export const MAZE_STYLES = {
  CONTAINER: {
    SPACING: 'space-y-3 sm:space-y-6',
    WIDTH: 'w-full',
  },
  STATUS_CARD: {
    BASE: 'bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg sm:rounded-xl p-2 sm:p-4 border-2 border-pink-200 shadow-lg w-full max-w-md',
    TEXT: {
      TITLE: 'text-sm sm:text-lg font-bold text-purple-600 mb-1 sm:mb-2',
      CONTROLS: 'text-xs sm:text-sm text-gray-600',
      GAME_OVER: 'text-red-600 font-bold mt-1 sm:mt-2 text-xs sm:text-sm',
    },
  },
  GRID: {
    BASE: 'grid gap-0 border-2 sm:border-4 bg-gradient-to-br from-pink-100 via-blue-50 to-purple-100 rounded-lg p-1 sm:p-2 transition-colors duration-300 shadow-xl',
    BORDER_COLORS: {
      DANGER: 'border-red-400',
      WARNING: 'border-orange-400',
      CAUTION: 'border-yellow-400',
      SAFE: 'border-pink-300',
    },
    SIZE: {
      MAX_SIZE: 'min(90vw, 70vh)',
      ASPECT_RATIO: '1',
    },
  },
  CELL: {
    BASE: 'relative w-full aspect-square cursor-pointer hover:bg-purple-100 transition-colors',
    BORDERS: {
      TOP: 'border-t border-purple-300 sm:border-t-2',
      RIGHT: 'border-r border-purple-300 sm:border-r-2',
      BOTTOM: 'border-b border-purple-300 sm:border-b-2',
      LEFT: 'border-l border-purple-300 sm:border-l-2',
    },
    BACKGROUNDS: {
      GOAL: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      NORMAL: 'bg-gradient-to-br from-blue-50 to-purple-50',
    },
    SIZE: {
      MIN_WIDTH: '8px',
      MIN_HEIGHT: '8px',
      FONT_SIZE: 'min(1rem, 3vw)',
    },
  },
  CONTROLS_CARD: {
    BASE: 'bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 rounded-lg sm:rounded-xl p-2 sm:p-4 border-2 border-blue-200 w-full max-w-md shadow-lg',
    GRID: 'grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm',
    TEXT: {
      MOBILE_CONTROLS: 'text-xs text-gray-500 mt-1 text-center block sm:hidden',
      GOAL: 'text-xs text-gray-600 mt-1 sm:mt-2 text-center',
    },
  },
} as const;

// Font family constant
export const GAME_FONT = 'Yomogi, cursive';