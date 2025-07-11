
import React from 'react';
import { Work } from '../types';

interface ProjectCardProps {
  work: Work;
  borderColor: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ work, borderColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className={`w-full h-3 ${borderColor.replace('border-', 'bg-')}`}></div>
      <img src={work.imageUrl} alt={work.title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-coffee-dark mb-2">{work.title}</h3>
        <p className="text-sm font-bold text-coffee-light mb-3">{work.author}</p>
        <p className="text-coffee-mid leading-relaxed">{work.description}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
