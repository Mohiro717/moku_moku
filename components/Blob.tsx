import React from 'react';

interface BlobConfig {
  id: string;
  color: string;
  size: string;
  opacity: string;
  position: string;
  morphDuration: string;
  translateDuration: string;
  translateValues: string;
  comment: string;
}

const BLOB_CONFIGS: BlobConfig[] = [
  {
    id: 'pink-large',
    color: '#ff5d8f',
    size: 'w-44 h-44',
    opacity: 'opacity-10',
    position: 'top-12 left-12',
    morphDuration: '30s',
    translateDuration: '12s',
    translateValues: '100,100;105,95;100,100',
    comment: 'Large flowing blob - Pink with morphing animation'
  },
  {
    id: 'green-medium',
    color: '#00c9a7',
    size: 'w-40 h-40',
    opacity: 'opacity-9',
    position: 'top-20 right-16',
    morphDuration: '35s',
    translateDuration: '15s',
    translateValues: '100,100;95,105;100,100',
    comment: 'Medium flowing blob - Green with morphing animation'
  },
  {
    id: 'coffee-small',
    color: '#d2b48c',
    size: 'w-48 h-48',
    opacity: 'opacity-8',
    position: 'top-1/2 left-1/4',
    morphDuration: '40s',
    translateDuration: '18s',
    translateValues: '100,100;102,98;100,100',
    comment: 'Small accent blob - Coffee Light'
  },
  {
    id: 'red-pastel',
    color: '#ff8a95',
    size: 'w-52 h-52',
    opacity: 'opacity-9',
    position: 'bottom-16 left-16',
    morphDuration: '32s',
    translateDuration: '20s',
    translateValues: '100,100;108,92;100,100',
    comment: 'Pastel Red blob'
  },
  {
    id: 'orange-small',
    color: '#ffb366',
    size: 'w-44 h-44',
    opacity: 'opacity-8',
    position: 'top-1/3 right-1/4',
    morphDuration: '38s',
    translateDuration: '16s',
    translateValues: '100,100;97,103;100,100',
    comment: 'Small Orange blob'
  },
  {
    id: 'lavender-small',
    color: '#dab3ff',
    size: 'w-32 h-32',
    opacity: 'opacity-7',
    position: 'bottom-24 right-20',
    morphDuration: '42s',
    translateDuration: '22s',
    translateValues: '100,100;93,107;100,100',
    comment: 'Small Lavender blob'
  },
  {
    id: 'blue-center',
    color: '#7ec8e3',
    size: 'w-36 h-36',
    opacity: 'opacity-8',
    position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    morphDuration: '36s',
    translateDuration: '14s',
    translateValues: '100,100;103,97;100,100',
    comment: 'Center Blue blob'
  }
];

const MORPH_PATHS = [
  'M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,89.9,-16.3,89.1,-0.5C88.3,15.3,84.1,30.6,76.4,43.8C68.7,57,57.4,68.1,44.7,75.8C32,83.5,18,87.8,3.7,82.2C-10.6,76.6,-21.2,61.1,-33.9,53.4C-46.6,45.7,-61.4,45.8,-73.7,38.9C-86,32,-95.8,18.1,-97.8,3.2C-99.8,-11.7,-94,-26.6,-85.2,-39.8C-76.4,-53,-64.6,-64.5,-50.8,-71.7C-37,-78.9,-21.2,-81.8,-5.9,-73.2C9.4,-64.6,30.6,-83.6,44.7,-76.4Z',
  'M37.3,-63.7C48.7,-56.2,58.4,-45.6,64.8,-33.1C71.2,-20.6,74.3,-6.2,74.1,8.4C73.9,23,70.4,37.8,62.8,49.9C55.2,62,43.5,71.4,30.6,76.8C17.7,82.2,3.6,83.6,-11.4,81.4C-26.4,79.2,-42.3,73.4,-55.1,63.5C-67.9,53.6,-77.6,39.6,-82.4,24.1C-87.2,8.6,-87.1,-8.4,-82.9,-23.8C-78.7,-39.2,-70.4,-53,-58.9,-60.5C-47.4,-68,-32.7,-68.2,-19.3,-65.4C-5.9,-62.6,6.2,-56.8,37.3,-63.7Z',
  'M51.1,-58.7C65.2,-49.3,75.5,-32.8,79.4,-15.1C83.3,2.6,80.8,21.5,72.8,37.2C64.8,52.9,51.3,65.4,35.9,72.1C20.5,78.8,3.2,79.7,-13.8,77.3C-30.8,74.9,-47.5,69.2,-59.8,57.8C-72.1,46.4,-80,29.3,-82.1,11.4C-84.2,-6.5,-80.5,-25.2,-71.8,-40.8C-63.1,-56.4,-49.4,-68.9,-34.2,-77.9C-19,-86.9,-2.3,-92.4,13.7,-89.1C29.7,-85.8,37,-73.7,51.1,-58.7Z'
];

interface SingleBlobProps {
  config: BlobConfig;
  morphPaths: string[];
}

const SingleBlob: React.FC<SingleBlobProps> = ({ config, morphPaths }) => {
  const morphValues = `${morphPaths[0]};${morphPaths[1]};${morphPaths[2]};${morphPaths[0]}`;
  
  return (
    <svg
      className={`absolute ${config.position} ${config.size} ${config.opacity}`}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill={config.color}>
        <animate
          attributeName="d"
          values={morphValues}
          dur={config.morphDuration}
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values={config.translateValues}
          dur={config.translateDuration}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

export const Blob: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {BLOB_CONFIGS.map((config) => (
        <SingleBlob
          key={config.id}
          config={config}
          morphPaths={MORPH_PATHS}
        />
      ))}
    </div>
  );
};