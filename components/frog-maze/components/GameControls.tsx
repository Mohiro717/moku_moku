import React from 'react';
import { GAME_TEXT, MAZE_STYLES, GAME_FONT } from '../constants/gameConstants';

export const GameControls: React.FC = () => {
  return (
    <div className={MAZE_STYLES.CONTROLS_CARD.BASE}>
      <div className={MAZE_STYLES.CONTROLS_CARD.GRID} style={{ fontFamily: GAME_FONT }}>
        <div>{GAME_TEXT.LEGEND.PLAYER}</div>
        <div>{GAME_TEXT.LEGEND.ORB}</div>
        <div>{GAME_TEXT.LEGEND.TRAP}</div>
        <div>{GAME_TEXT.LEGEND.MONSTER}</div>
      </div>
      <p 
        className={MAZE_STYLES.CONTROLS_CARD.TEXT.MOBILE_CONTROLS}
        style={{ fontFamily: GAME_FONT }}
      >
        {GAME_TEXT.STATUS.MOBILE_CONTROLS}
      </p>
      <p 
        className={MAZE_STYLES.CONTROLS_CARD.TEXT.GOAL}
        style={{ fontFamily: GAME_FONT }}
      >
        {GAME_TEXT.GOAL}
      </p>
    </div>
  );
};