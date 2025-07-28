import React from 'react';
import { GAME_TEXT, MAZE_STYLES, GAME_FONT } from '../constants/gameConstants';

interface GameStatusProps {
  orbsCollected: number;
  totalOrbs: number;
  gameOver: boolean;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  orbsCollected,
  totalOrbs,
  gameOver,
}) => {
  return (
    <div className={MAZE_STYLES.STATUS_CARD.BASE}>
      <div className="text-center">
        <p 
          className={MAZE_STYLES.STATUS_CARD.TEXT.TITLE}
          style={{ fontFamily: GAME_FONT }}
        >
          {GAME_TEXT.STATUS.ORB_COUNT}: {orbsCollected} / {totalOrbs}
        </p>
        <p 
          className={MAZE_STYLES.STATUS_CARD.TEXT.CONTROLS}
          style={{ fontFamily: GAME_FONT }}
        >
          <span className="hidden sm:inline">{GAME_TEXT.STATUS.PC_CONTROLS}</span>
        </p>
        {gameOver && (
          <p 
            className={MAZE_STYLES.STATUS_CARD.TEXT.GAME_OVER}
            style={{ fontFamily: GAME_FONT }}
          >
            {GAME_TEXT.STATUS.GAME_OVER}
          </p>
        )}
      </div>
    </div>
  );
};