
import React from 'react';

export const GameControllerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="M16.5 8.5h.01M6.5 12.5h.01M17.5 12.5h.01M2 12h2M20 12h2"/>
        <path d="M15.5 5.5c-1.2-1.2-2.8-2-4.5-2s-3.3.8-4.5 2"/>
        <path d="M8.5 15.5c1.2 1.2 2.8 2 4.5 2s3.3-.8 4.5-2"/>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
        <path d="M8.5 8.5v5h-2v-5zM17.5 8.5v5h-2v-5z"/>
    </svg>
);
