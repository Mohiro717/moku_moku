import React from 'react';
import type { ProjectCardProps } from '../types';

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
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

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-2 border-t-4 ${getAccentColorClass(project.accentColor)}`}>
      <div className="p-6">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-coffee-dark bg-coffee-light/20 rounded-full">
            {project.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-coffee-dark mb-3 font-serif">
          {project.title}
        </h3>
        <p className="text-coffee-dark/70 leading-relaxed">
          {project.description}
        </p>
      </div>
    </div>
  );
};