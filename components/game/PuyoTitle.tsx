import React from 'react';
import { Puyo } from './Puyo';
import './wapop.css';

/** ゲームえらびのカードの見出し：4色のぷよが並んで、ゆっくり息をする */
export const PuyoTitle: React.FC = () => (
  <div className="mb-5 text-center">
    <div className="flex justify-center gap-1 mb-3" aria-hidden="true">
      {(['red', 'yellow', 'green', 'blue'] as const).map(color => (
        <Puyo key={color} color={color} idle />
      ))}
    </div>
    <h3 className="font-serif text-3xl text-coffee-dark leading-none">ぬばたま落とし</h3>
    <div className="mt-2 text-xs tracking-[0.3em] text-coffee-dark/60 font-serif">NUBATAMA OTOSHI</div>
  </div>
);
