import React from 'react';
import type { ProjectCardProps } from '../types';

export const ProjectCard: React.FC<ProjectCardProps> = ({ work, index }) => {
  const getAccentColorClass = (color: string) => {
    switch (color) {
      case 'vivid-pink':
        return 'border-t-vivid-pink';
      case 'vivid-green':
        return 'border-t-vivid-green';
      case 'coffee-light':
        return 'border-t-coffee-light';
      default:
        return 'border-t-vivid-pink';
    }
  };

  const getPlaceholderImage = () => {
    const colors = ['#ff5d8f', '#00c9a7', '#d2b48c'];
    const color = colors[index % colors.length];
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect width="300" height="200" fill="${encodeURIComponent(color)}" opacity="0.3"/><text x="150" y="100" text-anchor="middle" dy="0.3em" fill="${encodeURIComponent(color)}" font-family="system-ui" font-size="18" font-weight="bold">${work.category}</text></svg>`;
  };

  return (
    <div className={`group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-2 border-t-4 ${getAccentColorClass(work.color)}`}>
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={getPlaceholderImage()}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-coffee-dark/80 rounded-full backdrop-blur-sm">
            {work.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-coffee-dark mb-2 font-serif group-hover:text-vivid-pink transition-colors duration-300">
          {work.title}
        </h3>
        <p className="text-sm text-coffee-mid/80 mb-3">
          by {work.author}
        </p>
        <p className="text-coffee-dark/70 leading-relaxed text-sm">
          {work.description}
        </p>
      </div>
    </div>
  );
};