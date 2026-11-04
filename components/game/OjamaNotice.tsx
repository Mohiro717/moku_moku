import React, { memo } from 'react';

// 降る予定のおじゃまの予告。大きい単位から順に並べ、最大 MAX_ICONS 個まで出す。
const UNITS = [
  { size: 30, className: 'w-7 h-7 bg-gray-700 border-red-400 text-sm' }, // 5段
  { size: 6, className: 'w-6 h-6 bg-gray-500 border-gray-600 text-xs' }, // 1段
  { size: 1, className: 'w-4 h-4 bg-gray-400 border-gray-500 text-[8px]' }
];
const MAX_ICONS = 6;

const toIcons = (count: number): string[] => {
  const icons: string[] = [];
  let rest = count;
  for (const unit of UNITS) {
    while (rest >= unit.size && icons.length < MAX_ICONS) {
      icons.push(unit.className);
      rest -= unit.size;
    }
  }
  return icons;
};

export const OjamaNotice: React.FC<{ count: number }> = memo(({ count }) => (
  <div className="h-8 mb-2 flex items-center justify-center gap-1" aria-label={`おじゃま予告 ${count}個`}>
    {count > 0 && (
      <>
        {toIcons(count).map((className, i) => (
          <div key={i} className={`${className} rounded-full border-2 flex items-center justify-center`}>
            <span className="select-none leading-none">😈</span>
          </div>
        ))}
        <span className="ml-1 text-xs font-serif text-coffee-dark">×{count}</span>
      </>
    )}
  </div>
));
