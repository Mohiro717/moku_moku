import React from 'react';

export const Blob: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-1/4 left-1/4 w-96 h-96 opacity-20"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#00c9a7"
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,89.9,-16.3,89.1,-0.5C88.3,15.3,84.1,30.6,76.4,43.8C68.7,57,57.4,68.1,44.7,75.8C32,83.5,18,87.8,3.7,82.2C-10.6,76.6,-21.2,61.1,-33.9,53.4C-46.6,45.7,-61.4,45.8,-73.7,38.9C-86,32,-95.8,18.1,-97.8,3.2C-99.8,-11.7,-94,-26.6,-85.2,-39.8C-76.4,-53,-64.6,-64.5,-50.8,-71.7C-37,-78.9,-21.2,-81.8,-5.9,-73.2C9.4,-64.6,30.6,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="20s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      
      <svg
        className="absolute top-3/4 right-1/4 w-64 h-64 opacity-15"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#ff5d8f"
          d="M37.3,-63.7C48.7,-56.2,58.4,-45.6,64.8,-33.1C71.2,-20.6,74.3,-6.2,74.1,8.4C73.9,23,70.4,37.8,62.8,49.9C55.2,62,43.5,71.4,30.6,76.8C17.7,82.2,3.6,83.6,-11.4,81.4C-26.4,79.2,-42.3,73.4,-55.1,63.5C-67.9,53.6,-77.6,39.6,-82.4,24.1C-87.2,8.6,-87.1,-8.4,-82.9,-23.8C-78.7,-39.2,-70.4,-53,-58.9,-60.5C-47.4,-68,-32.7,-68.2,-19.3,-65.4C-5.9,-62.6,6.2,-56.8,37.3,-63.7Z"
          transform="translate(100 100)"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="360 100 100"
            to="0 100 100"
            dur="25s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};